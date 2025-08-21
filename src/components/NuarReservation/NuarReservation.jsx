// NUAR Booking — React 2‑step widget (no external UI libs)
// Tailwind-friendly. If Tailwind isn't in your project, it will still work with plain HTML styles.
// Backend: your Google Apps Script provided in the chat (doGet/doPost).
// ---- Quick start ----
// <NuarBookingWidget
//    apiBase="https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
//    token="nuar_2025_secure"
//    services={[
//      { id: "classic", label: "Masaż klasyczny" },
//      { id: "relax",   label: "Masaż relaksacyjny" },
//      { id: "deep",    label: "Masaż tkanek głębokich" },
//      { id: "lymph",   label: "Drenaż limfatyczny" },
//    ]}
//    durations={[30,60,90,120]} // minutes
//    daysAhead={14}
// />
// Notes:
// - The GAS backend expects: GET action=slots&duration=MINUTES&token=... ; POST JSON with token,startISO,endISO,name,phone,service.
// - To also store client comment in the calendar, add to doPost() on GAS:
//     var notes = body.notes || ""; // then include it in event description
//     description: "Klient: "+name+"\nTel: "+phone+(notes?"\nUwagi: "+notes:"")
// -------------------------------------------------------------

import React, {useEffect, useMemo, useRef, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Pagination, A11y, Keyboard, FreeMode} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {motion} from "framer-motion";
import {BiCross} from "react-icons/bi";
import {BsCrosshair} from "react-icons/bs";
import {RxCross2} from "react-icons/rx";

// — Runtime config set by Вова
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbziZXfa0PHorcnuKQWi_ORmEPaoGosM89Rwd99jxPOHYzHXhuLJAAyqra1JAHQvXaYrlA/exec";
const TOKEN = "nuar_2025_secure";

export default function NuarBookingWidget({
  open = false,
  setOpen,
  apiBase = WEB_APP_URL, // uses configured WEB_APP_URL
  token = TOKEN,
  services,
  durations = [30, 60, 90, 120],
  daysAhead = 14,
}) {
  const [step, setStep] = useState(1);

  // Step 1 form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(services?.[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(durations?.[1] || 60);

  // Step 2 data
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsByDay, setSlotsByDay] = useState({});
  const [timezone, setTimezone] = useState("Europe/Warsaw");
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [reserving, setReserving] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canContinueStep1 = useMemo(() => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      /^\+?[0-9\s()-]{6,}$/.test(phone.trim()) &&
      Boolean(service) &&
      Number(duration) > 0
    );
  }, [firstName, lastName, phone, service, duration]);

  function fullName() {
    return `${firstName.trim()} ${lastName.trim()}`.trim();
  }

  async function fetchSlots() {
    setError("");
    setLoadingSlots(true);
    setSelectedDay("");
    setSelectedSlot(null);
    try {
      const url = new URL(apiBase);
      url.searchParams.set("action", "slots");
      url.searchParams.set("token", token);
      url.searchParams.set("duration", String(duration));
      url.searchParams.set("days", String(daysAhead));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Unknown error");

      setSlotsByDay(data.slotsByDay || {});
      setTimezone(data.timezone || "Europe/Warsaw");

      // auto-select the first day that has slots
      const firstDayKey = Object.keys(data.slotsByDay || {}).sort()[0] || "";
      setSelectedDay(firstDayKey);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoadingSlots(false);
    }
  }

  async function reserve() {
    if (!selectedSlot) return;
    setReserving(true);
    setError("");
    try {
      const payload = {
        token,
        startISO: selectedSlot.start,
        endISO: selectedSlot.end,
        name: fullName(),
        phone: phone.trim(),
        service:
          `${serviceLabel(service)} · ${duration} min` +
          (notes ? ` · Uwagi: ${notes}` : ""),
        notes, // will be ignored by your current GAS until you add it (see top comment)
      };
      const form = new URLSearchParams();
      Object.entries(payload).forEach(([k, v]) => form.append(k, String(v)));
      const res = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: form.toString(),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = {ok: false, error: `HTTP ${res.status}`};
      }
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setReservation({id: data.id, slot: selectedSlot});
      setConfirmOpen(true);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setReserving(false);
    }
  }

  function serviceLabel(id) {
    return services.find((s) => s.id === id)?.label || id;
  }

  // Reset Step 1 form to initial state (after successful reservation)
  function resetClientForm() {
    setFirstName("");
    setLastName("");
    setPhone("");
    setNotes("");
    setService(services?.[0]?.id || "");
    setDuration(durations?.[1] || 60);
  }

  // UI helpers
  const section = "max-w-3xl mx-auto w-full";
  const card =
    "rounded-3xl   backdrop-blur p-5 md:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.06)]  ";
  const label = "block text-sm font-medium  text-primaryColor my-2";
  const input =
    "w-full rounded-xl border-[1px] border-primaryColor/40  bg-secondaryColor/20  px-3 py-4 outline-none focus:ring-1 focus:ring-primaryColor focus:border-primaryColor transition";
  const btn =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary =
    "bg-gradient-to-r from-[#0d0510] to-black text-white hover:from-black hover:to-[#0d0510] focus:ring-2 focus:ring-offset-2 focus:ring-[#b7864d] border border-[#b7864d]/60";
  const btnGhost =
    "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100";

  return open ? (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: 0.5}}
      className="bg-black/80 backdrop-blur-sm fixed flex justify-center items-center w-screen h-screen left-0 top-0 z-50">
      <div className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[70vw] relative bg-secondaryColor z-50 border-[1px] border-primaryColor/50 p-6 sm:p-10 rounded-xl text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
        <RxCross2
          onClick={() => setOpen(false)}
          className="text-primaryColor text-4xl cursor-pointer hover:text-primaryColor/80  absolute right-5 top-5"
        />
        <h2 className="font-cinzel text-2xl sm:text-5xl text-primaryColor text-center">
          Reservation
        </h2>
        {/* STEP 1: Client + Service */}
        {step === 1 && (
          <div className={`${section} ${card}`}>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:space-x-5">
                <div>
                  <label className={label}>Имя</label>
                  <input
                    className={input}
                    placeholder="Ім'я / Imię"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Фамилия</label>
                  <input
                    className={input}
                    placeholder="Nazwisko"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={label}>Телефон</label>
                <input
                  className={input}
                  placeholder="+48 000 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className={label}>Выбор массажа</label>
                <CustomSelect
                  value={service}
                  onChange={setService}
                  options={services.map((s) => ({
                    value: s.title,
                    label: s.title,
                  }))}
                  placeholder="Выберите услугу"
                />
              </div>
              <div>
                <label className={label}>Длительность</label>
                <Segmented
                  value={String(duration)}
                  onChange={(v) => setDuration(Number(v))}
                  options={durations.map((d) => ({
                    value: String(d),
                    label: `${d} мин`,
                  }))}
                />
              </div>
              <div>
                <label className={label}>Комментарий (необязательно)</label>
                <textarea
                  className={`${input} min-h-[44px]`}
                  placeholder="Пожелания, уточнения…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                className={`${btn} ${btnPrimary} w-1/2 mx-auto py-4`}
                disabled={!canContinueStep1}
                onClick={async () => {
                  setStep(2);
                  setLoadingSlots(true);
                  await fetchSlots();
                }}>
                Продолжить
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Date & Time */}
        {step === 2 && (
          <div className={`${section} flex flex-col gap-4`}>
            <div className={`${card} relative`}>
              {loadingSlots && (
                <LoadingOverlay message="Получаем доступные слоты…" />
              )}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    Шаг 2 · Дата и время
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    Услуга: <b>{serviceLabel(service)}</b> • Длительность:{" "}
                    <b>{duration} мин</b>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`${btn} ${btnGhost}`}
                    onClick={() => setStep(1)}>
                    Назад
                  </button>
                  <button
                    className={`${btn} ${btnGhost}`}
                    onClick={fetchSlots}
                    disabled={loadingSlots}>
                    {loadingSlots ? <Spinner /> : "Обновить слоты"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-300/60 bg-red-50 text-red-800 p-3 text-sm">
                  Ошибка: {error}
                </div>
              )}

              {/* Days scroller */}
              <div className="mt-4">
                {loadingSlots ? (
                  <DaysSkeleton />
                ) : (
                  <DaysSwiper
                    slotsByDay={slotsByDay}
                    selectedDay={selectedDay}
                    onSelectDay={setSelectedDay}
                  />
                )}
              </div>

              {/* Time grid */}
              <div className="mt-4">
                {loadingSlots ? (
                  <TimesSkeleton />
                ) : (
                  <TimeSwiper
                    timezone={timezone}
                    slots={(selectedDay && slotsByDay[selectedDay]) || []}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />
                )}
              </div>

              {/* Reserve CTA */}
              <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                <div className="text-sm text-zinc-500">
                  Время указано для часового пояса <b>{timezone}</b>.
                </div>
                <button
                  className={`${btn} ${btnPrimary}`}
                  disabled={!selectedSlot || reserving}
                  onClick={reserve}>
                  {reserving ? <Spinner /> : "Зарезервировать"}
                </button>
              </div>
            </div>

            {/* Success state */}
          </div>
        )}

        {confirmOpen && reservation && (
          <ConfirmDialog
            reservation={reservation}
            timezone={timezone}
            onClose={() => {
              resetClientForm();
              setSelectedSlot(null);
              setSelectedDay("");
              setSlotsByDay({});
              setReservation(null);
              setConfirmOpen(false);
              setStep(1);
            }}
          />
        )}
      </div>
    </motion.div>
  ) : (
    <></>
  );
}

// ————— UI SUB-COMPONENTS —————

function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Выберите",
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onDoc(e) {
      if (!btnRef.current) return;
      if (!btnRef.current.parentElement?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        className="w-full text-left rounded-xl border-[1px] border-primaryColor/50   px-3 py-4 outline-none focus:ring-2 focus:ring-primaryColor transition"
        onClick={() => setOpen((v) => !v)}>
        <span className={selected ? "" : "text-zinc-400"}>
          {selected ? selected.label : placeholder}
        </span>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg max-h-64 overflow-auto">
          {options.map((o) => (
            <div
              key={o.value}
              className={
                "px-3 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 " +
                (o.value === value
                  ? "bg-zinc-100 dark:bg-zinc-800 font-medium"
                  : "")
              }
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Segmented({value, onChange, options = []}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            "px-3 py-2 rounded-xl text-sm border " +
            (o.value === value
              ? "border-[#b7864d] bg-[#0d0510] text-white"
              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800")
          }>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DaysSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-hidden">
      {Array.from({length: 5}).map((_, i) => (
        <div
          key={i}
          className="min-w-[130px] h-[64px] rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
        />
      ))}
    </div>
  );
}

function TimesSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
      {Array.from({length: 16}).map((_, i) => (
        <div
          key={i}
          className="h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
        />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5 animate-spin"
      aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth="4"
        stroke="currentColor"
        fill="none"
        opacity="0.2"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        strokeWidth="4"
        stroke="currentColor"
        fill="none"
      />
    </svg>
  );
}

function LoadingOverlay({message = "Получаем доступные слоты…"}) {
  return (
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
      aria-busy>
      <div className="flex items-center gap-3 text-zinc-800 dark:text-zinc-200 text-sm font-medium">
        <Spinner />
        <span>{message}</span>
      </div>
    </div>
  );
}

function ConfirmDialog({reservation, timezone, onClose}) {
  if (!reservation) return null;
  const {slot, id} = reservation || {};
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#b7864d]/60 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="p-5 md:p-6">
          <h3 className="text-xl font-bold text-primaryColor">
            Резервация оформлена ✅
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {formatDateTimeRange(slot.start, slot.end, timezone)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            ID события:{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
              {id}
            </code>
          </p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#0d0510] to-black text-white border border-[#b7864d]/60 hover:from-black hover:to-[#0d0510] focus:ring-2 focus:ring-offset-2 focus:ring-[#b7864d]">
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ————— UTIL —————
function formatDateTimeRange(startISO, endISO, tz = "Europe/Warsaw") {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const date = s.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const sh = s.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const eh = e.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}, ${sh}–${eh} (${tz})`;
}

// Optional: minimal CSS to hide scrollbars in scroller (works with Tailwind too)
const style = document?.createElement?.("style");
if (style) {
  style.innerHTML = `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
.swiper{--swiper-theme-color:#b7864d}
.swiper-pagination-bullet{opacity:.4}
.swiper-pagination-bullet-active{opacity:1}
.swiper-button-disabled{opacity:.35;cursor:default}`;
  document.head.appendChild(style);
}

// — Swiper-based selectors —
function DaysSwiper({slotsByDay = {}, selectedDay, onSelectDay}) {
  const days = useMemo(() => Object.keys(slotsByDay).sort(), [slotsByDay]);
  const navId = useMemo(
    () => `days-${Math.random().toString(36).slice(2, 8)}`,
    []
  );
  if (!days.length)
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 text-sm text-zinc-500">
        Нет доступных дней. Попробуйте другую длительность или позже.
      </div>
    );

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        aria-label="Назад"
        className={`nav-prev-${navId} absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 z-[60] cursor-pointer rounded-full border border-zinc-200 bg-white text-zinc-900 flex items-center justify-center shadow-lg ring-1 ring-[#b7864d]/30 hover:shadow-xl transition`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* Right arrow */}
      <button
        aria-label="Вперёд"
        className={`nav-next-${navId} absolute -right-3 top-1/2 -translate-y-1/2 h-10 w-10 z-[60] cursor-pointer rounded-full border border-zinc-200 bg-white text-zinc-900 flex items-center justify-center shadow-lg ring-1 ring-[#b7864d]/30 hover:shadow-xl transition`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Swiper
        modules={[FreeMode, Navigation, Pagination, Keyboard, A11y]}
        slidesPerView={"auto"}
        spaceBetween={12}
        freeMode
        pagination={{clickable: true, dynamicBullets: true}}
        keyboard={{enabled: true}}
        navigation={{
          prevEl: `.nav-prev-${navId}`,
          nextEl: `.nav-next-${navId}`,
        }}
        className="!pb-6">
        {days.map((d) => {
          const date = new Date(d + "T00:00:00");
          const name = date.toLocaleDateString("ru-RU", {weekday: "short"});
          const label = date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          });
          const count = slotsByDay[d]?.length || 0;
          const active = selectedDay === d;
          return (
            <SwiperSlide key={d} className="!w-[170px]">
              <button
                onClick={() => onSelectDay(d)}
                className={
                  "w-full h-full text-left rounded-2xl border px-4 py-3 cursor-pointer shadow-sm " +
                  (active
                    ? "border-[#b7864d] bg-[#0d0510] text-white"
                    : "border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:border-[#b7864d]/40")
                }>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-xs opacity-70 uppercase">{name}</div>
                </div>
                <div className="mt-1 text-xs opacity-70">свободно: {count}</div>
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

function TimeSwiper({
  timezone = "Europe/Warsaw",
  slots = [],
  selectedSlot,
  onSelectSlot,
}) {
  if (!slots.length)
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 text-sm text-zinc-500">
        На выбранный день нет свободных слотов.
      </div>
    );

  const navId = useMemo(
    () => `time-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        aria-label="Назад"
        className={`nav-prev-${navId} absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 z-[60] cursor-pointer rounded-full border border-zinc-200 bg-white text-zinc-900 flex items-center justify-center shadow-lg ring-1 ring-[#b7864d]/30 hover:shadow-xl transition`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* Right arrow */}
      <button
        aria-label="Вперёд"
        className={`nav-next-${navId} absolute -right-3 top-1/2 -translate-y-1/2 h-10 w-10 z-[60] cursor-pointer rounded-full border border-zinc-200 bg-white text-zinc-900 flex items-center justify-center shadow-lg ring-1 ring-[#b7864d]/30 hover:shadow-xl transition`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Swiper
        modules={[FreeMode, Navigation, Pagination, Keyboard, A11y]}
        slidesPerView={"auto"}
        spaceBetween={10}
        freeMode
        pagination={{clickable: true, dynamicBullets: true}}
        keyboard={{enabled: true}}
        navigation={{
          prevEl: `.nav-prev-${navId}`,
          nextEl: `.nav-next-${navId}`,
        }}
        className="!pb-6">
        {slots.map((s) => {
          const start = new Date(s.start);
          const timeLabel = start.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const selected = selectedSlot?.start === s.start;
          return (
            <SwiperSlide key={s.start} className="!w-auto">
              <button
                onClick={() => onSelectSlot(s)}
                className={
                  "min-w-[76px] px-3 py-2 cursor-pointer text-sm rounded-xl border " +
                  (selected
                    ? "border-[#b7864d] bg-[#0d0510] text-white"
                    : "border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100/70 dark:hover:bg-zinc-800 hover:border-[#b7864d]/40")
                }
                title={`${formatDateTimeRange(s.start, s.end, timezone)}`}>
                {timeLabel}
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
