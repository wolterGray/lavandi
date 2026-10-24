import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, LoaderCircle } from "lucide-react";
import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import Button from "../../ui/Button";
import { fetchSiteBookingMasters, fetchSiteBookingSlots, submitSiteBookingRequest } from "../../utils/siteBookingApi";
import { defaultPhonePlaceholder, formatInternationalPhoneInput, validateInternationalPhoneInput } from "../../utils/internationalPhone";
import "./BookingSection.css";

const DAYS_IN_CAROUSEL = 28;
const DATE_SEARCH_BATCH_SIZE = 7;
const EN_PL_SERVICES = {
  "masaz-klasyczny": "Classic massage / Masaż klasyczny",
  "masaz-sportowy": "Sports massage / Masaż sportowy",
  "masaz-relaksacyjny": "Relaxing massage / Masaż relaksacyjny",
  "masaz-limfatyczny": "Lymphatic drainage / Masaż limfatyczny",
  "masaz-antycellulitowy": "Anti-cellulite massage / Masaż antycellulitowy",
  "masaz-twarzy-i-glowy": "Face & head massage / Masaż twarzy i głowy",
  "masaz-autorski": "Signature massage / Masaż autorski",
  "masaz-dla-dwojga": "Couples massage / Masaż dla dwojga",
};

const UK_EN_SERVICES = {
  "masaz-klasyczny": "Класичний масаж / Classic massage",
  "masaz-sportowy": "Спортивний масаж / Sports massage",
  "masaz-relaksacyjny": "Релаксуючий масаж / Relaxing massage",
  "masaz-limfatyczny": "Лімфодренажний масаж / Lymphatic drainage",
  "masaz-antycellulitowy": "Антицелюлітний масаж / Anti-cellulite massage",
  "masaz-twarzy-i-glowy": "Масаж обличчя та голови / Face & head massage",
  "masaz-autorski": "Авторський масаж / Signature massage",
  "masaz-dla-dwojga": "Масаж для двох / Couples massage",
};

const EN_PL_COPY = {
  anyMaster: "Any specialist / Dowolny specjalista",
  back: "Back / Wróć do terminu",
  callNow: "Call now / Zadzwoń teraz",
  date: "Choose a day / Wybierz dzień",
  dateLabel: "Date / Data",
  datePicker: "Other date / Inna data",
  dayStep: "Appointment / Termin",
  detailsStep: "Your details / Twoje dane",
  detailsSubtitle: "Enter your contact details so we can confirm your booking / Wprowadź swoje dane kontaktowe.",
  detailsTitle: "Your details / Twoje dane",
  disabledTitle: "Booking by phone / Rezerwacja telefoniczna",
  duration: "Duration / Czas trwania",
  durationLabel: "Duration / Czas trwania",
  durationUnit: "min",
  emailLabel: "E-mail",
  emailPlaceholder: "name@example.com",
  fallback: "Need a different time? / Nie widzisz odpowiedniej godziny?",
  formIntro: "Choose a treatment and a convenient time. We will contact you to confirm the visit / Wybierz zabieg i dogodny termin.",
  master: "Specialist / Specjalista",
  nameLabel: "Name / Imię",
  namePlaceholder: "Enter name / Wpisz imię",
  next: "Continue / Dalej",
  noSlots: "No available times for this day / Brak wolnych terminów w tym dniu",
  noteLabel: "Notes / Uwagi",
  notePlaceholder: "Special requests or details / Uwagi dotyczące wizyty...",
  optional: "optional / opcjonalnie",
  phoneLabel: "Phone / Telefon",
  previousDates: "Previous dates",
  previousTimes: "Previous times",
  price: "Price / Cena",
  requestNote: "This is a booking request — the NUAR team will confirm your visit / Wizyta zostanie potwierdzona przez zespół NUAR.",
  sectionLabel: "RESERVATION",
  selectDateHint: "Choose a day to view available times / Wybierz dzień, aby zobaczyć godziny",
  selectMaster: "Choose specialist / Wybierz specjalistę",
  selectService: "Choose treatment / Wybierz zabieg",
  service: "Treatment / Usługa",
  showLess: "Show less / Pokaż mniej",
  showMore: "Show all times / Pokaż wszystkie godziny",
  slotsLoading: "Checking availability… / Sprawdzanie dostępności…",
  submitBtn: "Send request / Wyślij prośbę",
  submitting: "Sending... / Wysyłanie…",
  summary: "Your selection / Twój wybór",
  summaryEyebrow: "YOUR RESERVATION / TWOJA REZERWACJA",
  time: "Available times / Dostępne godziny",
  timeLabel: "Time / Godzina",
  title: "Reserve a moment for yourself",
  nextDates: "Next dates",
  nextTimes: "Next times",
  viaBooksy: "Open Booksy / Otwórz Booksy"
};

const UK_EN_COPY = {
  anyMaster: "Будь-який спеціаліст / Any specialist",
  back: "Назад до терміну / Back to appointment",
  callNow: "Зателефонувати / Call now",
  date: "Оберіть день / Choose a day",
  dateLabel: "Дата / Date",
  datePicker: "Інша дата / Other date",
  dayStep: "Термін / Appointment",
  detailsStep: "Ваші дані / Your details",
  detailsSubtitle: "Введіть контактні дані, щоб ми могли підтвердити запис / Enter your contact details so we can confirm your booking.",
  detailsTitle: "Ваші дані / Your details",
  disabledTitle: "Запис телефоном / Booking by phone",
  duration: "Тривалість / Duration",
  durationLabel: "Тривалість / Duration",
  durationUnit: "хв",
  emailLabel: "E-mail",
  emailPlaceholder: "name@example.com",
  fallback: "Потрібен інший час? / Need a different time?",
  formIntro: "Оберіть послугу та зручний час. Ми зв'яжемося з вами для підтвердження запису / Choose a treatment and a convenient time.",
  master: "Спеціаліст / Specialist",
  nameLabel: "Ім'я / Name",
  namePlaceholder: "Введіть ім'я / Enter name",
  next: "Далі / Continue",
  noSlots: "На цей день немає вільного часу / No available times for this day",
  noteLabel: "Примітки / Notes",
  notePlaceholder: "Побажання або деталі запису / Special requests or details...",
  optional: "необов'язково / optional",
  phoneLabel: "Телефон / Phone",
  previousDates: "Попередні дати / Previous dates",
  previousTimes: "Попередній час / Previous times",
  price: "Ціна / Price",
  requestNote: "Це запит на запис — команда NUAR підтвердить ваш візит / This is a booking request — the NUAR team will confirm your visit.",
  sectionLabel: "БРОНЮВАННЯ",
  selectDateHint: "Оберіть день, щоб переглянути вільний час / Choose a day to view available times",
  selectMaster: "Оберіть спеціаліста / Choose specialist",
  selectService: "Оберіть послугу / Choose treatment",
  service: "Послуга / Treatment",
  showLess: "Показати менше / Show less",
  showMore: "Показати весь час / Show all times",
  slotsLoading: "Перевіряємо доступність… / Checking availability…",
  submitBtn: "Надіслати запит / Send request",
  submitting: "Надсилаємо... / Sending...",
  summary: "Ваш вибір / Your selection",
  summaryEyebrow: "ВАШЕ БРОНЮВАННЯ / YOUR RESERVATION",
  time: "Доступний час / Available times",
  timeLabel: "Час / Time",
  title: "Забронюйте мить для себе",
  nextDates: "Наступні дати / Next dates",
  nextTimes: "Наступний час / Next times",
  viaBooksy: "Відкрити Booksy / Open Booksy",
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
function getTodayInputDate() { return toInputDate(new Date()); }
function getServiceDurations(service, isTopMaster = false) {
  return (service?.time ?? [])
    .map((minutes, index) => {
      const min = Number(minutes);
      const topPrice = Number(service?.priceTopMaster?.[index] ?? service?.prices?.topMaster?.[min]);
      const regularPrice = Number(service?.price?.[index] ?? service?.prices?.master?.[min]);
      const price = isTopMaster && topPrice > 0 ? topPrice : (regularPrice > 0 ? regularPrice : topPrice || 0);
      return { minutes: min, price };
    })
    .filter((item) => item.minutes >= 30);
}
function normalizeSlotTime(value) { return String(value ?? "").trim().slice(0, 5); }
function getSlotKey(slot) { return `${slot.startTime}|${slot.master}`; }
const NORMALIZE_MASTER_DISPLAY = { "ольга": "Olha", "максим": "Max", "olga": "Olha", "max": "Max" };
function formatMasterDisplay(value) {
  const raw = String(value ?? "").trim();
  return NORMALIZE_MASTER_DISPLAY[raw.toLowerCase()] || raw;
}
function formatMasterWithTier(value, isUkrainianMode = false) {
  const name = formatMasterDisplay(value);
  if (!name) return "";
  const isTopMaster = /top/i.test(name) || /olha|olga|ольга/i.test(name);
  if (isUkrainianMode) {
    return isTopMaster ? `${name} (Топ-майстер / Top Master)` : `${name} (Майстер / Master)`;
  }
  return isTopMaster ? `${name} (Top Master)` : `${name} (Master)`;
}
const DEFAULT_KNOWN_MASTERS = ["Max", "Olha"];
function sortMasters(masters) {
  const priority = { max: 0, olha: 1 };
  return [...new Set(masters)].sort((a, b) =>
    (priority[String(a).toLowerCase()] ?? 2) - (priority[String(b).toLowerCase()] ?? 2) ||
    String(a).localeCompare(String(b))
  );
}
const DEFAULT_SERVICES_BY_MASTER = {
  Olha: [
    "masaz-klasyczny",
    "masaz-relaksacyjny",
    "masaz-limfatyczny",
    "masaz-antycellulitowy",
    "masaz-twarzy-i-glowy",
    "masaz-autorski",
    "masaz-dla-dwojga",
  ],
  Max: [
    "masaz-klasyczny",
    "masaz-sportowy",
    "masaz-relaksacyjny",
    "masaz-limfatyczny",
    "masaz-antycellulitowy",
    "masaz-autorski",
    "masaz-dla-dwojga",
  ],
};
function getSlotColumns() {
  if (typeof window === "undefined") return 8;
  if (window.innerWidth <= 360) return 2;
  if (window.innerWidth <= 640) return 3;
  if (window.innerWidth <= 900) return 4;
  return 8;
}
function Field({ children, className = "", id, label, optional }) {
  return <label className={`booking-field ${className}`.trim()} htmlFor={id}><span>{label}{optional ? <small>{optional}</small> : null}</span>{children}</label>;
}

export default function BookingSection({ isStandalone = false }) {
  const { t, lang, localizedServices } = useTranslation();
  const { contact } = useContent();
  const isUkrainianMode = lang === "uk";
  const copy = isUkrainianMode ? UK_EN_COPY : EN_PL_COPY;
  const bilingualServices = isUkrainianMode ? UK_EN_SERVICES : EN_PL_SERVICES;
  const siteBookingEnabled = contact?.siteBookingEnabled !== false;
  const dateInputRef = useRef(null);
  const datesRef = useRef(null);
  const slotsRef = useRef(null);
  const dateSearchRequestRef = useRef(0);
  const [step, setStep] = useState(1);
  const [dateWindowStart, setDateWindowStart] = useState(getTodayInputDate);
  const [dateScroll, setDateScroll] = useState({ left: false, right: true });
  const [slotScroll, setSlotScroll] = useState({ left: false, right: false });
  const [slotColumns, setSlotColumns] = useState(getSlotColumns);
  const [knownMasters, setKnownMasters] = useState(DEFAULT_KNOWN_MASTERS);
  const [servicesByMaster, setServicesByMaster] = useState(DEFAULT_SERVICES_BY_MASTER);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [form, setForm] = useState({ clientEmail: "", clientName: "", clientPhone: "", durationMinutes: "", note: "", preferredDate: "", preferredMaster: "", preferredTime: "", serviceSlug: "" });
  const [slots, setSlots] = useState([]);
  const [dateSearchLoading, setDateSearchLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [submitState, setSubmitState] = useState({ error: "", loading: false, success: false });

  useEffect(() => {
    fetchSiteBookingMasters()
      .then((data) => {
        const apiMasters = Array.isArray(data?.masters) && data.masters.length
          ? data.masters.map(formatMasterDisplay).filter(Boolean)
          : [];
        if (apiMasters.length) {
          setKnownMasters((current) => sortMasters([...current, ...apiMasters]));
        }
        if (data?.servicesByMaster && typeof data.servicesByMaster === "object") {
          setServicesByMaster((current) => ({ ...current, ...data.servicesByMaster }));
        }
      })
      .catch(() => {});
  }, []);

  const isSelectedMasterTop = useMemo(() => {
    const raw = String(form.preferredMaster ?? "");
    return /top/i.test(raw) || /olha|olga|ольга/i.test(raw);
  }, [form.preferredMaster]);

  const availableServices = useMemo(() => {
    if (!form.preferredMaster) return localizedServices;
    const masterKey = formatMasterDisplay(form.preferredMaster);
    const allowed = servicesByMaster[masterKey] ?? DEFAULT_SERVICES_BY_MASTER[masterKey];
    if (!Array.isArray(allowed) || allowed.length === 0) return localizedServices;
    return localizedServices.filter((service) => allowed.includes(service.slug));
  }, [form.preferredMaster, localizedServices, servicesByMaster]);

  const selectedService = useMemo(
    () => (form.serviceSlug ? availableServices.find((service) => service.slug === form.serviceSlug) ?? null : null),
    [form.serviceSlug, availableServices]
  );
  const selectedServiceSlug = selectedService?.slug ?? "";
  const selectedServiceTitle = selectedService?.title ?? "";
  const durationOptions = useMemo(
    () => (selectedService ? getServiceDurations(selectedService, isSelectedMasterTop) : []),
    [selectedService, isSelectedMasterTop]
  );
  const defaultDurationPlaceholders = useMemo(() => [{ minutes: 60 }, { minutes: 75 }, { minutes: 90 }, { minutes: 120 }], []);
  const displayDurations = durationOptions.length ? durationOptions : defaultDurationPlaceholders;
  const dateOptions = useMemo(() => Array.from({ length: DAYS_IN_CAROUSEL }, (_, index) => addDays(dateWindowStart, index)), [dateWindowStart]);

  useEffect(() => {
    setForm((current) => {
      if (!current.serviceSlug) {
        if (!current.durationMinutes && !current.preferredTime) return current;
        return { ...current, durationMinutes: "", preferredTime: "" };
      }
      const valid = durationOptions.some((item) => String(item.minutes) === String(current.durationMinutes));
      if (!valid) {
        if (!current.durationMinutes && !current.preferredTime) return current;
        return { ...current, durationMinutes: "", preferredTime: "" };
      }
      return current;
    });
  }, [durationOptions]);
  useEffect(() => {
    if (!siteBookingEnabled || !selectedServiceSlug || !form.durationMinutes || !form.preferredMaster) {
      setDateSearchLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const requestId = ++dateSearchRequestRef.current;
    const findNearestAvailableDate = async () => {
      setDateSearchLoading(true);
      setSlotsError("");
      setSlots([]);
      setForm((current) => ({ ...current, preferredDate: "", preferredTime: "" }));

      try {
        const today = getTodayInputDate();
        for (let offset = 0; offset < DAYS_IN_CAROUSEL; offset += DATE_SEARCH_BATCH_SIZE) {
          const dates = Array.from(
            { length: Math.min(DATE_SEARCH_BATCH_SIZE, DAYS_IN_CAROUSEL - offset) },
            (_, index) => addDays(today, offset + index)
          );
          const results = await Promise.all(dates.map(async (preferredDate) => {
            try {
              const data = await fetchSiteBookingSlots({
                durationMinutes: Number(form.durationMinutes),
                preferredDate,
                preferredMaster: form.preferredMaster,
                serviceName: selectedServiceTitle,
                serviceSlug: selectedServiceSlug,
              }, { signal: controller.signal });
              return { preferredDate, slots: Array.isArray(data?.slots) ? data.slots : [] };
            } catch (error) {
              if (controller.signal.aborted) throw error;
              return { preferredDate, slots: [] };
            }
          }));
          const nearest = results.find((result) => result.slots.length > 0);
          if (nearest && dateSearchRequestRef.current === requestId) {
            setDateWindowStart(today);
            setForm((current) => ({ ...current, preferredDate: nearest.preferredDate, preferredTime: "" }));
            return;
          }
        }
      } catch {
        // An aborted search is expected when the selection changes quickly.
      } finally {
        if (!controller.signal.aborted && dateSearchRequestRef.current === requestId) setDateSearchLoading(false);
      }
    };

    findNearestAvailableDate();
    return () => controller.abort();
  }, [form.durationMinutes, form.preferredMaster, selectedServiceSlug, selectedServiceTitle, siteBookingEnabled]);
  useEffect(() => {
    if (!siteBookingEnabled || !selectedServiceSlug || !form.durationMinutes || !form.preferredDate) { setSlots([]); return undefined; }
    const controller = new AbortController();
    setSlotsLoading(true); setSlotsError("");
    fetchSiteBookingSlots({ durationMinutes: Number(form.durationMinutes), preferredDate: form.preferredDate, preferredMaster: form.preferredMaster, serviceName: selectedServiceTitle, serviceSlug: selectedServiceSlug }, { signal: controller.signal })
      .then((data) => {
        const rawSlots = Array.isArray(data?.slots) ? data.slots : [];
        const nextSlots = rawSlots.map((slot) => ({
          ...slot,
          master: formatMasterDisplay(slot.master),
        })).sort((a, b) => normalizeSlotTime(a.startTime).localeCompare(normalizeSlotTime(b.startTime)) || a.master.localeCompare(b.master));

        setSlots(nextSlots);
        const apiMasters = Array.isArray(data?.masters) && data.masters.length
          ? data.masters.map(formatMasterDisplay).filter(Boolean)
          : [...new Set(nextSlots.map((slot) => String(slot.master ?? "").trim()).filter(Boolean))];
        if (apiMasters.length) {
          setKnownMasters((current) => sortMasters([...current, ...apiMasters]));
        }
      })
      .catch(() => { if (!controller.signal.aborted) { setSlots([]); setSlotsError(t("booking.form.errorSlots")); } })
      .finally(() => { if (!controller.signal.aborted) setSlotsLoading(false); });
    return () => controller.abort();
  }, [availabilityVersion, form.durationMinutes, form.preferredDate, form.preferredMaster, selectedServiceSlug, selectedServiceTitle, siteBookingEnabled, t]);

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
  const hasMaster = Boolean(form.preferredMaster);
  const hasService = hasMaster && Boolean(form.serviceSlug);
  const hasDuration = hasService && Boolean(form.durationMinutes);
  const hasDate = hasDuration && Boolean(form.preferredDate);
  const hasTime = hasDate && Boolean(form.preferredTime && selectedSlot);
  const isAvailabilityLoading = dateSearchLoading || slotsLoading;
  const isReadyForDetails = hasTime && !slotsLoading;

  const hasName = form.clientName.trim().length >= 2;
  const isPhoneValid = validateInternationalPhoneInput(form.clientPhone).ok;
  const isReadyToSubmit = hasName && isPhoneValid && !submitState.loading;

  const slotFinalPrice = Number(selectedSlot?.finalPrice) || 0;
  const isSelectedSlotPremium = Number(selectedSlot?.premiumPercent) > 0 || Number(selectedSlot?.premiumAmount) > 0;
  const activePriceLabel = hasTime && slotFinalPrice > 0
    ? `${slotFinalPrice} zł`
    : "—";

  const updateField = (name, value) => {
    setSubmitState((current) => ({ ...current, error: "", success: false }));
    setForm((current) => {
      const next = {
        ...current,
        [name]: value,
        ...(["serviceSlug", "durationMinutes", "preferredDate", "preferredMaster"].includes(name) ? { preferredTime: "" } : null),
      };

      if (name === "preferredMaster") {
        const masterKey = formatMasterDisplay(value);
        const allowed = servicesByMaster[masterKey] ?? DEFAULT_SERVICES_BY_MASTER[masterKey];
        if (Array.isArray(allowed) && current.serviceSlug && !allowed.includes(current.serviceSlug)) {
          next.serviceSlug = "";
          next.durationMinutes = "";
        }
      }

      return next;
    });
  };
  const handlePhoneChange = (event) => updateField("clientPhone", formatInternationalPhoneInput(event.target.value));
  const handleDurationChange = (minutes) => {
    setSubmitState((current) => ({ ...current, error: "", success: false }));
    setForm((current) => ({ ...current, durationMinutes: String(minutes), preferredDate: "", preferredTime: "" }));
  };
  const handleDateChange = (value) => {
    dateSearchRequestRef.current += 1;
    setDateSearchLoading(false);
    updateField("preferredDate", value);
    if (!dateOptions.includes(value)) setDateWindowStart(value);
  };
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
  useEffect(() => {
    if (!form.preferredDate) return;
    const selectedDate = datesRef.current?.querySelector(`[data-booking-date="${form.preferredDate}"]`);
    selectedDate?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [form.preferredDate]);
  const validateSelection = () => {
    if (!form.preferredMaster) return copy.selectMaster;
    if (!selectedService || !form.serviceSlug) return t("booking.form.errorService");
    if (!form.durationMinutes) return t("booking.form.errorDuration");
    if (!form.preferredDate || !form.preferredTime) return t("booking.form.errorDateTime");
    if (!selectedSlot) return t("booking.form.errorSlot");
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
    if (!isReadyToSubmit) return;
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
  const Shell = isStandalone ? "div" : ScrollAnimationWrapper;

  return (
    <section id="contact" className={`booking-section ${isStandalone ? "booking-section--standalone" : ""}`.trim()}>
      {!isStandalone ? <SiteImage src="/booking/booking.jpg" alt="" fill className="booking-section__image" loading="lazy" aria-hidden="true" /> : null}
      {!isStandalone ? <div className="booking-section__veil" /> : null}
      <Container className="booking-section__container"><Shell className="booking-shell">
        <header className="booking-intro">
          {!isStandalone && <p className="section-label text-gold">{copy.sectionLabel}</p>}
          <h2>{copy.title}</h2>
          {!isStandalone && <p>{copy.formIntro}</p>}
        </header>
        <form className="booking-panel" onSubmit={handleSubmit} noValidate>
          {!siteBookingEnabled ? (
            <div className="booking-state"><CalendarDays aria-hidden="true" /><h3>{copy.disabledTitle}</h3><p>{t("booking.disabledMessage")}</p><Button href={`tel:${contact.phone}`} size="lg">{copy.callNow}: {contact.phoneDisplay}</Button></div>
          ) : submitState.success ? (
            <div className="booking-state" role="status"><span className="booking-success-mark"><Check /></span><h3>{t("booking.form.successTitle")}</h3><p>{t("booking.form.successMessage")}</p><div className="booking-confirmation-card"><strong>{bilingualServices[selectedService?.slug] || selectedService?.title}</strong><span>{formattedDate} · {selectedSlot?.startTime} · {formatMasterWithTier(selectedSlot?.master, isUkrainianMode)}</span></div><Button size="sm" type="button" onClick={resetAfterSuccess}>{t("booking.form.successClose")}</Button></div>
          ) : <>
            <div className="booking-progress"><button className={step === 1 ? "is-active" : "is-complete"} type="button" onClick={() => setStep(1)}><span>{step === 2 ? <Check size={14} /> : "1"}</span>{copy.dayStep}</button><i /><button className={step === 2 ? "is-active" : ""} type="button" disabled={step === 1} onClick={() => setStep(2)}><span>2</span>{copy.detailsStep}</button></div>
            {step === 1 ? (
              <div className="booking-step">
                <div className="booking-selection-grid">
                  <Field id="booking-master" label={copy.master}>
                    <select id="booking-master" value={form.preferredMaster} onChange={(event) => updateField("preferredMaster", event.target.value)}>
                      <option value="" disabled hidden>{copy.selectMaster}</option>
                      {knownMasters.map((master) => <option key={master} value={master}>{formatMasterWithTier(master, isUkrainianMode)}</option>)}
                    </select>
                  </Field>
                  <Field className={!hasMaster ? "booking-field--disabled" : ""} id="booking-service" label={copy.service}>
                    <select id="booking-service" disabled={!hasMaster} value={form.serviceSlug} onChange={(event) => updateField("serviceSlug", event.target.value)}>
                      <option value="" disabled hidden>{copy.selectService}</option>
                      {availableServices.map((service) => <option key={service.slug} value={service.slug}>{bilingualServices[service.slug] || service.title}</option>)}
                    </select>
                  </Field>
                  <fieldset className={`booking-field booking-duration ${!hasService ? "booking-field--disabled" : ""}`}>
                    <legend>{copy.duration}</legend>
                    <div className="booking-segments">
                      {displayDurations.map((item) => (
                        <button
                          aria-pressed={hasService && String(item.minutes) === String(form.durationMinutes)}
                          className={hasService && String(item.minutes) === String(form.durationMinutes) ? "is-active" : ""}
                          disabled={!hasService}
                          key={item.minutes}
                          type="button"
                          onClick={() => handleDurationChange(item.minutes)}
                        >
                          <strong>{item.minutes}</strong>
                          <span>{copy.durationUnit}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <div className="booking-schedule">
                  <div className={`booking-schedule-block ${!hasDuration ? "booking-block--disabled" : ""}`}>
                    <div className="booking-block-heading"><div><span>01</span><h3>{copy.date}</h3></div><button className="booking-date-picker" disabled={!hasDuration} type="button" onClick={() => dateInputRef.current?.showPicker?.()}><CalendarDays size={17} />{copy.datePicker}<input disabled={!hasDuration} ref={dateInputRef} min={getTodayInputDate()} type="date" value={form.preferredDate} onChange={(event) => handleDateChange(event.target.value)} /></button></div>
                    <div className="booking-date-row"><button aria-label={copy.previousDates} disabled={!hasDuration || !dateScroll.left} type="button" onClick={() => scrollDates(-1)}><ChevronLeft /></button><div ref={datesRef} className="booking-date-strip" onScroll={updateDateScroll}>{dateOptions.map((dateValue) => { const date = fromInputDate(dateValue); const locale = LOCALES[lang] ?? LOCALES.pl; const isSelected = form.preferredDate === dateValue; return <button aria-pressed={isSelected} className={isSelected ? "is-active" : ""} data-booking-date={dateValue} disabled={!hasDuration} key={dateValue} type="button" onClick={() => handleDateChange(dateValue)}><span>{new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date)}</span><strong>{date.getDate()}</strong><small>{new Intl.DateTimeFormat(locale, { month: "short" }).format(date)}</small></button>; })}</div><button aria-label={copy.nextDates} disabled={!hasDuration || !dateScroll.right} type="button" onClick={() => scrollDates(1)}><ChevronRight /></button></div>
                  </div>
                  <div className={`booking-schedule-block ${!hasDate && !isAvailabilityLoading ? "booking-block--disabled" : ""} ${isAvailabilityLoading ? "is-loading" : ""}`.trim()}>
                    <div className="booking-block-heading booking-time-heading"><div><span>02</span><h3>{copy.time}</h3></div>{!isAvailabilityLoading ? <div className="booking-slot-controls"><button aria-label={copy.previousTimes} disabled={!hasDate || !slotScroll.left} type="button" onClick={() => scrollSlots(-1)}><ChevronLeft /></button><button aria-label={copy.nextTimes} disabled={!hasDate || !slotScroll.right} type="button" onClick={() => scrollSlots(1)}><ChevronRight /></button></div> : null}</div>
                    <div ref={slotsRef} className="booking-slots" aria-busy={isAvailabilityLoading} aria-live="polite" onScroll={updateSlotScroll}>{isAvailabilityLoading ? <div className="booking-slot-loading" role="status"><LoaderCircle aria-hidden="true" /><span>{copy.slotsLoading}</span></div> : !hasDate ? <div className="booking-empty"><Clock3 /><span>{copy.selectDateHint}</span></div> : !visibleSlots.length ? <div className="booking-empty"><Clock3 /><span>{slotsError || copy.noSlots}</span></div> : slotPages.map((pageSlots, pageIndex) => <div className="booking-slot-page" key={`${form.preferredDate}-${pageIndex}`} style={{ "--booking-slot-columns": slotColumns }}>{pageSlots.map((slot) => { const slotKey = getSlotKey(slot); const active = form.preferredTime === slotKey; return <button aria-pressed={active} className={active ? "is-active" : ""} disabled={!hasDate} key={`${slot.master}-${slot.startTime}`} type="button" onClick={() => updateField("preferredTime", slotKey)}><strong>{normalizeSlotTime(slot.startTime)}</strong><span>{formatMasterWithTier(slot.master, isUkrainianMode)}</span>{active ? <Check size={15} /> : null}</button>; })}</div>)}</div>
                  </div>
                </div>
                {submitState.error ? <p className="booking-error" role="alert">{submitState.error}</p> : null}
                <div className="booking-actions booking-actions--step-one">
                  <div className="booking-actions__price">
                    <span className="booking-actions__price-label">{copy.price}</span>
                    <strong className="booking-actions__price-value">{activePriceLabel}</strong>
                    {isSelectedSlotPremium ? <small className="booking-actions__premium">Premium godziny</small> : null}
                  </div>
                  <Button disabled={!isReadyForDetails} size="lg" type="button" onClick={goToDetails}>{copy.next}<ChevronRight size={17} /></Button>
                </div>
              </div>
            ) : (
              <div className="booking-step booking-step--details">
                <button className="booking-back" type="button" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} />
                  <span>{copy.back}</span>
                </button>

                <div className="booking-details-grid">
                  <div className="booking-contact-col">
                    <header className="booking-details-header">
                      <h2>{copy.detailsTitle}</h2>
                      <p>{copy.detailsSubtitle}</p>
                    </header>

                    <div className="booking-contact-fields">
                      <div className="booking-contact-row">
                        <Field id="booking-name" label={copy.nameLabel}>
                          <input
                            id="booking-name"
                            autoComplete="given-name"
                            placeholder={copy.namePlaceholder}
                            value={form.clientName}
                            onChange={(event) => updateField("clientName", event.target.value)}
                          />
                        </Field>

                        <Field
                          className={!hasName ? "booking-field--disabled" : ""}
                          id="booking-phone"
                          label={copy.phoneLabel}
                        >
                          <input
                            id="booking-phone"
                            autoComplete="tel"
                            disabled={!hasName}
                            inputMode="tel"
                            placeholder={defaultPhonePlaceholder(lang)}
                            value={form.clientPhone}
                            onChange={handlePhoneChange}
                          />
                        </Field>
                      </div>

                      <Field
                        className={!hasName ? "booking-field--disabled" : ""}
                        id="booking-email"
                        label={copy.emailLabel}
                        optional={copy.optional}
                      >
                        <input
                          id="booking-email"
                          autoComplete="email"
                          disabled={!hasName}
                          placeholder={copy.emailPlaceholder}
                          type="email"
                          value={form.clientEmail}
                          onChange={(event) => updateField("clientEmail", event.target.value)}
                        />
                      </Field>

                      <Field
                        className={!hasName ? "booking-field--disabled" : ""}
                        id="booking-note"
                        label={copy.noteLabel}
                        optional={copy.optional}
                      >
                        <input
                          id="booking-note"
                          autoComplete="off"
                          disabled={!hasName}
                          placeholder={copy.notePlaceholder}
                          type="text"
                          value={form.note}
                          onChange={(event) => updateField("note", event.target.value)}
                        />
                      </Field>
                    </div>
                  </div>

                  <aside className="booking-summary-col">
                    <div className="booking-summary-card">
                      <span className="booking-summary-card__eyebrow">{copy.summaryEyebrow}</span>
                      <h3 className="booking-summary-card__title">{bilingualServices[selectedService?.slug] || selectedService?.title}</h3>

                      <dl className="booking-summary-card__list">
                        <div className="booking-summary-card__item">
                          <dt className="booking-summary-card__label">{copy.durationLabel}</dt>
                          <dd className="booking-summary-card__value">{form.durationMinutes} {copy.durationUnit}</dd>
                        </div>
                        <div className="booking-summary-card__item">
                          <dt className="booking-summary-card__label">{copy.dateLabel}</dt>
                          <dd className="booking-summary-card__value">{formattedDate}</dd>
                        </div>
                        <div className="booking-summary-card__item">
                          <dt className="booking-summary-card__label">{copy.timeLabel}</dt>
                          <dd className="booking-summary-card__value">{normalizeSlotTime(selectedSlot?.startTime) || form.preferredTime}</dd>
                        </div>
                        <div className="booking-summary-card__item">
                          <dt className="booking-summary-card__label">{copy.master}</dt>
                          <dd className="booking-summary-card__value">{formatMasterWithTier(selectedSlot?.master || form.preferredMaster, isUkrainianMode)}</dd>
                        </div>
                      </dl>
                    </div>
                  </aside>
                </div>

                <div className="booking-actions booking-actions--step-two">
                  <div className="booking-actions__price">
                    <span className="booking-actions__price-label">{copy.price}</span>
                    <strong className="booking-actions__price-value">{activePriceLabel}</strong>
                    {isSelectedSlotPremium ? <small className="booking-actions__premium">Premium godziny</small> : null}
                  </div>
                  <Button
                    className="booking-submit-btn"
                    disabled={!isReadyToSubmit}
                    size="lg"
                    type="submit"
                  >
                    {submitState.loading ? copy.submitting : copy.submitBtn}
                    {!submitState.loading ? <ArrowRight size={17} /> : null}
                  </Button>
                </div>
              </div>
            )}
          </>}
        </form>
      </Shell></Container>
    </section>
  );
}
