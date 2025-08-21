import React, {useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css";

const GOLD = "#D6B16A"; // премиум-акцент

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
      className=" px-3 md:px-6">
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
        select-none mx-auto w-[78vw] h-[92vw] max-w-[360px] max-h-[560px]
+   select-none mx-auto w-[78vw] h-[110vw] max-w-[360px] max-h-[640px]
    sm:w-[320px] sm:h-[460px]
    md:w-[340px] md:h-[500px]
    lg:w-[350px] lg:h-[520px]
    xl:w-[360px] xl:h-[540px]
      ">
      {/* золотой кант по краю */}
      <div
        className="font-cinzel relative h-full rounded-3xl p-[1px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${GOLD}aa, transparent 40%, ${GOLD}33)`,
        }}>
        <div
          onClick={handleClick}
          onKeyDown={handleKey}
          tabIndex={0}
          role="button"
          aria-expanded={open}
          className="group relative h-full rounded-[inherit] overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
          style={{boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04)"}}>
          {/* фон */}
          <img
            src={img}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          {/* мягкая виньетка */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,rgba(0,0,0,0)_0%,rgba(0,0,0,.26)_70%,rgba(0,0,0,.48)_100%)]" />

          {/* затемнение фона — единообразно: тёмно-фиолетовый */}
          <div
            className={[
              "absolute inset-0 transition-colors duration-500 ease-out",
              open ? "bg-secondaryColor/95" : "bg-transparent",
              "md:group-hover:bg-secondaryColor/95",
            ].join(" ")}
          />

          {/* контентное описание */}
          <div
            className={[
              "absolute  inset-0 flex flex-col justify-center gap-4 px-5 text-white",
              "transform-gpu transition-transform duration-700 ease-in-out will-change-transform",
              descTranslate,
              "md:group-hover:translate-y-0",
            ].join(" ")}>
            <h3
              className="text-lg font-semibold tracking-[0.08em] uppercase"
              style={{color: GOLD}}>
              {title}
            </h3>
            <p className="text-base leading-relaxed font-montserrat text-white/90">
              {desc}
            </p>
          </div>

          {/* нижний бейдж с названием — стекло + тонкий кант; исчезает при раскрытии */}
          <div className="absolute inset-x-0 bottom-0 p-4 z-10 pointer-events-none">
            <div
              className={[
                "mx-auto w-full rounded-2xl px-4 py-2 backdrop-blur-sm bg-black/35",
                "transition-opacity duration-500 ease-in-out",
                open ? "opacity-0" : "opacity-100",
                "md:group-hover:opacity-0",
              ].join(" ")}
              style={{boxShadow: `inset 0 0 0 1px ${GOLD}40`}}>
              <h3
                className="text-center text-[15px] font-semibold tracking-[0.14em] uppercase"
                style={{color: GOLD}}>
                {title}
              </h3>
            </div>
          </div>

          {/* деликатный внутренний контур на ховер/фокус */}
          <span
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 md:group-hover:opacity-100 transition-opacity duration-500"
            style={{boxShadow: `inset 0 0 0 1px ${GOLD}77`}}
          />
        </div>
      </div>
    </article>
  );
}
