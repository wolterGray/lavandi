import { useRef } from "react";
import { Link } from "react-scroll";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import Button from "../../ui/Button";
import { useTranslation } from "../../i18n/LanguageProvider";
import { BOOKSY_URL } from "../../constants/theme";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export default function HeroCarousel() {
  const { t } = useTranslation();
  const paginationRef = useRef(null);
  const slides = t("announcements.items") ?? [];

  if (!slides.length) {
    return null;
  }

  return (
    <div className="relative h-full w-full">
      <Swiper
        loop={slides.length > 1}
        effect="fade"
        speed={900}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: paginationRef.current }}
        onBeforeInit={(swiper) => {
          swiper.params.pagination.el = paginationRef.current;
        }}
        modules={[Autoplay, EffectFade, Pagination]}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.title}>
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={slide.img}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-void/80 via-void/30 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-20 pt-28 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold">{t("hero.eyebrow")}</p>
                  <h1 className="mt-4 font-display text-display-md text-milk text-balance sm:text-display-lg lg:max-w-xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-stone md:text-[17px] md:leading-7">
                    {slide.news}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button href={BOOKSY_URL} size="lg">{t("hero.cta")}</Button>
                    <Link
                      to="signature"
                      smooth
                      duration={600}
                      offset={-80}
                      className="inline-flex min-h-[52px] cursor-pointer items-center justify-center px-2 text-sm text-stone transition hover:text-milk"
                    >
                      {t("hero.ctaSecondary")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div ref={paginationRef} className="hero-pagination absolute bottom-8 left-5 z-20 flex gap-2 sm:left-8 lg:left-12" />
      <div className="absolute bottom-8 right-6 z-20 hidden flex-col items-center gap-2 text-muted lg:flex">
        <span className="text-[10px] uppercase tracking-[0.2em]">{t("hero.scroll")}</span>
        <span className="h-8 w-px bg-white/20" />
      </div>
    </div>
  );
}
