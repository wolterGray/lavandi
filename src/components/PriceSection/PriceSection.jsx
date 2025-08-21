import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

const GOLD = "#D6B16A";

function PriceSection({ services }) {
  const [selectedTime, setSelectedTime] = useState("60");
  const times = ["30", "60", "75", "90", "120"];

  const filtered = useMemo(
    () => services.filter((s) => s.time?.includes(+selectedTime)),
    [services, selectedTime]
  );

  const mid = Math.ceil(filtered.length / 2);
  const colLeft = filtered.slice(0, mid);
  const colRight = filtered.slice(mid);

  return (
    <section
      id="prices"
      className="custom-cont px-4 bg-secondaryColor/40 border-[1px] border-primaryColor/10 select-none py-5 sm:py-16"
    >
      <ScrollAnimationWrapper>
        <SectionTitle className="text-center">Cennik</SectionTitle>

        {/* Таб-кнопки */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {times.map((time) => {
            const active = selectedTime === time;
            return (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                aria-pressed={active}
                className={[
                  "relative px-3 py-1.5 sm:px-4 sm:py-2",
                  "text-sm sm:text-base font-medium uppercase tracking-wide",
                  active ? "text-white" : "text-white/60 hover:text-white/90",
                  "border-b-[1px] transition-colors",
                ].join(" ")}
                style={{ borderColor: active ? GOLD : "transparent" }}
              >
                {time} min
              </button>
            );
          })}
        </div>

        {/* Две колонки */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTime}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-auto max-w-5xl"
          >
            {filtered.length === 0 ? (
              <p className="text-center text-white/60">
                Пока нет услуг с такой длительностью.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                {[colLeft, colRight].map((col, ci) => (
                  <div key={ci} className="flex flex-col">
                    {col.map((service, i) => {
                      const timeIdx = service.time.indexOf(+selectedTime);
                      const price = service.price?.[timeIdx];

                      return (
                        <div
                          key={`${service.title}-${i}`}
                          className="flex items-center justify-between min-h-[56px] py-2.5 sm:py-3
                                     border-b border-white/10 text-white/60 hover:bg-white/[.03] transition-colors"
                        >
                          <div className="pr-3">
                            <h3 className="text-[15px] sm:text-base uppercase font-medium">
                              {service.title}
                            </h3>
                            {service.subtitle ? (
                              <p className="text-xs sm:text-sm text-white/50 line-clamp-1">
                                {service.subtitle}
                              </p>
                            ) : null}
                          </div>

                          <p
                            className="text-base sm:text-sm font-semibold tabular-nums whitespace-nowrap"
                            style={{ color: GOLD }}
                          >
                            {price != null ? `${price} zł` : "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Сноска с иконками */}
        {/* Сноска с иконками */}
<div className="mt-8 flex flex-col items-center gap-3 text-center">
  <p className="text-xs text-white/50">
    Ceny brutto. Płatność kartą / BLIK dostępna.
  </p>

  <div className="flex items-center gap-4 opacity-90">
    {/* BLIK */}
    <span className="bg-white text-black font-bold text-[10px] px-2.5 py-1 rounded-md shadow-sm">
      BLIK
    </span>

    {/* VISA */}
    <div className="bg-white rounded-md px-2.5 py-1 shadow-sm flex items-center justify-center">
      <span className="text-[#1A1F71] font-extrabold text-xs tracking-wide">
        VISA
      </span>
    </div>

    {/* Mastercard */}
    <div className="bg-white rounded-md px-2.5 py-1 shadow-sm flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24" className="h-4">
        <circle cx="18" cy="12" r="7" fill="#EB001B" />
        <circle cx="30" cy="12" r="7" fill="#F79E1B" />
        <path
          d="M24 19a7 7 0 0 1 0-14 7 7 0 0 1 0 14z"
          fill="#FF5F00"
        />
      </svg>
    </div>
  </div>
</div>


      </ScrollAnimationWrapper>
    </section>
  );
}

export default PriceSection;
