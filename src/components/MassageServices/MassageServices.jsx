import { useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { CarouselControls } from "../../ui/CarouselControls";
import { useTranslation } from "../../i18n/LanguageProvider";

import "swiper/css";
import "swiper/css/free-mode";

const CARD_HEIGHT = 268;
const CARD_WIDTH = 264;

function MassageServices({ services = [] }) {
  const { t } = useTranslation();
  const swiperRef = useRef(null);

  return (
    <section id="services" className="section-padding overflow-x-hidden border-t border-white/[0.06]">
      <Container>
        <ScrollAnimationWrapper>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionTitle label={t("services.label")} description={t("services.description")} align="left" className="mb-0">
              {t("services.title")}
            </SectionTitle>
            <CarouselControls
              onPrev={() => swiperRef.current?.slidePrev()}
              onNext={() => swiperRef.current?.slideNext()}
              prevLabel={t("services.prev")}
              nextLabel={t("services.next")}
            />
          </div>

          <div className="overflow-hidden">
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            modules={[FreeMode]}
            spaceBetween={14}
            slidesPerView="auto"
            freeMode={{ enabled: true, momentum: true }}
            className="services-carousel"
          >
            {services.map((service, index) => {
              const priceIdx = service.time.indexOf(60) >= 0 ? service.time.indexOf(60) : 0;
              const fromPrice = service.discount
                ? Math.round(service.price[priceIdx] * (1 - service.discount / 100))
                : service.price[priceIdx];

              return (
                <SwiperSlide
                  key={service.slug}
                  className="!flex"
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                >
                  <Link
                    to={`/uslugi/${service.slug}`}
                    className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-graphite/60 p-5 backdrop-blur-sm transition duration-500 hover:border-gold/25 hover:bg-graphite"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-gold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {service.discount > 0 && (
                        <span className="rounded-full border border-gold/20 px-2 py-0.5 text-[9px] uppercase tracking-wider text-gold">
                          -{service.discount}%
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 line-clamp-2 min-h-[2.75rem] font-display text-lg leading-snug text-milk">
                      {service.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-xs leading-relaxed text-stone">
                      {service.desc}
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-2 border-t border-white/[0.06] pt-4">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                        {t("services.from")} {fromPrice} {t("common.pln")}
                      </span>
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-gold transition group-hover:border-gold/30 group-hover:text-champagne"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
          </div>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}

export default MassageServices;
