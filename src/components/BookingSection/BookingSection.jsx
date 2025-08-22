import React, { useEffect, useRef } from "react";
import CustomButton from "../../ui/CustomButton";

const GOLD = "#D6B16A";

export default function BookingSection() {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!wrapRef.current || !imgRef.current) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = wrapRef.current.getBoundingClientRect();
      const vh = window.innerHeight || 0;

      // Прогресс появления секции в вьюпорте [0..1]
      let t = (vh - rect.top) / (vh + rect.height);
      if (t < 0) t = 0;
      if (t > 1) t = 1;

      // ЭФФЕКТ «НАЕЗДА»: масштаб + лёгкий сдвиг
      const scale = 1 + t * 0.35;        // 0.35 = до ~1.35; сделай 0.5 для сильнее
      const translateY = (t - 0.5) * 60; // лёгкое «погружение» (увеличь до 100 для сильнее)

      imgRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
    };

    const onScrollOrResize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    // первый расчет
    update();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section id="contact" className="select-none font-montserrat">
      <div
        ref={wrapRef}
        className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* ФОН-КАРТИНКА: именно <img>, чтобы transform точно работал */}
        <img
          ref={imgRef}
          src="/booking/booking.jpg"
          alt="NUAR — rezerwacja"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ transform: "translateY(0) scale(1)" }}
          loading="lazy"
          aria-hidden="true"
        />

        {/* Тёмный фильтр + виньетка */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
          <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 220px rgba(0,0,0,.85)" }} />
        </div>

        {/* Контент */}
        <div className="relative z-10 h-full w-full flex items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            <h2 className="text-white/95 leading-tight text-3xl sm:text-4xl md:text-[40px] font-extralight tracking-[0.01em]">
              Zafunduj sobie chwilę relaksu
            </h2>

            <p className="mt-3 text-white/85 text-base sm:text-lg font-light tracking-[0.015em]">
              Zarezerwuj sesję już teraz i zaoszczędź do{" "}
              <span className="font-semibold" style={{ color: GOLD }}>20%</span>
            </p>

            <div className="mt-10 flex justify-center">
              <CustomButton text={"Zarezerwuj w Booksy"} />
            </div>
          </div>
        </div>
      </div>

      {/* Уважение к reduced motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          #contact img[aria-hidden="true"] { transform: none !important; }
        }
      `}</style>
    </section>
  );
}
