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
                className="object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <div className="relative z-20 flex h-full flex-col justify-end px-6 pb-8 pt-8 sm:px-10 sm:pb-10 lg:px-12 lg:pb-12">
                <div className="max-w-xl">
                  <p className="section-label text-[11px] sm:text-xs">{t("hero.eyebrow")}</p>
                  <h1 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-milk text-balance [text-shadow:0_1px_16px_rgba(6,5,8,0.55)] sm:text-3xl lg:text-4xl lg:max-w-lg">
                    {slide.title}
                  </h1>
                  <p className="mt-3 max-w-md text-sm leading-[1.6] text-stone [text-shadow:0_1px_10px_rgba(6,5,8,0.45)] sm:text-base">
                    {slide.news}
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <BookVisitButton size="md">{t("hero.cta")}</BookVisitButton>
                    <Link
                      to="services"
                      smooth
                      duration={600}
                      offset={-80}
                      className="inline-flex min-h-[44px] cursor-pointer items-center justify-center px-2 text-sm text-stone transition hover:text-milk"
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
