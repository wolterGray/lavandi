import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Container from "../../ui/Container";
import CarouselControls from "../../ui/CarouselControls";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";

import "swiper/css";
import "swiper/css/navigation";

export default function JournalSection() {
  const { t } = useTranslation();
  const items = t("journal.items") ?? [];
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!items.length) return null;

  return (
    <section id="journal" className="section-padding bg-canvas">
      <Container>
        <ScrollAnimationWrapper>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="como-label">{t("journal.label")}</p>
              <h2 className="como-heading mt-3">{t("journal.title")}</h2>
            </div>
            <CarouselControls prevRef={prevRef} nextRef={nextRef} />
          </div>
        </ScrollAnimationWrapper>
      </Container>

      <ScrollAnimationWrapper delay={0.08} className="relative mt-10">
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2.2, spaceBetween: 24 },
            1024: { slidesPerView: 3.2, spaceBetween: 28 },
            1280: { slidesPerView: 4, spaceBetween: 32 },
          }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          className="!px-5 sm:!px-6 lg:!px-8"
        >
          {items.map((item) => (
            <SwiperSlide key={item.title}>
              <article className="group h-full rounded-card border border-gold/40 bg-surface p-6 ring-1 ring-gold/10 transition hover:border-gold/60">
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">{item.category}</p>
                <h3 className="mt-4 font-display text-xl leading-snug text-ink transition group-hover:text-ink-muted">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted line-clamp-4">{item.excerpt}</p>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </ScrollAnimationWrapper>
    </section>
  );
}
