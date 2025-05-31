import React from "react";
import CustomButton from "../../ui/CustomButton";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

function BookingSection() {
  return (
    <section
      id="contact"
      className="relative w-full h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden rounded-3xl shadow-2xl">
      {/* Фонове зображення */}
      <img
        src="/booking/booking.jpg"
        alt="Booking image"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105"
        loading="lazy"
      />

      {/* Темний градієнт для читабельності тексту */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <ScrollAnimationWrapper>
        {/* Контент зверху */}
        <div className="relative z-10 max-w-3xl px-4 sm:px-6 text-center flex flex-col items-center gap-8">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-thin leading-tight">
            Zafunduj sobie chwilę relaksu — zarezerwuj sesję już teraz i
            zaoszczędź do{" "}
            <span className="text-red-500 font-semibold">20%</span>
          </h2>

          <CustomButton
            className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-lg transition-transform active:scale-95"
            aria-label="Zarezerwuj sesję">
            Zarezerwuj
          </CustomButton>
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
}

export default BookingSection;
