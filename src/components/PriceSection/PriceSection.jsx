import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

const GOLD = "#D6B16A";

function PriceSection({ services = [] }) {
  const [selectedTime, setSelectedTime] = useState("60");
  const times = ["30", "60", "75", "90", "120"];

  const filtered = useMemo(
    () => services.filter((s) => s.time?.includes(+selectedTime)),
    [services, selectedTime]
  );

  const mid = Math.ceil(filtered.length / 2);
  const colLeft = filtered.slice(0, mid);
  const colRight = filtered.slice(mid);

  const getDiscountedPrice = (price, discount = 0) => {
    if (!price || !discount) return price;
    return Math.round(price * (1 - discount / 100));
  };

  return (
    <section
      id="prices"
      className="relative "
    >
      <ScrollAnimationWrapper>
        <div className="custom-cont border border-primaryColor/50 p-10 m-10 relative overflow-hidden rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm ">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-primaryColor/8 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#d6b16a]/10 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="mb-8 text-center sm:mb-10">
              <SectionTitle className="text-center">Cennik</SectionTitle>
              <p className="mx-auto  max-w-2xl text-sm leading-6 text-white/55 sm:text-[15px] sm:leading-7">
                Wybierz czas trwania zabiegu i sprawdź aktualne ceny naszych
                rytuałów masażu.
              </p>
            </div>

            {/* tabs */}
            <div className="mb-8 flex flex-wrap justify-center gap-2.5 sm:mb-10 sm:gap-3">
              {times.map((time) => {
                const active = selectedTime === time;

                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    aria-pressed={active}
                    className={[
                      "relative rounded-full px-4 py-2 sm:px-5 sm:py-2.5",
                      "text-[13px] sm:text-sm uppercase tracking-[0.16em]",
                      "transition-all duration-300 border",
                      active
                        ? "text-[#1a140f] shadow-[0_8px_24px_rgba(214,177,106,0.18)]"
                        : "text-white/65 hover:text-white border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                    ].join(" ")}
                    style={{
                      background: active
                        ? `linear-gradient(180deg, ${GOLD}, #b99249)`
                        : undefined,
                      borderColor: active ? GOLD : undefined,
                    }}
                  >
                    {time} min
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedTime}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  opacity: { duration: 0.22, ease: "easeOut" },
                  y: { duration: 0.22, ease: "easeOut" },
                  layout: { duration: 0.35, ease: "easeInOut" },
                }}
                
              >
                {filtered.length === 0 ? (
                  <motion.div
                    layout
                    className="rounded-[22px] border border-white/10 bg-white/[0.03] px-6 py-10 text-center"
                  >
                    <p className="text-sm text-white/55 sm:text-base">
                      Obecnie brak usług dla wybranego czasu trwania.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8"
                  >
                    {colLeft.length > 0 && (
                      <PriceColumn
                        items={colLeft}
                        selectedTime={selectedTime}
                        getDiscountedPrice={getDiscountedPrice}
                      />
                    )}

                    {colRight.length > 0 && (
                      <PriceColumn
                        items={colRight}
                        selectedTime={selectedTime}
                        getDiscountedPrice={getDiscountedPrice}
                      />
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* footer */}
            <div className="mt-8 flex flex-col items-center gap-4  pt-6 text-center sm:mt-10">
              <p className="max-w-xl text-xs leading-5 text-white/45 sm:text-sm">
                Ceny brutto. Płatność kartą, BLIK oraz gotówką dostępna na
                miejscu.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <span className="rounded-md bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] text-black shadow-sm sm:text-xs">
                  BLIK
                </span>

                <div className="flex items-center justify-center rounded-md bg-white px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-extrabold tracking-wide text-[#1A1F71]">
                    VISA
                  </span>
                </div>

                <div className="flex items-center justify-center rounded-md bg-white px-3 py-1.5 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 24"
                    className="h-4"
                  >
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
          </div>
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
}

function PriceColumn({ items, selectedTime, getDiscountedPrice }) {
  return (
    <motion.div
      layout
      className="overflow-hidden "
    >
      {items.map((service, i) => {
        const timeIdx = service.time.indexOf(+selectedTime);
        const price = service.price?.[timeIdx];
        const discount = service.discount ?? 0;
        const discountedPrice = getDiscountedPrice(price, discount);
        
        return (
          <motion.div
            layout="position"
            key={`${service.title}-${selectedTime}-${i}`}
            className={[
              "group flex items-center justify-between gap-4 px-4 py-4 sm:px-5 sm:py-4",
              "min-h-[84px] sm:min-h-[92px]",
              "transition-colors duration-300 hover:bg-white/[0.03]",
               "border-b border-white/10" ,
            ].join(" ")}
          >
            <div className="min-w-0 flex-1 pr-2">
              <h3 className="font-cinzel text-[15px] uppercase leading-snug tracking-[0.04em] text-[#f4eadf] sm:text-base">
                {service.title}
              </h3>

              {service.subtitle ? (
                <p className="mt-1 text-xs leading-5 text-white/45 sm:text-sm">
                  {service.subtitle}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              {price != null ? (
                discount > 0 ? (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center justify-end gap-2">
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-red-400 sm:text-[11px]">
                        -{discount}%
                      </span>
                      <span className="text-xs text-white/35 line-through sm:text-sm">
                        {price} zł
                      </span>
                    </div>

                    <p
                      className="mt-1 font-cormorant text-[16px] font-semibold leading-none tabular-nums sm:text-[20px]"
                      style={{ color: GOLD }}
                    >
                      {discountedPrice} zł
                    </p>
                  </div>
                ) : (
                  <p
                    className="font-cormorant text-[22px] font-semibold leading-none tabular-nums sm:text-[24px]"
                    style={{ color: GOLD }}
                  >
                    {price} zł
                  </p>
                )
              ) : (
                <p
                  className="font-cormorant text-[22px] font-semibold leading-none tabular-nums sm:text-[24px]"
                  style={{ color: GOLD }}
                >
                  —
                </p>
              )}

              <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-white/30 sm:text-[11px]">
                brutto
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default PriceSection;