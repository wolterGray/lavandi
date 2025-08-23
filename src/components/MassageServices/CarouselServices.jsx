import React, {useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css";

export default function CarouselServices({services = []}) {
  return (
    <Swiper
      loop
      grabCursor
      centeredSlides
      breakpoints={{
        0: {slidesPerView: 1.15, spaceBetween: 14, centeredSlides: true},
        480: {slidesPerView: 1.4, spaceBetween: 16, centeredSlides: true},
        640: {slidesPerView: 2.1, spaceBetween: 18, centeredSlides: true},
        768: {slidesPerView: 2.6, spaceBetween: 20, centeredSlides: true},
        1024: {slidesPerView: 3.2, spaceBetween: 24, centeredSlides: true},
        1280: {slidesPerView: 4, spaceBetween: 28, centeredSlides: true},
      }}
      className="px-3 md:px-6">
      {services.map((s) => (
        <SwiperSlide key={s.title} className="flex">
          <ServiceCard {...s} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function ServiceCard({img, title, desc}) {
  const [open, setOpen] = useState(false);

  const handleClick = (e) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.stopPropagation();
      setOpen((v) => !v);
    }
  };
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const descTranslate = open ? "translate-y-0" : "translate-y-full";

  return (
    <article
      className="
        select-none mx-auto w-[78vw] h-[110vw] max-w-[360px] max-h-[640px]
        sm:w-[320px] sm:h-[460px]
        md:w-[340px] md:h-[500px]
        lg:w-[350px] lg:h-[520px]
        xl:w-[360px] xl:h-[540px]
      ">
      {/* золотой кант */}
      <div className="font-cinzel relative h-full rounded-3xl p-[1px] overflow-hidden bg-gradient-to-tr from-primaryColor/70 via-transparent to-primaryColor/20">
        <div
          onClick={handleClick}
          onKeyDown={handleKey}
          tabIndex={0}
          role="button"
          aria-expanded={open}
          className="group relative h-full rounded-[inherit] overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-0">
          {/* Фон-картинка (чуть выразительнее) */}
          <img
            src={img}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          {/* SUPER FILTER STACK */}
          <div className="pointer-events-none absolute inset-0">
            {/* 1) цветовое тонирование фирменным цветом (делает богаче и чуть темнее/глубже) */}
            <div
              className={[
                "absolute inset-0 mix-blend-multiply transition-opacity duration-500",
                open ? "opacity-95" : "opacity-50",
                "md:group-hover:opacity-95 bg-secondaryColor",
              ].join(" ")}
            />
            {/* 2) мягкий вертикальный градиент (чуть подсветить середину, затемнить края) */}
            <div className="absolute inset-0 bg-gradient-to-b from-secondaryColor/20 via-transparent to-secondaryColor/90" />
            {/* 3) деликатный radial glare (дорогой “шёлковый” бликовый эффект) */}
            <div className="absolute inset-0 mix-blend-overlay" />
            {/* 4) лёгкий блюр для глубины (минимальный, чтобы не «мылить») */}
            <div className="absolute inset-0 backdrop-blur-[0.6px]" />
          </div>

          {/* Контентное описание */}
          <div
            className={[
              "absolute inset-0 flex flex-col justify-center gap-4 px-5 text-white",
              "transform-gpu transition-transform duration-700 ease-in-out will-change-transform",
              descTranslate,
              "md:group-hover:translate-y-0",
            ].join(" ")}>
            <h3 className="text-lg text-primaryColor font-semibold tracking-[0.08em] uppercase">
              {title}
            </h3>
            <p className="text-base leading-relaxed font-montserrat text-white/90">
              {desc}
            </p>
          </div>

          {/* Нижний бейдж (исчезает при раскрытии / ховере) */}
          <div className="absolute inset-x-0 bottom-0 p-4 z-10 pointer-events-none">
            <div
              className={[
                "mx-auto w-full rounded-2xl px-4 py-2 backdrop-blur-sm",
                "transition-opacity duration-500 ease-in-out bg-secondaryColor/50 border-[1px] border-primaryColor/20",
                open ? "opacity-0" : "opacity-100",
                "md:group-hover:opacity-0",
              ].join(" ")}>
              <h3 className="text-center text-primaryColor text-[15px] font-semibold tracking-[0.14em] uppercase">
                {title}
              </h3>
            </div>
          </div>

          {/* деликатный внутренний контур на ховер/фокус */}
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 " />
        </div>
      </div>
    </article>
  );
}
