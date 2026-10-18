import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, UserRound } from "lucide-react";
import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import Button from "../../ui/Button";
import { fetchSiteBookingSlots, submitSiteBookingRequest } from "../../utils/siteBookingApi";
import { defaultPhonePlaceholder, formatInternationalPhoneInput, validateInternationalPhoneInput } from "../../utils/internationalPhone";
import "./BookingSection.css";

const DAYS_IN_CAROUSEL = 28;
const COPY = {
  pl: { anyMaster: "Dowolny specjalista", back: "Wróć do terminu", callNow: "Zadzwoń teraz", date: "Wybierz dzień", datePicker: "Inna data", dayStep: "Termin", detailsStep: "Twoje dane", disabledTitle: "Rezerwacja telefoniczna", fallback: "Nie widzisz odpowiedniej godziny?", formIntro: "Wybierz zabieg i dogodny termin. Po wysłaniu prośby skontaktujemy się z Tobą, aby potwierdzić wizytę.", master: "Specjalista", next: "Dalej — Twoje dane", price: "Cena", requestNote: "To prośba o termin — wizyta zostanie potwierdzona przez zespół NUAR.", showLess: "Pokaż mniej", showMore: "Pokaż wszystkie godziny", summary: "Twój wybór", time: "Dostępne godziny", title: "Zarezerwuj chwilę dla siebie", viaBooksy: "Otwórz Booksy" },
  en: { anyMaster: "Any specialist", back: "Back to time", callNow: "Call now", date: "Choose a day", datePicker: "Another date", dayStep: "Appointment", detailsStep: "Your details", disabledTitle: "Booking by phone", fallback: "Need a different time?", formIntro: "Choose a treatment and a convenient time. We will contact you to confirm the visit after your request.", master: "Specialist", next: "Continue — Your details", price: "Price", requestNote: "This is a booking request — the NUAR team will confirm your visit.", showLess: "Show less", showMore: "Show all times", summary: "Your selection", time: "Available times", title: "Reserve a moment for yourself", viaBooksy: "Open Booksy" },
  uk: { anyMaster: "Будь-який спеціаліст", back: "Повернутися до часу", callNow: "Зателефонувати", date: "Оберіть день", datePicker: "Інша дата", dayStep: "Візит", detailsStep: "Ваші дані", disabledTitle: "Запис телефоном", fallback: "Потрібен інший час?", formIntro: "Оберіть процедуру та зручний час. Після запиту ми зв’яжемося з вами для підтвердження візиту.", master: "Спеціаліст", next: "Далі — Ваші дані", price: "Вартість", requestNote: "Це запит на запис — команда NUAR окремо підтвердить ваш візит.", showLess: "Показати менше", showMore: "Показати всі години", summary: "Ваш вибір", time: "Вільний час", title: "Забронюйте час для себе", viaBooksy: "Відкрити Booksy" },
};
const LOCALES = { pl: "pl-PL", en: "en-GB", uk: "uk-UA" };

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function fromInputDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}
function addDays(value, amount) {
  const date = typeof value === "string" ? fromInputDate(value) : new Date(value);
  date.setDate(date.getDate() + amount);
  return toInputDate(date);
}
function getTomorrowInputDate() { return addDays(new Date(), 1); }
function getServiceDurations(service) {
  return (service?.time ?? []).map((minutes, index) => ({ minutes: Number(minutes), price: Number(service?.price?.[index]) || 0 })).filter((item) => item.minutes > 30);
}
function normalizeSlotTime(value) { return String(value ?? "").trim().slice(0, 5); }
function getSlotKey(slot) { return `${slot.startTime}|${slot.master}`; }
const NORMALIZE_MASTER_DISPLAY = { "ольга": "Olha", "максим": "Max", "olga": "Olha", "max": "Max" };
function formatMasterDisplay(value) {
  const raw = String(value ?? "").trim();
  return NORMALIZE_MASTER_DISPLAY[raw.toLowerCase()] || raw;
}
function formatMasterWithTier(value) {
  const name = formatMasterDisplay(value);
  if (!name) return "";
  const isTopMaster = /top/i.test(name) || /olha|olga|ольга/i.test(name);
  return isTopMaster ? `${name} (Top Master)` : `${name} (Master)`;
}
const DEFAULT_KNOWN_MASTERS = ["Olha", "Max"];
function getSlotColumns() {
  if (typeof window === "undefined") return 8;
  if (window.innerWidth <= 360) return 2;
  if (window.innerWidth <= 640) return 3;
  if (window.innerWidth <= 900) return 4;
  return 8;
}
function Field({ children, id, label, optional }) {
  return <label className="booking-field" htmlFor={id}><span>{label}{optional ? <small>{optional}</small> : null}</span>{children}</label>;
}

export default function BookingSection() {
  const { t, lang, localizedServices } = useTranslation();
  const { contact } = useContent();
  const copy = COPY[lang] ?? COPY.pl;
  const siteBookingEnabled = contact?.siteBookingEnabled !== false;
  const defaultServiceSlug = localizedServices[0]?.slug ?? "";
  const dateInputRef = useRef(null);
  const datesRef = useRef(null);
  const slotsRef = useRef(null);
  const [step, setStep] = useState(1);
  const [dateWindowStart, setDateWindowStart] = useState(getTomorrowInputDate);
  const [dateScroll, setDateScroll] = useState({ left: false, right: true });
  const [slotScroll, setSlotScroll] = useState({ left: false, right: false });
  const [slotColumns, setSlotColumns] = useState(getSlotColumns);
  const [knownMasters, setKnownMasters] = useState(DEFAULT_KNOWN_MASTERS);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [form, setForm] = useState({ clientEmail: "", clientName: "", clientPhone: "", durationMinutes: "", note: "", preferredDate: getTomorrowInputDate(), preferredMaster: "", preferredTime: "", serviceSlug: defaultServiceSlug });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [submitState, setSubmitState] = useState({ error: "", loading: false, success: false });

  useEffect(() => {
    if (!form.serviceSlug && defaultServiceSlug) setForm((current) => ({ ...current, serviceSlug: defaultServiceSlug }));
  }, [defaultServiceSlug, form.serviceSlug]);

  const selectedService = useMemo(() => localizedServices.find((service) => service.slug === form.serviceSlug) ?? localizedServices[0], [form.serviceSlug, localizedServices]);
  const durationOptions = useMemo(() => getServiceDurations(selectedService), [selectedService]);
  const dateOptions = useMemo(() => Array.from({ length: DAYS_IN_CAROUSEL }, (_, index) => addDays(dateWindowStart, index)), [dateWindowStart]);

  useEffect(() => {
    setForm((current) => {
      if (!selectedService) return current;
      const valid = durationOptions.some((item) => String(item.minutes) === String(current.durationMinutes));
      return { ...current, durationMinutes: valid ? current.durationMinutes : String(durationOptions[0]?.minutes ?? ""), preferredTime: "" };
    });
  }, [selectedService, durationOptions]);
  useEffect(() => {
    if (!siteBookingEnabled || !selectedService || !form.durationMinutes || !form.preferredDate) { setSlots([]); return undefined; }
    const controller = new AbortController();
    setSlotsLoading(true); setSlotsError("");
    fetchSiteBookingSlots({ durationMinutes: Number(form.durationMinutes), preferredDate: form.preferredDate, preferredMaster: form.preferredMaster, serviceName: selectedService.title, serviceSlug: selectedService.slug })
      .then((data) => {
        const rawSlots = Array.isArray(data?.slots) ? data.slots : [];
        const nextSlots = rawSlots.map((slot) => {
          const master = formatMasterDisplay(slot.master);
          const isTopMaster = /top/i.test(master) || /olha/i.test(master);
          const duration = Number(form.durationMinutes) || 60;
          const calculatedPrice = isTopMaster
            ? (selectedService?.prices?.topMaster?.[duration] ?? (duration === 60 ? 310 : duration === 75 ? 350 : duration === 90 ? 370 : 470))
            : (selectedService?.prices?.master?.[duration] ?? (duration === 60 ? 200 : duration === 75 ? 250 : duration === 90 ? 280 : 360));

          const finalPrice = calculatedPrice > 0 ? calculatedPrice : Number(slot.finalPrice) || 200;
          return {
            ...slot,
            master,
            basePrice: finalPrice,
            finalPrice,
          };
        }).sort((a, b) => normalizeSlotTime(a.startTime).localeCompare(normalizeSlotTime(b.startTime)) || a.master.localeCompare(b.master));

        setSlots(nextSlots);
        const apiMasters = Array.isArray(data?.masters) && data.masters.length
          ? data.masters.map(formatMasterDisplay).filter(Boolean)
          : [...new Set(nextSlots.map((slot) => String(slot.master ?? "").trim()).filter(Boolean))];
        if (apiMasters.length) {
          setKnownMasters((current) => [...new Set([...current, ...apiMasters])]);
        }
      })
      .catch(() => { if (!controller.signal.aborted) { setSlots([]); setSlotsError(t("booking.form.errorSlots")); } })
      .finally(() => { if (!controller.signal.aborted) setSlotsLoading(false); });
    return () => controller.abort();
  }, [availabilityVersion, form.durationMinutes, form.preferredDate, form.preferredMaster, selectedService, siteBookingEnabled, t]);

  const selectedSlot = slots.find((slot) => getSlotKey(slot) === form.preferredTime);
  const visibleSlots = useMemo(() => {
    if (form.preferredMaster) {
      return [...slots].sort(
        (a, b) =>
          normalizeSlotTime(a.startTime).localeCompare(normalizeSlotTime(b.startTime)) ||
          String(a.master).localeCompare(String(b.master))
      );
    }

    const bestByTime = new Map();
    for (const slot of slots) {
      const time = normalizeSlotTime(slot.startTime);
      const current = bestByTime.get(time);
      const slotPrice = Number(slot.finalPrice) || 0;
      const currentPrice = Number(current?.finalPrice) || 0;
      if (!current || slotPrice < currentPrice || (slotPrice === currentPrice && String(slot.master).localeCompare(String(current.master)) < 0)) {
        bestByTime.set(time, slot);
      }
    }

    return [...bestByTime.values()].sort((a, b) =>
      normalizeSlotTime(a.startTime).localeCompare(normalizeSlotTime(b.startTime))
    );
  }, [form.preferredMaster, slots]);
  const slotPages = useMemo(() => {
    const pageSize = slotColumns * 2;
    return Array.from({ length: Math.ceil(visibleSlots.length / pageSize) }, (_, index) => visibleSlots.slice(index * pageSize, (index + 1) * pageSize));
  }, [slotColumns, visibleSlots]);
  const availablePrices = useMemo(() => [...new Set(slots.map((slot) => Number(slot.finalPrice)).filter((price) => price > 0))].sort((a, b) => a - b), [slots]);
  const selectedDurationOption = useMemo(
    () => durationOptions.find((item) => String(item.minutes) === String(form.durationMinutes)),
    [durationOptions, form.durationMinutes]
  );
  const selectedMasterIsTop = /top/i.test(form.preferredMaster) || /olha|olga|ольга/i.test(form.preferredMaster);
  const durationNum = Number(form.durationMinutes) || 60;
  const masterPriceForDuration = selectedMasterIsTop
    ? (selectedService?.prices?.topMaster?.[durationNum] ?? selectedService?.priceTopMaster?.[selectedService?.time?.indexOf(durationNum)] ?? 310)
    : (selectedService?.prices?.master?.[durationNum] ?? selectedDurationOption?.price);
  const slotFinalPrice = Number(selectedSlot?.finalPrice) || 0;
  const activePrice = slotFinalPrice > 0 ? slotFinalPrice : masterPriceForDuration || availablePrices[0] || 0;
  const activePriceLabel = activePrice > 0 ? `${activePrice} zł` : "—";
  const updateField = (name, value) => {
    setSubmitState((current) => ({ ...current, error: "", success: false }));
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(["serviceSlug", "durationMinutes", "preferredDate", "preferredMaster"].includes(name) ? { preferredTime: "" } : null),
    }));
  };
  const handlePhoneChange = (event) => updateField("clientPhone", formatInternationalPhoneInput(event.target.value));
  const handleDateChange = (value) => { updateField("preferredDate", value); if (!dateOptions.includes(value)) setDateWindowStart(value); };
  const updateDateScroll = () => {
    const element = datesRef.current;
    if (!element) return;
    setDateScroll({ left: element.scrollLeft > 2, right: element.scrollLeft + element.clientWidth < element.scrollWidth - 2 });
  };
  const scrollDates = (direction) => datesRef.current?.scrollBy({ behavior: "smooth", left: direction * Math.max(260, datesRef.current.clientWidth * 0.8) });
  const updateSlotScroll = () => {
    const element = slotsRef.current;
    if (!element) return;
    setSlotScroll({ left: element.scrollLeft > 2, right: element.scrollLeft + element.clientWidth < element.scrollWidth - 2 });
  };
  const scrollSlots = (direction) => slotsRef.current?.scrollBy({ behavior: "smooth", left: direction * slotsRef.current.clientWidth });
  useEffect(() => {
    const handleResize = () => setSlotColumns(getSlotColumns());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    slotsRef.current?.scrollTo({ left: 0 });
    const frame = window.requestAnimationFrame(updateSlotScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [slotColumns, visibleSlots.length, form.preferredDate]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(updateDateScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [dateWindowStart]);
  const validateSelection = () => {
    if (!selectedService) return t("booking.form.errorService");
    if (!form.durationMinutes) return t("booking.form.errorDuration");
    if (!form.preferredDate || !form.preferredTime) return t("booking.form.errorDateTime");
    if (!selectedSlot) return t("booking.form.errorSlot");
    return "";
  };
  const validateForm = () => {
    const selectionError = validateSelection(); if (selectionError) return selectionError;
    if (form.clientName.trim().length < 2) return t("booking.form.errorName");
    const phone = validateInternationalPhoneInput(form.clientPhone);
    if (phone.reason === "empty") return t("booking.form.errorPhoneRequired");
    if (phone.reason === "missing_plus") return t("booking.form.errorPhonePlus");
    if (!phone.ok) return t("booking.form.errorPhone");
    return "";
  };
  const goToDetails = () => {
    const error = validateSelection();
    if (error) { setSubmitState({ error, loading: false, success: false }); return; }
    setSubmitState({ error: "", loading: false, success: false }); setStep(2);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step !== 2) { goToDetails(); return; }
    const error = validateForm();
    if (error) { setSubmitState({ error, loading: false, success: false }); return; }
    const phone = validateInternationalPhoneInput(form.clientPhone);
    setSubmitState({ error: "", loading: true, success: false });
    try {
      await submitSiteBookingRequest({ clientEmail: form.clientEmail.trim(), clientName: form.clientName.trim(), clientPhone: phone.e164, durationMinutes: Number(form.durationMinutes), finalPrice: slotFinalPrice, locale: lang, note: form.note.trim(), preferredDate: form.preferredDate, preferredMaster: selectedSlot.master, preferredTime: selectedSlot.startTime, serviceName: selectedService.title, serviceSlug: selectedService.slug });
      setSubmitState({ error: "", loading: false, success: true });
    } catch {
      setForm((current) => ({ ...current, preferredTime: "" })); setSubmitState({ error: t("booking.form.errorSubmit"), loading: false, success: false }); setStep(1); setAvailabilityVersion((current) => current + 1);
    }
  };
  const resetAfterSuccess = () => {
    setSubmitState({ error: "", loading: false, success: false }); setStep(1);
    setForm((current) => ({ ...current, clientEmail: "", clientName: "", clientPhone: "", note: "", preferredTime: "" }));
  };
  const formattedDate = form.preferredDate ? new Intl.DateTimeFormat(LOCALES[lang] ?? LOCALES.pl, { day: "numeric", month: "long", year: "numeric" }).format(fromInputDate(form.preferredDate)) : "";

  return (
    <section id="contact" className="booking-section">
      <SiteImage src="/booking/booking.jpg" alt="" fill className="booking-section__image" loading="lazy" aria-hidden="true" />
      <div className="booking-section__veil" />
      <Container className="booking-section__container"><ScrollAnimationWrapper className="booking-shell">
        <header className="booking-intro"><p className="section-label text-gold">{t("booking.label")}</p><h2>{copy.title}</h2><p>{copy.formIntro}</p></header>
        <form className="booking-panel" onSubmit={handleSubmit} noValidate>
          {!siteBookingEnabled ? (
            <div className="booking-state"><CalendarDays aria-hidden="true" /><h3>{copy.disabledTitle}</h3><p>{t("booking.disabledMessage")}</p><Button href={`tel:${contact.phone}`} size="lg">{copy.callNow}: {contact.phoneDisplay}</Button></div>
          ) : submitState.success ? (
            <div className="booking-state" role="status"><span className="booking-success-mark"><Check /></span><h3>{t("booking.form.successTitle")}</h3><p>{t("booking.form.successMessage")}</p><div className="booking-confirmation-card"><strong>{selectedService?.title}</strong><span>{formattedDate} · {selectedSlot?.startTime} · {formatMasterWithTier(selectedSlot?.master)}</span></div><Button size="sm" type="button" onClick={resetAfterSuccess}>{t("booking.form.successClose")}</Button></div>
          ) : <>
            <div className="booking-progress"><button className={step === 1 ? "is-active" : "is-complete"} type="button" onClick={() => setStep(1)}><span>{step === 2 ? <Check size={14} /> : "1"}</span>{copy.dayStep}</button><i /><button className={step === 2 ? "is-active" : ""} type="button" disabled={step === 1} onClick={() => setStep(2)}><span>2</span>{copy.detailsStep}</button></div>
            {step === 1 ? (
              <div className="booking-step">
                <div className="booking-selection-grid">
                  <Field id="booking-master" label={copy.master}><select id="booking-master" value={form.preferredMaster} onChange={(event) => updateField("preferredMaster", event.target.value)}><option value="">{copy.anyMaster}</option>{knownMasters.map((master) => <option key={master} value={master}>{formatMasterWithTier(master)}</option>)}</select></Field>
                  <Field id="booking-service" label={t("booking.form.service")}><select id="booking-service" value={form.serviceSlug} onChange={(event) => updateField("serviceSlug", event.target.value)}>{localizedServices.map((service) => <option key={service.slug} value={service.slug}>{service.title}</option>)}</select></Field>
                  <fieldset className="booking-field booking-duration"><legend>{t("booking.form.duration")}</legend><div className="booking-segments">{durationOptions.map((item) => <button aria-pressed={String(item.minutes) === String(form.durationMinutes)} className={String(item.minutes) === String(form.durationMinutes) ? "is-active" : ""} key={item.minutes} type="button" onClick={() => updateField("durationMinutes", String(item.minutes))}><strong>{item.minutes}</strong><span>min</span></button>)}</div></fieldset>
                </div>
                <div className="booking-schedule">
                  <div className="booking-block-heading"><div><span>01</span><h3>{copy.date}</h3></div><button className="booking-date-picker" type="button" onClick={() => dateInputRef.current?.showPicker?.()}><CalendarDays size={17} />{copy.datePicker}<input ref={dateInputRef} min={getTomorrowInputDate()} type="date" value={form.preferredDate} onChange={(event) => handleDateChange(event.target.value)} /></button></div>
                  <div className="booking-date-row"><button aria-label="Previous dates" disabled={!dateScroll.left} type="button" onClick={() => scrollDates(-1)}><ChevronLeft /></button><div ref={datesRef} className="booking-date-strip" onScroll={updateDateScroll}>{dateOptions.map((dateValue) => { const date = fromInputDate(dateValue); const locale = LOCALES[lang] ?? LOCALES.pl; return <button aria-pressed={form.preferredDate === dateValue} className={form.preferredDate === dateValue ? "is-active" : ""} key={dateValue} type="button" onClick={() => handleDateChange(dateValue)}><span>{new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date)}</span><strong>{date.getDate()}</strong><small>{new Intl.DateTimeFormat(locale, { month: "short" }).format(date)}</small></button>; })}</div><button aria-label="Next dates" disabled={!dateScroll.right} type="button" onClick={() => scrollDates(1)}><ChevronRight /></button></div>
                  <div className="booking-block-heading booking-time-heading"><div><span>02</span><h3>{copy.time}</h3></div>{slotsLoading ? <small>{t("booking.form.slotsLoading")}</small> : <div className="booking-slot-controls"><button aria-label="Previous times" disabled={!slotScroll.left} type="button" onClick={() => scrollSlots(-1)}><ChevronLeft /></button><button aria-label="Next times" disabled={!slotScroll.right} type="button" onClick={() => scrollSlots(1)}><ChevronRight /></button></div>}</div>
                  <div ref={slotsRef} className="booking-slots" aria-busy={slotsLoading} onScroll={updateSlotScroll}>{!slotsLoading && !visibleSlots.length ? <div className="booking-empty"><Clock3 /><span>{slotsError || t("booking.form.noSlots")}</span></div> : slotPages.map((pageSlots, pageIndex) => <div className="booking-slot-page" key={`${form.preferredDate}-${pageIndex}`} style={{ "--booking-slot-columns": slotColumns }}>{pageSlots.map((slot) => { const slotKey = getSlotKey(slot); const active = form.preferredTime === slotKey; return <button aria-pressed={active} className={active ? "is-active" : ""} key={`${slot.master}-${slot.startTime}`} type="button" onClick={() => updateField("preferredTime", slotKey)}><strong>{normalizeSlotTime(slot.startTime)}</strong><span>{formatMasterWithTier(slot.master)} · {Number(slot.finalPrice) || 0} zł</span>{active ? <Check size={15} /> : null}</button>; })}</div>)}</div>
                </div>
                {submitState.error ? <p className="booking-error" role="alert">{submitState.error}</p> : null}
                <div className="booking-actions booking-actions--step-one">
                  <div className="booking-actions__price">
                    <span className="booking-actions__price-label">{copy.price}</span>
                    <strong className="booking-actions__price-value">{activePriceLabel}</strong>
                  </div>
                  <Button disabled={slotsLoading || !selectedSlot} size="lg" type="button" onClick={goToDetails}>{copy.next}<ChevronRight size={17} /></Button>
                </div>
              </div>
            ) : (
              <div className="booking-step booking-step--details">
                <div className="booking-details-main"><button className="booking-back" type="button" onClick={() => setStep(1)}><ChevronLeft size={17} />{copy.back}</button><div className="booking-contact-grid">
                  <Field id="booking-name" label={t("booking.form.name")}><input id="booking-name" autoComplete="name" value={form.clientName} onChange={(event) => updateField("clientName", event.target.value)} /></Field>
                  <Field id="booking-phone" label={t("booking.form.phone")}><input id="booking-phone" autoComplete="tel" inputMode="tel" placeholder={defaultPhonePlaceholder(lang)} value={form.clientPhone} onChange={handlePhoneChange} /></Field>
                  <Field id="booking-email" label={t("booking.form.email")} optional={t("booking.form.optional")}><input id="booking-email" autoComplete="email" type="email" value={form.clientEmail} onChange={(event) => updateField("clientEmail", event.target.value)} /></Field>
                  <Field id="booking-note" label={t("booking.form.note")} optional={t("booking.form.optional")}><textarea id="booking-note" rows="3" value={form.note} onChange={(event) => updateField("note", event.target.value)} /></Field>
                </div>{submitState.error ? <p className="booking-error" role="alert">{submitState.error}</p> : null}</div>
                <aside className="booking-summary"><span className="booking-summary__eyebrow">{copy.summary}</span><h3>{selectedService?.title}</h3><dl><div><dt><Clock3 size={16} />{t("booking.form.duration")}</dt><dd>{form.durationMinutes} min</dd></div><div><dt><CalendarDays size={16} />{copy.date}</dt><dd>{formattedDate}<br />{selectedSlot?.startTime}</dd></div><div><dt><UserRound size={16} />{copy.master}</dt><dd>{formatMasterWithTier(selectedSlot?.master)}</dd></div><div className="booking-summary__price"><dt>{copy.price}</dt><dd>{slotFinalPrice > 0 ? `${slotFinalPrice} zł` : "—"}</dd></div></dl><p>{copy.requestNote}</p><Button className="booking-submit" disabled={submitState.loading} size="lg" type="submit">{submitState.loading ? t("booking.form.submitting") : t("booking.form.submit")}</Button></aside>
              </div>
            )}
          </>}
        </form>
      </ScrollAnimationWrapper></Container>
    </section>
  );
}
