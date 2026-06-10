import { useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Container from "../../ui/Container";
import CarouselControls from "../../ui/CarouselControls";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ServicesShowcase({ services = [] }) {
  const { t } = useTranslation();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);

  if (!services.length) return null;

  return (
    <section id="services" className="section-padding bg-surface">
      <Container>
        <ScrollAnimationWrapper>
          <h3 className="como-label">{t("services.searchLabel")}</h3>
        </ScrollAnimationWrapper>
      </Container>

      <ScrollAnimationWrapper delay={0.08} className="relative mt-10">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={1.15}
          centeredSlides={false}
          breakpoints={{
            640: { slidesPerView: 1.4, spaceBetween: 28 },
            1024: { slidesPerView: 2.1, spaceBetween: 32 },
            1280: { slidesPerView: 2.4, spaceBetween: 36 },
          }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          pagination={{ clickable: true, el: paginationRef.current }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.params.pagination.el = paginationRef.current;
          }}
          className="!px-5 sm:!px-6 lg:!px-8"
        >
          {services.map((service) => (
            <SwiperSlide key={service.slug}>
              <Link to={`/uslugi/${service.slug}`} className="group block">
                <article className="overflow-hidden rounded-card border border-gold/40 bg-canvas ring-1 ring-gold/10 transition hover:border-gold/60">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-700 ease-luxury group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <div className="border border-t-0 border-ink/10 px-6 py-8 md:px-8 md:py-10">
                    <h4 className="font-display text-2xl text-ink md:text-[1.75rem]">{service.title}</h4>
                    <p className="mt-2 text-sm uppercase tracking-[0.12em] text-ink-faint">
                      {t("intro.studioLocation")}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-ink-muted line-clamp-3">
                      {service.desc}
                    </p>
                  </div>
                </article>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <Container className="mt-8 flex items-center justify-between gap-4">
          <div ref={paginationRef} className="services-pagination flex gap-2" />
          <CarouselControls prevRef={prevRef} nextRef={nextRef} />
        </Container>
      </ScrollAnimationWrapper>
    </section>
  );
}
