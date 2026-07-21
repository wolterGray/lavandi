import { useRef } from "react";
import { Link } from "react-scroll";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import SiteImage from "../../ui/SiteImage";
import BookVisitButton from "../../ui/BookVisitButton";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export default function HeroCarousel() {
  const { t, lang } = useTranslation();
  const { getHeroSlides } = useContent();
  const paginationRef = useRef(null);
  const slides = getHeroSlides(lang, t("announcements.items") ?? []);

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
              <SiteImage
                src={slide.img}
                alt={slide.title}
                fill
                className="object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <div className="absolute inset-0 bg-surface/10" aria-hidden />
              <div
                className="absolute inset-0 bg-[rgba(112,80,96,0.10)]"
                aria-hidden
              />
              <div
                className="hero-section-fade pointer-events-none absolute inset-x-0 bottom-0 z-10"
                aria-hidden
              />
              <div className="relative z-20 flex h-full flex-col justify-end px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-32 lg:px-12 lg:pb-18">
                <div className="max-w-2xl">
                  <p className="section-label">{t("hero.eyebrow")}</p>
                  <h1 className="mt-4 font-display text-display-md font-bold tracking-[-0.03em] text-milk text-balance [text-shadow:0_1px_16px_rgba(6,5,8,0.55)] sm:text-display-lg lg:max-w-xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-md text-base leading-[1.75] text-stone [text-shadow:0_1px_10px_rgba(6,5,8,0.45)] md:text-[17px] md:leading-8">
                    {slide.news}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <BookVisitButton size="lg">{t("hero.cta")}</BookVisitButton>
                    <Link
                      to="services"
                      smooth
                      duration={600}
                      offset={-80}
                      className="inline-flex min-h-[52px] cursor-pointer items-center justify-center px-2 text-sm text-stone transition hover:text-milk"
                    >
                      {t("hero.ctaSecondary")} →
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
        <span className="h-8 w-px bg-milk/20" />
      </div>
    </div>
  );
}
