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
  defaultPhoneCountryForLocale,
  getPhoneCountryOptions,
  parsePastedPhoneNumber,
  validateSiteBookingPhone,
} from "../../utils/internationalPhone";
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
  const [phoneCountry, setPhoneCountry] = useState(() => defaultPhoneCountryForLocale(lang));
  const [phoneLocal, setPhoneLocal] = useState("");

  const phoneCountryOptions = useMemo(
    () => getPhoneCountryOptions(lang),
    [lang],
  );

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
  }, [durationMinutes, preferredDate, preferredMaster, selectedService, t]);

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
    setPhoneCountry(defaultPhoneCountryForLocale(lang));
    setPhoneLocal("");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const clientName = String(formData.get("clientName") ?? "").trim();
    const clientEmail = String(formData.get("clientEmail") ?? "").trim();
    const phoneResult = validateSiteBookingPhone(phoneCountry, phoneLocal);
    const note = String(formData.get("note") ?? "").trim();
    const { master: slotMaster, startTime: preferredTime } =
      parseSiteBookingSlotValue(selectedSlot);

    if (clientName.length < 2) {
      setError(t("booking.form.errorName"));
      return;
    }

    if (!phoneResult.ok) {
      setError(
        phoneResult.reason === "no_country"
          ? t("booking.form.errorPhoneCountry")
          : t("booking.form.errorPhone"),
      );
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
      <div className="mx-auto mt-10 max-w-2xl scroll-mt-28 text-left">
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
    <div id="booking-form" className="mx-auto mt-10 max-w-2xl scroll-mt-28 text-left">
      <form
        key={formKey}
        className="rounded-card border border-white/15 bg-void/55 p-6 backdrop-blur-sm sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-white/85">
            <span>{t("booking.form.name")}</span>
            <input
              className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
              name="clientName"
              required
              type="text"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/85 sm:col-span-2">
            <span>{t("booking.form.phone")}</span>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,12rem)_1fr]">
              <select
                aria-label={t("booking.form.phoneCountry")}
                className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
                required
                value={phoneCountry}
                onChange={(event) => setPhoneCountry(event.target.value)}
              >
                {phoneCountryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                aria-label={t("booking.form.phoneNumber")}
                className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
                inputMode="tel"
                placeholder={t("booking.form.phonePlaceholder")}
                required
                type="tel"
                value={phoneLocal}
                onChange={(event) => setPhoneLocal(event.target.value)}
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData("text");
                  const parsed = parsePastedPhoneNumber(pasted);

                  if (!parsed) {
                    return;
                  }

                  event.preventDefault();

                  if (parsed.country) {
                    setPhoneCountry(parsed.country);
                  }

                  setPhoneLocal(parsed.nationalNumber);
                }}
              />
            </div>
            <small className="text-white/60">{t("booking.form.phoneHint")}</small>
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/85 sm:col-span-2">
            <span>{t("booking.form.email")}</span>
            <input
              className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
              name="clientEmail"
              type="email"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/85">
            <span>{t("booking.form.service")}</span>
            <select
              className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
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
          <label className="flex flex-col gap-2 text-sm text-white/85">
            <span>{t("booking.form.duration")}</span>
            <select
              className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
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
            <label className="flex flex-col gap-2 text-sm text-white/85 sm:col-span-2">
              <span>{t("booking.form.master")}</span>
              <select
                className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
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
          <label className="flex flex-col gap-2 text-sm text-white/85">
            <span>{t("booking.form.date")}</span>
            <input
              className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
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
          <label className="flex flex-col gap-2 text-sm text-white/85">
            <span>{t("booking.form.time")}</span>
            <select
              className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
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
            {slotsError ? <small className="text-red-300">{slotsError}</small> : null}
            {!slotsLoading && preferredDate && durationMinutes && slots.length === 0 && !slotsError ? (
              <small className="text-white/70">{t("booking.form.noSlots")}</small>
            ) : null}
          </label>
          {selectedSlotData ? (
            <div className="rounded-lg border border-white/15 bg-void/45 p-4 sm:col-span-2">
              <p className="mb-3 text-sm font-medium text-white">{t("booking.form.pricingTitle")}</p>
              <table className="w-full text-sm text-white/85">
                <tbody>
                  <tr>
                    <td className="py-1">{t("booking.form.pricingBase")}</td>
                    <td className="py-1 text-right tabular-nums">
                      {selectedSlotData.basePrice} {t("common.pln")}
                    </td>
                  </tr>
                  {selectedSlotData.premiumPercent > 0 ? (
                    <tr>
                      <td className="py-1">
                        {t("booking.form.pricingPremium", {
                          percent: selectedSlotData.premiumPercent,
                        })}
                      </td>
                      <td className="py-1 text-right tabular-nums">
                        +{selectedSlotData.premiumAmount} {t("common.pln")}
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <td className="py-1">{t("booking.form.pricingSubtotal")}</td>
                    <td className="py-1 text-right tabular-nums">
                      {selectedSlotData.subtotal} {t("common.pln")}
                    </td>
                  </tr>
                  {selectedSlotData.discountPercent > 0 ? (
                    <tr>
                      <td className="py-1">
                        {t("booking.form.pricingDiscount", {
                          percent: selectedSlotData.discountPercent,
                        })}
                      </td>
                      <td className="py-1 text-right tabular-nums">
                        −{selectedSlotData.discountAmount} {t("common.pln")}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="border-t border-white/15 text-white">
                    <td className="pt-2 font-medium">{t("booking.form.pricingTotal")}</td>
                    <td className="pt-2 text-right font-medium tabular-nums">
                      {selectedSlotData.finalPrice} {t("common.pln")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}
          <label className="flex flex-col gap-2 text-sm text-white/85 sm:col-span-2">
            <span>{t("booking.form.note")}</span>
            <textarea
              className="min-h-24 rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
              maxLength={500}
              name="note"
              rows={3}
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Button disabled={submitting || slotsLoading} size="lg" type="submit">
            {submitting ? t("booking.form.submitting") : t("booking.form.submit")}
          </Button>
          <Button href={BOOKSY_URL} size="lg" variant="outlineLight">
            {t("booking.cta")}
          </Button>
        </div>
      </form>
    </div>
  );
}
