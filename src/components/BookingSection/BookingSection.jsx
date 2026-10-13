import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, Sparkles } from "lucide-react";
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
const QUICK_DAYS_COUNT = 7;
const INITIAL_SLOTS_PER_GROUP = 10;

const FLOW_COPY = {
  pl: {
    stepService: "Rytuał",
    stepTime: "Termin",
    stepDetails: "Kontakt",
    today: "Dziś",
    tomorrow: "Jutro",
    otherDate: "Inna data",
    morning: "Rano",
    afternoon: "Po południu",
    evening: "Wieczorem",
    firstAvailable: "Pierwsze wolne terminy",
    premium: "Premium",
    selected: "Wybrany termin",
    chooseSlot: "Wybierz jedną z dostępnych godzin",
    anyMasterHint: "Pokażemy godziny wszystkich dostępnych specjalistów.",
    noSlotsHint: "Spróbuj innej daty lub specjalisty.",
    showMore: "Więcej godzin",
    showLess: "Mniej",
  },
  en: {
    stepService: "Ritual",
    stepTime: "Time",
    stepDetails: "Contact",
    today: "Today",
    tomorrow: "Tomorrow",
    otherDate: "Other date",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    firstAvailable: "First available slots",
    premium: "Premium",
    selected: "Selected time",
    chooseSlot: "Choose one available time",
    anyMasterHint: "We will show times for every available specialist.",
    noSlotsHint: "Try another date or specialist.",
    showMore: "More times",
    showLess: "Less",
  },
  uk: {
    stepService: "Ритуал",
    stepTime: "Час",
    stepDetails: "Контакт",
    today: "Сьогодні",
    tomorrow: "Завтра",
    otherDate: "Інша дата",
    morning: "Ранок",
    afternoon: "День",
    evening: "Вечір",
    firstAvailable: "Найближчі вільні години",
    premium: "Premium",
    selected: "Обраний час",
    chooseSlot: "Оберіть один доступний час",
    anyMasterHint: "Покажемо години всіх доступних спеціалістів.",
    noSlotsHint: "Спробуйте іншу дату або спеціаліста.",
    showMore: "Більше годин",
    showLess: "Менше",
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

function getQuickDates(lang) {
  const locale = lang === "uk" ? "uk-UA" : lang === "en" ? "en-US" : "pl-PL";
  return Array.from({ length: QUICK_DAYS_COUNT }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return {
      date,
      day: new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date),
      input: toInputDate(date),
      month: new Intl.DateTimeFormat(locale, { month: "short" }).format(date),
      weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
    };
  });
}

function getSlotKey(slot) {
  return `${slot.startTime}|${slot.master}`;
}

function getSlotMinutes(slot) {
  const [hours = 0, minutes = 0] = String(slot?.startTime ?? "00:00").split(":").map(Number);
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

function groupSlots(slots) {
  return {
    morning: slots.filter((slot) => getSlotMinutes(slot) < 12 * 60),
    afternoon: slots.filter((slot) => {
      const minutes = getSlotMinutes(slot);
      return minutes >= 12 * 60 && minutes < 17 * 60;
    }),
    evening: slots.filter((slot) => getSlotMinutes(slot) >= 17 * 60),
  };
}

function getServiceDurations(service) {
  return (service?.time ?? [])
    .map((minutes, index) => ({
      minutes: Number(minutes),
      price: Number(service?.price?.[index]) || 0,
    }))
    .filter((item) => item.minutes > 0);
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
  const copy = FLOW_COPY[lang] ?? FLOW_COPY.pl;
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
  const [expandedSlotGroups, setExpandedSlotGroups] = useState({});
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
    setExpandedSlotGroups({});

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

  const selectedSlot = slots.find(
    (slot) => `${slot.startTime}|${slot.master}` === form.preferredTime,
  );
  const quickDates = useMemo(() => getQuickDates(lang), [lang]);
  const groupedSlots = useMemo(() => groupSlots(slots), [slots]);
  const selectedDuration = durationOptions.find((item) => String(item.minutes) === String(form.durationMinutes));
  const selectedDateLabel = quickDates.find((item) => item.input === form.preferredDate);

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
  const choiceClass = (active) =>
    [
      "min-h-[46px] rounded-card border px-4 py-3 text-left text-sm transition",
      active
        ? "border-gold/70 bg-gold/[0.12] text-milk shadow-[0_0_24px_rgba(184,149,107,0.14)]"
        : "border-white/12 bg-void/55 text-stone hover:border-gold/40 hover:bg-gold/[0.06] hover:text-milk",
    ].join(" ");
  const slotGroupEntries = [
    ["morning", copy.morning],
    ["afternoon", copy.afternoon],
    ["evening", copy.evening],
  ];
  const toggleSlotGroup = (group) => {
    setExpandedSlotGroups((current) => ({ ...current, [group]: !current[group] }));
  };

  return (
    <section id="contact" className=" none relative overflow-hidden">
      <SiteImage
        src="/booking/booking.jpg"
        alt=""
        fill
        className="object-cover"
        loading="lazy"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[rgba(154,132,88,0.06)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/75 to-void/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(8,6,12,0.45)_100%)]" />

      <Container className="relative section-padding">
        <ScrollAnimationWrapper className="grid gap-8 lg:grid-cols-[0.86fr_minmax(420px,1fr)] lg:items-center">
          <div className="text-center lg:text-left">
          <p className="section-label text-gold">{t("booking.label")}</p>
          <div className="spa-divider lg:!mx-0" />
          <h2 className="section-heading mx-auto mt-6 max-w-2xl text-white sm:text-display-md lg:mx-0">
            {t("booking.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base lg:mx-0">
            {t("booking.subtitle")}
          </p>

          <Button href={contact?.booksyUrl || BOOKSY_URL} size="lg" variant="secondary" className="mt-8 border-white/30 bg-void/40">
            {t("booking.cta")}
          </Button>
          </div>

          <form
            className="overflow-hidden rounded-card border border-white/12 bg-[linear-gradient(145deg,rgba(16,14,20,0.94),rgba(8,6,12,0.88))] shadow-spa backdrop-blur"
            onSubmit={handleSubmit}
          >
            {submitState.success ? (
              <div className="m-5 rounded-card border border-gold/35 bg-gold/[0.08] p-4 text-left sm:m-6">
                <h3 className="font-display text-2xl text-milk">{t("booking.form.successTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{t("booking.form.successMessage")}</p>
                <Button className="mt-5" size="sm" type="button" onClick={() => setSubmitState({ error: "", loading: false, success: false })}>
                  {t("booking.form.successClose")}
                </Button>
              </div>
            ) : (
              <div>
                <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6">
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
                    {[copy.stepService, copy.stepTime, copy.stepDetails].map((step, index) => (
                      <span key={step} className="flex items-center gap-2">
                        <i className="flex h-5 w-5 items-center justify-center rounded-full border border-gold/35 text-[10px] not-italic text-gold">
                          {index + 1}
                        </i>
                        <span className="truncate">{step}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6">
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

                  <div>
                    <p className="text-left text-sm font-medium text-milk/90">{t("booking.form.duration")}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {durationOptions.map((item) => {
                        const active = String(item.minutes) === String(form.durationMinutes);
                        return (
                          <button
                            key={item.minutes}
                            className={choiceClass(active)}
                            type="button"
                            onClick={() => updateField("durationMinutes", String(item.minutes))}
                          >
                            <span className="block font-display text-base text-milk">{item.minutes} {t("common.min")}</span>
                            <span className="mt-0.5 block text-xs text-stone">{item.price} {t("common.pln")}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-left text-sm font-medium text-milk/90">{t("booking.form.master")}</p>
                    <p className="mt-1 text-left text-xs leading-relaxed text-stone">{copy.anyMasterHint}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        className={choiceClass(!form.preferredMaster)}
                        type="button"
                        onClick={() => updateField("preferredMaster", "")}
                      >
                        <span className="block font-display text-sm text-milk">{t("booking.form.masterAny")}</span>
                      </button>
                      {MASTER_OPTIONS.map((master) => (
                        <button
                          key={master}
                          className={choiceClass(form.preferredMaster === master)}
                          type="button"
                          onClick={() => updateField("preferredMaster", master)}
                        >
                          <span className="block font-display text-sm text-milk">{master}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-left text-sm font-medium text-milk/90">{t("booking.form.date")}</p>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-white/12 bg-void/45 px-3 py-2 text-xs text-stone transition hover:border-gold/40 hover:text-milk">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{copy.otherDate}</span>
                        <input
                          className="sr-only"
                          min={getTomorrowInputDate()}
                          type="date"
                          value={form.preferredDate}
                          onChange={(event) => updateField("preferredDate", event.target.value)}
                        />
                      </label>
                    </div>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {quickDates.map((item, index) => {
                        const active = item.input === form.preferredDate;
                        const label = index === 0 ? copy.tomorrow : item.weekday;
                        return (
                          <button
                            key={item.input}
                            className={[
                              "min-w-[78px] rounded-card border px-3 py-3 text-center transition",
                              active
                                ? "border-gold/70 bg-gold/[0.12] text-milk"
                                : "border-white/12 bg-void/50 text-stone hover:border-gold/40 hover:text-milk",
                            ].join(" ")}
                            type="button"
                            onClick={() => updateField("preferredDate", item.input)}
                          >
                            <span className="block text-[10px] font-bold uppercase tracking-[0.12em]">{label}</span>
                            <span className="mt-1 block font-display text-xl text-milk">{item.day}</span>
                            <span className="block text-xs">{item.month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-card border border-white/10 bg-void/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-left">
                        <p className="flex items-center gap-2 text-sm font-medium text-milk">
                          <Clock3 className="h-4 w-4 text-gold" aria-hidden="true" />
                          {copy.firstAvailable}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-stone">
                          {selectedDateLabel
                            ? `${selectedDateLabel.weekday}, ${selectedDateLabel.day} ${selectedDateLabel.month}`
                            : form.preferredDate}
                        </p>
                      </div>
                      {slotsLoading ? (
                        <span className="rounded-pill border border-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                          {t("booking.form.slotsLoading")}
                        </span>
                      ) : null}
                    </div>

                    {!slotsLoading && !slots.length ? (
                      <p className="mt-4 rounded-card border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-stone">
                        {slotsError || `${t("booking.form.noSlots")} ${copy.noSlotsHint}`}
                      </p>
                    ) : null}

                    <div className="mt-4 grid gap-4">
                      {slotGroupEntries.map(([group, label]) => {
                        const groupSlotsList = groupedSlots[group];
                        if (!groupSlotsList.length) return null;
                        const isExpanded = Boolean(expandedSlotGroups[group]);
                        const visibleSlots = isExpanded
                          ? groupSlotsList
                          : groupSlotsList.slice(0, INITIAL_SLOTS_PER_GROUP);
                        const hiddenCount = Math.max(0, groupSlotsList.length - visibleSlots.length);
                        return (
                          <div key={group}>
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <p className="text-left text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
                                {label}
                              </p>
                              {hiddenCount > 0 || isExpanded ? (
                                <button
                                  className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold transition hover:text-milk"
                                  type="button"
                                  onClick={() => toggleSlotGroup(group)}
                                >
                                  {isExpanded ? copy.showLess : `${copy.showMore} +${hiddenCount}`}
                                </button>
                              ) : null}
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {visibleSlots.map((slot) => {
                                const slotKey = getSlotKey(slot);
                                const active = form.preferredTime === slotKey;
                                const isPremium = Number(slot.premiumPercent) > 0;
                                return (
                                  <button
                                    key={`${slot.master}-${slot.startTime}`}
                                    className={[
                                      "min-w-[112px] rounded-card border px-3 py-3 text-left transition",
                                      active
                                        ? "border-gold/80 bg-gold/[0.14] text-milk shadow-[0_0_24px_rgba(184,149,107,0.16)]"
                                        : "border-white/12 bg-white/[0.04] text-stone hover:border-gold/40 hover:bg-gold/[0.06] hover:text-milk",
                                    ].join(" ")}
                                    type="button"
                                    onClick={() => updateField("preferredTime", slotKey)}
                                  >
                                    <span className="flex items-center justify-between gap-2">
                                      <strong className="font-display text-lg text-milk">{slot.startTime}</strong>
                                      {active ? <Check className="h-4 w-4 text-gold" aria-hidden="true" /> : null}
                                    </span>
                                    <span className="mt-1 block truncate text-xs">{slot.master}</span>
                                    {Number(slot.finalPrice) > 0 ? (
                                      <span className="mt-1 block text-xs text-gold">{slot.finalPrice} {t("common.pln")}</span>
                                    ) : null}
                                    {isPremium ? (
                                      <span className="mt-2 inline-flex items-center gap-1 rounded-pill border border-gold/25 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-gold">
                                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                                        {copy.premium}
                                      </span>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
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

                  <div className="grid gap-4 sm:grid-cols-2">
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

                  {selectedSlot ? (
                    <div className="rounded-card border border-gold/20 bg-gold/[0.07] p-4 text-sm text-stone">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-medium text-milk">{copy.selected}: {selectedSlot.startTime} · {selectedSlot.master}</span>
                        <strong className="text-lg text-gold">
                          {Number(selectedSlot.finalPrice) > 0
                            ? `${selectedSlot.finalPrice} ${t("common.pln")}`
                            : selectedDuration
                              ? `${selectedDuration.price} ${t("common.pln")}`
                              : ""}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-left text-xs leading-relaxed text-stone">{copy.chooseSlot}</p>
                  )}

                  {(slotsError || submitState.error) && (
                    <p className="rounded-card border border-red-400/30 bg-red-950/25 px-4 py-3 text-left text-sm text-red-100">
                      {slotsError || submitState.error}
                    </p>
                  )}

                  <Button className="w-full" disabled={submitState.loading || slotsLoading || !selectedSlot} size="lg" type="submit">
                    {submitState.loading ? t("booking.form.submitting") : t("booking.form.submit")}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
