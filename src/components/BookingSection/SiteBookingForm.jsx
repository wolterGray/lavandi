import { useEffect, useMemo, useState } from "react";
import { useContent } from "../../context/ContentProvider";
import { useTranslation } from "../../i18n/LanguageProvider";
import Button from "../../ui/Button";
import {
  fetchSiteBookingAvailability,
  submitSiteBookingRequest,
} from "../../utils/siteBookingApi";
import {
  buildSiteBookingSlotValue,
  formatSiteBookingSlotLabel,
  parseSiteBookingSlotValue,
} from "../../utils/siteBookingSlots";
import { BOOKSY_URL } from "../../constants/theme";
import {
  defaultPhonePlaceholder,
  formatInternationalPhoneInput,
  formatPastedPhoneNumber,
  validateInternationalPhoneInput,
} from "../../utils/internationalPhone";
import {
  bookingFieldClass,
  bookingHintClass,
  bookingLabelClass,
  bookingOptionalTagClass,
  bookingTextareaClass,
} from "./bookingFormStyles";
import SiteBookingSuccess from "./SiteBookingSuccess";

const todayInputDate = () => new Date().toISOString().slice(0, 10);

const initialFormState = () => ({
  serviceSlug: "",
  durationMinutes: "",
  preferredMaster: "",
  preferredDate: "",
  selectedSlot: "",
});

export default function SiteBookingForm() {
  const { lang, localizedServices, t } = useTranslation();
  const { team } = useContent();
  const [formState, setFormState] = useState(initialFormState);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [phone, setPhone] = useState("");

  const phonePlaceholder = useMemo(() => defaultPhonePlaceholder(lang), [lang]);

  const {
    durationMinutes,
    preferredDate,
    preferredMaster,
    selectedSlot,
    serviceSlug,
  } = formState;

  const selectedService = useMemo(
    () => localizedServices.find((service) => service.slug === serviceSlug) ?? null,
    [localizedServices, serviceSlug],
  );

  const durationOptions = useMemo(() => {
    if (!selectedService?.time?.length) {
      return [];
    }

    return selectedService.time.map((minutes, index) => ({
      minutes,
      price: selectedService.price?.[index],
    }));
  }, [selectedService]);

  useEffect(() => {
    if (!preferredDate || !durationMinutes) {
      setSlots([]);
      setFormState((current) => ({ ...current, selectedSlot: "" }));
      setSlotsError("");
      return undefined;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSlotsLoading(true);
      setSlotsError("");
      setFormState((current) => ({ ...current, selectedSlot: "" }));

      try {
        const data = await fetchSiteBookingAvailability({
          durationMinutes: Number(durationMinutes),
          preferredDate,
          preferredMaster,
          serviceName: selectedService?.title ?? "",
          serviceSlug: selectedService?.slug ?? serviceSlug,
        });

        if (cancelled) {
          return;
        }

        setSlots(Array.isArray(data.slots) ? data.slots : []);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setSlots([]);
        setSlotsError(loadError?.message || t("booking.form.errorSlots"));
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [durationMinutes, preferredDate, preferredMaster, selectedService, serviceSlug, t]);

  const selectedSlotData = useMemo(() => {
    if (!selectedSlot) {
      return null;
    }

    return (
      slots.find((slot) => buildSiteBookingSlotValue(slot) === selectedSlot) ?? null
    );
  }, [selectedSlot, slots]);

  const resetForm = () => {
    setFormState(initialFormState());
    setPhone("");
    setSlots([]);
    setSlotsError("");
    setError("");
    setFormKey((current) => current + 1);
  };

  const handleServiceChange = (nextSlug) => {
    const service = localizedServices.find((item) => item.slug === nextSlug);
    setFormState((current) => ({
      ...current,
      serviceSlug: nextSlug,
      durationMinutes: service?.time?.[1] ? String(service.time[1]) : "",
      selectedSlot: "",
    }));
  };

  const handlePhoneChange = (event) => {
    setPhone(formatInternationalPhoneInput(event.target.value));
  };

  const handlePhonePaste = (event) => {
    const pasted = event.clipboardData.getData("text");
    const formatted = formatPastedPhoneNumber(pasted);

    if (!formatted) {
      return;
    }

    event.preventDefault();
    setPhone(formatted);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const clientName = String(formData.get("clientName") ?? "").trim();
    const clientEmail = String(formData.get("clientEmail") ?? "").trim();
    const phoneResult = validateInternationalPhoneInput(phone);
    const note = String(formData.get("note") ?? "").trim();
    const { master: slotMaster, startTime: preferredTime } =
      parseSiteBookingSlotValue(selectedSlot);

    if (clientName.length < 2) {
      setError(t("booking.form.errorName"));
      return;
    }

    if (!phoneResult.ok) {
      if (phoneResult.reason === "missing_plus") {
        setError(t("booking.form.errorPhonePlus"));
      } else if (phoneResult.reason === "empty") {
        setError(t("booking.form.errorPhoneRequired"));
      } else {
        setError(t("booking.form.errorPhone"));
      }
      return;
    }

    const clientPhone = phoneResult.e164;

    if (!selectedService) {
      setError(t("booking.form.errorService"));
      return;
    }

    if (!durationMinutes) {
      setError(t("booking.form.errorDuration"));
      return;
    }

    if (!preferredDate || !preferredTime) {
      setError(t("booking.form.errorSlot"));
      return;
    }

    setSubmitting(true);

    try {
      await submitSiteBookingRequest({
        clientName,
        clientPhone,
        clientEmail,
        serviceSlug: selectedService.slug,
        serviceName: selectedService.title,
        preferredMaster: preferredMaster || slotMaster,
        preferredDate,
        preferredTime,
        durationMinutes: Number(durationMinutes),
        note,
        locale: lang,
      });

      resetForm();
      setShowSuccess(true);
    } catch (submitError) {
      setError(submitError?.message || t("booking.form.errorSubmit"));
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="booking-form-shell mx-auto mt-8 max-w-2xl scroll-mt-28 text-left sm:mt-10">
        <SiteBookingSuccess
          t={t}
          onClose={() => {
            setShowSuccess(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      id="booking-form"
      className="booking-form-shell mx-auto mt-8 max-w-2xl scroll-mt-28 text-left sm:mt-10"
    >
      <form
        key={formKey}
        className="booking-form rounded-card border border-white/15 bg-void/55 p-5 backdrop-blur-sm sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <label className={`${bookingLabelClass} sm:col-span-2`}>
            <span>{t("booking.form.name")}</span>
            <input
              autoComplete="name"
              className={bookingFieldClass}
              enterKeyHint="next"
              name="clientName"
              required
              type="text"
            />
          </label>

          <label className={`${bookingLabelClass} sm:col-span-2`}>
            <span>{t("booking.form.phone")}</span>
            <input
              autoComplete="tel"
              className={bookingFieldClass}
              enterKeyHint="next"
              inputMode="tel"
              name="clientPhone"
              placeholder={phonePlaceholder}
              required
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onPaste={handlePhonePaste}
            />
            <small className={bookingHintClass}>{t("booking.form.phoneHint")}</small>
          </label>

          <label className={bookingLabelClass}>
            <span>{t("booking.form.service")}</span>
            <select
              className={bookingFieldClass}
              required
              value={serviceSlug}
              onChange={(event) => handleServiceChange(event.target.value)}
            >
              <option value="">{t("booking.form.servicePlaceholder")}</option>
              {localizedServices.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>

          <label className={bookingLabelClass}>
            <span>{t("booking.form.duration")}</span>
            <select
              className={bookingFieldClass}
              required
              value={durationMinutes}
              onChange={(event) => {
                setFormState((current) => ({
                  ...current,
                  durationMinutes: event.target.value,
                  selectedSlot: "",
                }));
              }}
            >
              <option value="">{t("booking.form.durationPlaceholder")}</option>
              {durationOptions.map((option) => (
                <option key={option.minutes} value={option.minutes}>
                  {t("booking.form.durationOption", {
                    minutes: option.minutes,
                    price: option.price,
                  })}
                </option>
              ))}
            </select>
          </label>

          {team.length ? (
            <label className={`${bookingLabelClass} sm:col-span-2`}>
              <span>
                {t("booking.form.master")}
                <span className={bookingOptionalTagClass}>{t("booking.form.optional")}</span>
              </span>
              <select
                className={bookingFieldClass}
                value={preferredMaster}
                onChange={(event) => {
                  setFormState((current) => ({
                    ...current,
                    preferredMaster: event.target.value,
                    selectedSlot: "",
                  }));
                }}
              >
                <option value="">{t("booking.form.masterAny")}</option>
                {team.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className={bookingLabelClass}>
            <span>{t("booking.form.date")}</span>
            <input
              className={bookingFieldClass}
              min={todayInputDate()}
              required
              type="date"
              value={preferredDate}
              onChange={(event) => {
                setFormState((current) => ({
                  ...current,
                  preferredDate: event.target.value,
                  selectedSlot: "",
                }));
              }}
            />
          </label>

          <label className={bookingLabelClass}>
            <span>{t("booking.form.time")}</span>
            <select
              className={bookingFieldClass}
              disabled={!preferredDate || !durationMinutes || slotsLoading}
              required
              value={selectedSlot}
              onChange={(event) => {
                setFormState((current) => ({
                  ...current,
                  selectedSlot: event.target.value,
                }));
              }}
            >
              <option value="">
                {slotsLoading
                  ? t("booking.form.slotsLoading")
                  : t("booking.form.slotPlaceholder")}
              </option>
              {slots.map((slot) => (
                <option key={buildSiteBookingSlotValue(slot)} value={buildSiteBookingSlotValue(slot)}>
                  {formatSiteBookingSlotLabel(slot, t)}
                </option>
              ))}
            </select>
            {slotsError ? <small className="text-sm text-red-300">{slotsError}</small> : null}
            {!slotsLoading && preferredDate && durationMinutes && slots.length === 0 && !slotsError ? (
              <small className={bookingHintClass}>{t("booking.form.noSlots")}</small>
            ) : null}
          </label>

          {selectedSlotData ? (
            <div className="rounded-xl border border-white/15 bg-void/45 p-4 sm:col-span-2">
              <p className="mb-3 text-sm font-medium text-white">{t("booking.form.pricingTitle")}</p>
              <table className="w-full text-sm text-white/85">
                <tbody>
                  <tr>
                    <td className="py-1.5">{t("booking.form.pricingBase")}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {selectedSlotData.basePrice} {t("common.pln")}
                    </td>
                  </tr>
                  {selectedSlotData.premiumPercent > 0 ? (
                    <tr>
                      <td className="py-1.5">
                        {t("booking.form.pricingPremium", {
                          percent: selectedSlotData.premiumPercent,
                        })}
                      </td>
                      <td className="py-1.5 text-right tabular-nums">
                        +{selectedSlotData.premiumAmount} {t("common.pln")}
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <td className="py-1.5">{t("booking.form.pricingSubtotal")}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {selectedSlotData.subtotal} {t("common.pln")}
                    </td>
                  </tr>
                  {selectedSlotData.discountPercent > 0 ? (
                    <tr>
                      <td className="py-1.5">
                        {t("booking.form.pricingDiscount", {
                          percent: selectedSlotData.discountPercent,
                        })}
                      </td>
                      <td className="py-1.5 text-right tabular-nums">
                        −{selectedSlotData.discountAmount} {t("common.pln")}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="border-t border-white/15 text-white">
                    <td className="pt-2.5 font-medium">{t("booking.form.pricingTotal")}</td>
                    <td className="pt-2.5 text-right font-medium tabular-nums">
                      {selectedSlotData.finalPrice} {t("common.pln")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}

          <label className={`${bookingLabelClass} sm:col-span-2`}>
            <span>
              {t("booking.form.email")}
              <span className={bookingOptionalTagClass}>{t("booking.form.optional")}</span>
            </span>
            <input
              autoComplete="email"
              className={bookingFieldClass}
              enterKeyHint="next"
              inputMode="email"
              name="clientEmail"
              type="email"
            />
          </label>

          <label className={`${bookingLabelClass} sm:col-span-2`}>
            <span>
              {t("booking.form.note")}
              <span className={bookingOptionalTagClass}>{t("booking.form.optional")}</span>
            </span>
            <textarea
              className={bookingTextareaClass}
              enterKeyHint="done"
              maxLength={500}
              name="note"
              rows={3}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-5 rounded-xl border border-red-400/25 bg-red-950/30 px-4 py-3 text-sm leading-relaxed text-red-200">
            {error}
          </p>
        ) : null}

        <div className="booking-form-actions mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button
            className="w-full min-h-[56px] sm:min-h-[52px]"
            disabled={submitting || slotsLoading}
            size="lg"
            type="submit"
          >
            {submitting ? t("booking.form.submitting") : t("booking.form.submit")}
          </Button>
          <Button
            className="w-full min-h-[52px]"
            href={BOOKSY_URL}
            size="lg"
            variant="outlineLight"
          >
            {t("booking.cta")}
          </Button>
        </div>
      </form>
    </div>
  );
}
