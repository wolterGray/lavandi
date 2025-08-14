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
      className="carousel pb-8 px-3 md:px-6">
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
    // на мобилках открываем/закрываем по тапу
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.stopPropagation();
      setOpen((v) => !v);
    }
  };

  // одна translate-утилита на описание
  const descTranslate = open ? "translate-y-0" : "translate-y-full";

  return (
    <article
      className="
        select-none mx-auto
        w-[78vw] h-[92vw]
        max-w-[360px] max-h-[560px]
        sm:w-[320px] sm:h-[460px]
        md:w-[340px] md:h-[500px]
        lg:w-[350px] lg:h-[520px]
        xl:w-[360px] xl:h-[540px]
      ">
      <div
        onClick={handleClick}
        className="group hover:border-[1px] border-primaryColor/20 relative h-full rounded-3xl overflow-hidden cursor-pointer"
        aria-expanded={open}
        role="button">
        {/* фон */}
        <img
          src={img}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />

        {/* базовая виньетка */}
        <div className="pointer-events-none absolute inset-0 bg-black/30" />

        {/* затемнение фона — одинаковое поведение на мобиле (tap) и десктопе (hover) */}
        <div
          className={[
            "absolute inset-0 transition-colors duration-500 ease-out",
            open ? "bg-secondaryColor/95" : "bg-transparent", // ← было bg-black/60
            "md:group-hover:bg-secondaryColor/95",
          ].join(" ")}
        />

        {/* текстовое описание */}
        <div
          className={[
            "absolute inset-0 flex flex-col justify-center gap-4 px-5 text-white text-left",
            "transform-gpu transition-transform duration-700 ease-in-out",
            descTranslate, // <— только ОДНА translate-утилита
            "md:group-hover:translate-y-0",
          ].join(" ")}>
          <h3 className="text-xl font-normal uppercase text-primaryColor">
            {title}
          </h3>
          <p className="text-base leading-relaxed">{desc}</p>
        </div>

        {/* нижний тайтл */}
        <div className="absolute inset-x-0 bottom-0 p-4 z-10 pointer-events-none">
          <div
            className={[
              "rounded-2xl px-4 py-3",
              "transition-opacity duration-500 ease-in-out",
              open ? "opacity-0" : "opacity-100",
              "md:group-hover:opacity-0",
            ].join(" ")}>
            <h3 className="text-xl text-center font-normal uppercase text-amber-200">
              {title}
            </h3>
          </div>
        </div>
      </div>
    </article>
  );
}
