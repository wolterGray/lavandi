import { useEffect, useMemo, useState } from "react";
import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import Button from "../../ui/Button";
import { BOOKSY_URL } from "../../constants/theme";
import { fetchSiteBookingSlots, submitSiteBookingRequest } from "../../utils/siteBookingApi";
import {
  defaultPhonePlaceholder,
  formatInternationalPhoneInput,
  validateInternationalPhoneInput,
} from "../../utils/internationalPhone";

const MASTER_OPTIONS = ["Ольга", "Максим"];
const VISIBLE_SLOT_COUNT = 8;

const LOCAL_COPY = {
  pl: {
    anyMaster: "Dowolny specjalista",
    compactHint: "Wybierz usługę i jeden z najbliższych wolnych terminów. Potwierdzimy wizytę po otrzymaniu zgłoszenia.",
    contactTitle: "Dane do potwierdzenia",
    dateLabel: "Data",
    fallback: "Nie widzisz wygodnej godziny?",
    slotsTitle: "Najbliższe wolne terminy",
    timeHint: "Pokazujemy tylko najwygodniejsze godziny dla wybranego dnia.",
    viaBooksy: "Otwórz Booksy",
  },
  en: {
    anyMaster: "Any specialist",
    compactHint: "Choose a ritual and one of the closest available times. We will confirm the visit after receiving your request.",
    contactTitle: "Confirmation details",
    dateLabel: "Date",
    fallback: "Need another time?",
    slotsTitle: "Nearest available times",
    timeHint: "Only the most useful times for the selected day are shown.",
    viaBooksy: "Open Booksy",
  },
  uk: {
    anyMaster: "Будь-який спеціаліст",
    compactHint: "Оберіть ритуал і найближчий зручний час. Ми підтвердимо візит після отримання заявки.",
    contactTitle: "Дані для підтвердження",
    dateLabel: "Дата",
    fallback: "Потрібен інший час?",
    slotsTitle: "Найближчі вільні години",
    timeHint: "Показуємо тільки найзручніші години для обраного дня.",
    viaBooksy: "Відкрити Booksy",
  },
};

function getTomorrowInputDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toInputDate(date);
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getServiceDurations(service) {
  return (service?.time ?? [])
    .map((minutes, index) => ({
      minutes: Number(minutes),
      price: Number(service?.price?.[index]) || 0,
    }))
    .filter((item) => item.minutes > 0);
}

function getSlotKey(slot) {
  return `${slot.startTime}|${slot.master}`;
}

function Field({ children, id, label }) {
  return (
    <label className="block text-left text-sm font-medium text-milk/90" htmlFor={id}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function BookingSection() {
  const { t, lang, localizedServices } = useTranslation();
  const { contact } = useContent();
  const copy = LOCAL_COPY[lang] ?? LOCAL_COPY.pl;
  const defaultServiceSlug = localizedServices[0]?.slug ?? "";
  const [form, setForm] = useState({
    clientEmail: "",
    clientName: "",
    clientPhone: "",
    durationMinutes: "",
    note: "",
    preferredDate: getTomorrowInputDate(),
    preferredMaster: "",
    preferredTime: "",
    serviceSlug: defaultServiceSlug,
  });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [submitState, setSubmitState] = useState({ error: "", loading: false, success: false });

  useEffect(() => {
    if (!form.serviceSlug && defaultServiceSlug) {
      setForm((current) => ({ ...current, serviceSlug: defaultServiceSlug }));
    }
  }, [defaultServiceSlug, form.serviceSlug]);

  const selectedService = useMemo(
    () => localizedServices.find((service) => service.slug === form.serviceSlug) ?? localizedServices[0],
    [form.serviceSlug, localizedServices],
  );
  const durationOptions = useMemo(() => getServiceDurations(selectedService), [selectedService]);

  useEffect(() => {
    setForm((current) => {
      if (!selectedService) return current;
      const hasDuration = durationOptions.some((item) => String(item.minutes) === String(current.durationMinutes));
      return {
        ...current,
        durationMinutes: hasDuration ? current.durationMinutes : String(durationOptions[0]?.minutes ?? ""),
        preferredTime: "",
      };
    });
  }, [selectedService, durationOptions]);

  useEffect(() => {
    if (!selectedService || !form.durationMinutes || !form.preferredDate) {
      setSlots([]);
      return undefined;
    }

    const controller = new AbortController();
    setSlotsLoading(true);
    setSlotsError("");

    fetchSiteBookingSlots({
      durationMinutes: Number(form.durationMinutes),
      preferredDate: form.preferredDate,
      preferredMaster: form.preferredMaster,
      serviceName: selectedService.title,
      serviceSlug: selectedService.slug,
    })
      .then((data) => {
        if (controller.signal.aborted) return;
        setSlots(Array.isArray(data?.slots) ? data.slots : []);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setSlots([]);
        setSlotsError(t("booking.form.errorSlots"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });

    return () => controller.abort();
  }, [form.durationMinutes, form.preferredDate, form.preferredMaster, selectedService, t]);

  const selectedSlot = slots.find((slot) => getSlotKey(slot) === form.preferredTime);
  const visibleSlots = slots.slice(0, VISIBLE_SLOT_COUNT);

  const updateField = (name, value) => {
    setSubmitState((current) => ({ ...current, error: "", success: false }));
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "serviceSlug" || name === "durationMinutes" || name === "preferredDate" || name === "preferredMaster"
        ? { preferredTime: "" }
        : null),
    }));
  };

  const handlePhoneChange = (event) => {
    updateField("clientPhone", formatInternationalPhoneInput(event.target.value));
  };

  const validateForm = () => {
    if (form.clientName.trim().length < 2) return t("booking.form.errorName");
    const phone = validateInternationalPhoneInput(form.clientPhone);
    if (phone.reason === "empty") return t("booking.form.errorPhoneRequired");
    if (phone.reason === "missing_plus") return t("booking.form.errorPhonePlus");
    if (!phone.ok) return t("booking.form.errorPhone");
    if (!selectedService) return t("booking.form.errorService");
    if (!form.durationMinutes) return t("booking.form.errorDuration");
    if (!form.preferredDate || !form.preferredTime) return t("booking.form.errorDateTime");
    if (!selectedSlot) return t("booking.form.errorSlot");
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateForm();
    if (error) {
      setSubmitState({ error, loading: false, success: false });
      return;
    }

    const phone = validateInternationalPhoneInput(form.clientPhone);
    setSubmitState({ error: "", loading: true, success: false });
    try {
      await submitSiteBookingRequest({
        clientEmail: form.clientEmail.trim(),
        clientName: form.clientName.trim(),
        clientPhone: phone.e164,
        durationMinutes: Number(form.durationMinutes),
        locale: lang,
        note: form.note.trim(),
        preferredDate: form.preferredDate,
        preferredMaster: selectedSlot.master,
        preferredTime: selectedSlot.startTime,
        serviceName: selectedService.title,
        serviceSlug: selectedService.slug,
      });
      setSubmitState({ error: "", loading: false, success: true });
      setForm((current) => ({
        ...current,
        clientEmail: "",
        clientName: "",
        clientPhone: "",
        note: "",
        preferredTime: "",
      }));
    } catch {
      setSubmitState({ error: t("booking.form.errorSubmit"), loading: false, success: false });
    }
  };

  const inputClass =
    "mt-2 min-h-[48px] w-full rounded-card border border-white/12 bg-void/70 px-4 text-sm text-milk outline-none transition placeholder:text-stone/70 focus:border-gold/70 focus:bg-void";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-void">
      <SiteImage
        src="/booking/booking.jpg"
        alt=""
        fill
        className="object-cover"
        loading="lazy"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-void/78" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,12,0.9),rgba(8,6,12,0.68)_44%,rgba(8,6,12,0.92))]" />

      <Container className="relative section-padding">
        <ScrollAnimationWrapper className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label text-gold">{t("booking.label")}</p>
            <div className="spa-divider" />
            <h2 className="section-heading mt-6 text-white sm:text-display-md">
              {t("booking.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/82 sm:text-base">
              {copy.compactHint}
            </p>
          </div>

          <form
            className="mx-auto mt-10 max-w-4xl rounded-card border border-white/12 bg-[linear-gradient(145deg,rgba(18,15,22,0.92),rgba(8,6,12,0.9))] p-5 shadow-spa backdrop-blur sm:p-7"
            onSubmit={handleSubmit}
          >
            {submitState.success ? (
              <div className="rounded-card border border-gold/35 bg-gold/[0.08] p-5 text-center">
                <h3 className="font-display text-2xl text-milk">{t("booking.form.successTitle")}</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-stone">{t("booking.form.successMessage")}</p>
                <Button className="mt-5" size="sm" type="button" onClick={() => setSubmitState({ error: "", loading: false, success: false })}>
                  {t("booking.form.successClose")}
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.72fr_0.72fr]">
                  <Field id="booking-service" label={t("booking.form.service")}>
                    <select
                      className={selectClass}
                      id="booking-service"
                      value={form.serviceSlug}
                      onChange={(event) => updateField("serviceSlug", event.target.value)}
                    >
                      {localizedServices.map((service) => (
                        <option key={service.slug} value={service.slug}>{service.title}</option>
                      ))}
                    </select>
                  </Field>

                  <Field id="booking-duration" label={t("booking.form.duration")}>
                    <select
                      className={selectClass}
                      id="booking-duration"
                      value={form.durationMinutes}
                      onChange={(event) => updateField("durationMinutes", event.target.value)}
                    >
                      {durationOptions.map((item) => (
                        <option key={item.minutes} value={item.minutes}>
                          {t("booking.form.durationOption", { minutes: item.minutes, price: item.price })}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field id="booking-master" label={t("booking.form.master")}>
                    <select
                      className={selectClass}
                      id="booking-master"
                      value={form.preferredMaster}
                      onChange={(event) => updateField("preferredMaster", event.target.value)}
                    >
                      <option value="">{copy.anyMaster}</option>
                      {MASTER_OPTIONS.map((master) => (
                        <option key={master} value={master}>{master}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="rounded-card border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-start">
                    <Field id="booking-date" label={copy.dateLabel}>
                      <input
                        className={inputClass}
                        id="booking-date"
                        min={getTomorrowInputDate()}
                        type="date"
                        value={form.preferredDate}
                        onChange={(event) => updateField("preferredDate", event.target.value)}
                      />
                    </Field>

                    <div>
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div className="text-left">
                          <p className="text-sm font-medium text-milk/90">{copy.slotsTitle}</p>
                          <p className="mt-1 text-xs leading-relaxed text-stone">{copy.timeHint}</p>
                        </div>
                        {slotsLoading ? (
                          <span className="rounded-pill border border-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                            {t("booking.form.slotsLoading")}
                          </span>
                        ) : null}
                      </div>

                      {!slotsLoading && !visibleSlots.length ? (
                        <p className="mt-4 rounded-card border border-white/10 bg-void/45 px-4 py-3 text-left text-sm text-stone">
                          {slotsError || t("booking.form.noSlots")}
                        </p>
                      ) : (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {visibleSlots.map((slot) => {
                            const slotKey = getSlotKey(slot);
                            const active = form.preferredTime === slotKey;
                            return (
                              <button
                                key={`${slot.master}-${slot.startTime}`}
                                className={[
                                  "min-h-[64px] rounded-card border px-3 py-2 text-left transition",
                                  active
                                    ? "border-gold/75 bg-gold/[0.13] text-milk shadow-[0_0_24px_rgba(184,149,107,0.16)]"
                                    : "border-white/12 bg-void/55 text-stone hover:border-gold/40 hover:bg-gold/[0.06] hover:text-milk",
                                ].join(" ")}
                                type="button"
                                onClick={() => updateField("preferredTime", slotKey)}
                              >
                                <strong className="block font-display text-lg text-milk">{slot.startTime}</strong>
                                <span className="mt-1 block truncate text-xs">{slot.master}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-left text-sm font-medium text-milk/90">{copy.contactTitle}</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Field id="booking-name" label={t("booking.form.name")}>
                      <input
                        className={inputClass}
                        id="booking-name"
                        autoComplete="name"
                        value={form.clientName}
                        onChange={(event) => updateField("clientName", event.target.value)}
                      />
                    </Field>
                    <Field id="booking-phone" label={t("booking.form.phone")}>
                      <input
                        className={inputClass}
                        id="booking-phone"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder={defaultPhonePlaceholder(lang)}
                        value={form.clientPhone}
                        onChange={handlePhoneChange}
                      />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field id="booking-email" label={`${t("booking.form.email")} (${t("booking.form.optional")})`}>
                      <input
                        className={inputClass}
                        id="booking-email"
                        autoComplete="email"
                        type="email"
                        value={form.clientEmail}
                        onChange={(event) => updateField("clientEmail", event.target.value)}
                      />
                    </Field>
                    <Field id="booking-note" label={`${t("booking.form.note")} (${t("booking.form.optional")})`}>
                      <input
                        className={inputClass}
                        id="booking-note"
                        value={form.note}
                        onChange={(event) => updateField("note", event.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                {selectedSlot ? (
                  <div className="rounded-card border border-gold/20 bg-gold/[0.07] px-4 py-3 text-sm text-stone">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-medium text-milk">
                        {selectedSlot.startTime} · {selectedSlot.master} · {selectedService?.title}
                      </span>
                      {Number(selectedSlot.finalPrice) > 0 ? (
                        <strong className="text-lg text-gold">{selectedSlot.finalPrice} {t("common.pln")}</strong>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {(slotsError || submitState.error) && (
                  <p className="rounded-card border border-red-400/30 bg-red-950/25 px-4 py-3 text-left text-sm text-red-100">
                    {slotsError || submitState.error}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button className="w-full sm:flex-1" disabled={submitState.loading || slotsLoading || !selectedSlot} size="lg" type="submit">
                    {submitState.loading ? t("booking.form.submitting") : t("booking.form.submit")}
                  </Button>
                  <div className="text-center text-xs text-stone sm:w-48 sm:text-left">
                    <span className="block">{copy.fallback}</span>
                    <a className="font-semibold text-gold transition hover:text-milk" href={contact?.booksyUrl || BOOKSY_URL} rel="noreferrer" target="_blank">
                      {copy.viaBooksy}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </form>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
