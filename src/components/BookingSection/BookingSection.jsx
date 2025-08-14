import React from "react";
import CustomButton from "../../ui/CustomButton";

const GOLD = "#D6B16A";

export default function BookingSection() {
  return (
    <section id="contact" className="mb-10 select-none font-montserrat">
      <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl">
        {/* Фон */}
        <img
          src="/booking/booking.jpg"
          alt="NUAR — rezerwacja"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* ТЁМНЫЙ ФИЛЬТР (градиент) + виньетка */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
          <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 220px rgba(0,0,0,.85)" }} />
        </div>

        {/* Контент по центру */}
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
              <a
                href="https://booksy.com/pl-pl/262690_lavandi-studio-masazu_masaz_3_warszawa#ba_s=seo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <CustomButton
                  aria-label="Zarezerwuj w Booksy"
                  className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full text-base sm:text-lg font-semibold text-black transition-transform active:scale-95 shadow-lg"
                  style={{ backgroundColor: GOLD }}
                >
                  Zarezerwuj w Booksy
                </CustomButton>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
