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

const todayInputDate = () => new Date().toISOString().slice(0, 10);

const normalizePhone = (value) => String(value ?? "").replace(/\D/g, "");

export default function SiteBookingForm() {
  const { lang, localizedServices, t } = useTranslation();
  const { team } = useContent();
  const [serviceSlug, setServiceSlug] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [preferredMaster, setPreferredMaster] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      setSelectedSlot("");
      setSlotsError("");
      return undefined;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSlotsLoading(true);
      setSlotsError("");
      setSelectedSlot("");

      try {
        const data = await fetchSiteBookingAvailability({
          durationMinutes: Number(durationMinutes),
          preferredDate,
          preferredMaster,
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
  }, [durationMinutes, preferredDate, preferredMaster, t]);

  const handleServiceChange = (nextSlug) => {
    setServiceSlug(nextSlug);
    const service = localizedServices.find((item) => item.slug === nextSlug);
    setDurationMinutes(service?.time?.[1] ? String(service.time[1]) : "");
    setSelectedSlot("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const clientName = String(formData.get("clientName") ?? "").trim();
    const clientPhone = normalizePhone(formData.get("clientPhone"));
    const clientEmail = String(formData.get("clientEmail") ?? "").trim();
    const note = String(formData.get("note") ?? "").trim();
    const { master: slotMaster, startTime: preferredTime } =
      parseSiteBookingSlotValue(selectedSlot);

    if (clientName.length < 2) {
      setError(t("booking.form.errorName"));
      return;
    }

    if (clientPhone.length < 9) {
      setError(t("booking.form.errorPhone"));
      return;
    }

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

      setSuccess(true);
      event.currentTarget.reset();
      setServiceSlug("");
      setDurationMinutes("");
      setPreferredMaster("");
      setPreferredDate("");
      setSelectedSlot("");
      setSlots([]);
    } catch (submitError) {
      setError(submitError?.message || t("booking.form.errorSubmit"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-2xl text-left">
      <form
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
          <label className="flex flex-col gap-2 text-sm text-white/85">
            <span>{t("booking.form.phone")}</span>
            <input
              className="rounded-lg border border-white/20 bg-void/70 px-3 py-2.5 text-white outline-none transition focus:border-gold/60"
              inputMode="tel"
              name="clientPhone"
              required
              type="tel"
            />
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
                setDurationMinutes(event.target.value);
                setSelectedSlot("");
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
                  setPreferredMaster(event.target.value);
                  setSelectedSlot("");
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
                setPreferredDate(event.target.value);
                setSelectedSlot("");
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
              onChange={(event) => setSelectedSlot(event.target.value)}
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
        {success ? (
          <p className="mt-4 text-sm text-emerald-200">{t("booking.form.success")}</p>
        ) : null}

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
