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

function getTomorrowInputDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
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

  const selectedSlot = slots.find(
    (slot) => `${slot.startTime}|${slot.master}` === form.preferredTime,
  );

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
  const priceSuffix = (slot) =>
    Number(slot?.finalPrice) > 0 ? t("booking.form.slotPrice", { price: slot.finalPrice }) : "";

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
            className="rounded-card border border-white/12 bg-surface/85 p-5 shadow-spa backdrop-blur sm:p-6"
            onSubmit={handleSubmit}
          >
            {submitState.success ? (
              <div className="rounded-card border border-gold/35 bg-gold/[0.08] p-4 text-left">
                <h3 className="font-display text-2xl text-milk">{t("booking.form.successTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{t("booking.form.successMessage")}</p>
                <Button className="mt-5" size="sm" type="button" onClick={() => setSubmitState({ error: "", loading: false, success: false })}>
                  {t("booking.form.successClose")}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                <Field id="booking-name" label={t("booking.form.name")}>
                  <input
                    className={inputClass}
                    id="booking-name"
                    autoComplete="name"
                    value={form.clientName}
                    onChange={(event) => updateField("clientName", event.target.value)}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
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
                    <span className="mt-1 block text-xs leading-relaxed text-stone">{t("booking.form.phoneHint")}</span>
                  </Field>
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
                </div>

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

                <div className="grid gap-4 sm:grid-cols-2">
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
                      <option value="">{t("booking.form.masterAny")}</option>
                      {MASTER_OPTIONS.map((master) => (
                        <option key={master} value={master}>{master}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="booking-date" label={t("booking.form.date")}>
                    <input
                      className={inputClass}
                      id="booking-date"
                      min={getTomorrowInputDate()}
                      type="date"
                      value={form.preferredDate}
                      onChange={(event) => updateField("preferredDate", event.target.value)}
                    />
                  </Field>
                  <Field id="booking-time" label={t("booking.form.time")}>
                    <select
                      className={selectClass}
                      disabled={slotsLoading || Boolean(slotsError) || !slots.length}
                      id="booking-time"
                      value={form.preferredTime}
                      onChange={(event) => updateField("preferredTime", event.target.value)}
                    >
                      <option value="">
                        {slotsLoading
                          ? t("booking.form.slotsLoading")
                          : slots.length
                            ? t("booking.form.slotPlaceholder")
                            : t("booking.form.noSlots")}
                      </option>
                      {slots.map((slot) => (
                        <option key={`${slot.master}-${slot.startTime}`} value={`${slot.startTime}|${slot.master}`}>
                          {t("booking.form.slotOption", {
                            master: slot.master,
                            price: priceSuffix(slot),
                            time: slot.startTime,
                          })}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {selectedSlot && Number(selectedSlot.finalPrice) > 0 ? (
                  <div className="rounded-card border border-gold/20 bg-gold/[0.06] p-4 text-sm text-stone">
                    <div className="flex items-center justify-between gap-3">
                      <span>{t("booking.form.pricingTitle")}</span>
                      <strong className="text-lg text-gold">{selectedSlot.finalPrice} {t("common.pln")}</strong>
                    </div>
                  </div>
                ) : null}

                <Field id="booking-note" label={`${t("booking.form.note")} (${t("booking.form.optional")})`}>
                  <textarea
                    className={`${inputClass} min-h-[92px] resize-y py-3`}
                    id="booking-note"
                    value={form.note}
                    onChange={(event) => updateField("note", event.target.value)}
                  />
                </Field>

                {(slotsError || submitState.error) && (
                  <p className="rounded-card border border-red-400/30 bg-red-950/25 px-4 py-3 text-left text-sm text-red-100">
                    {slotsError || submitState.error}
                  </p>
                )}

                <Button className="w-full" disabled={submitState.loading || slotsLoading} size="lg" type="submit">
                  {submitState.loading ? t("booking.form.submitting") : t("booking.form.submit")}
                </Button>
              </div>
            )}
          </form>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
