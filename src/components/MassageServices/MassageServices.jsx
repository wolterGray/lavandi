import {Link} from "react-router-dom";
import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import BookVisitButton from "../../ui/BookVisitButton";
import {useTranslation} from "../../i18n/LanguageProvider";

function getFromPrice(service) {
  const idx = service.time.indexOf(60) >= 0 ? service.time.indexOf(60) : 0;
  const price = service.price[idx];
  return service.discount
    ? Math.round(price * (1 - service.discount / 100))
    : price;
}

function getDuration(service) {
  const idx = service.time.indexOf(60) >= 0 ? service.time.indexOf(60) : 0;
  return service.time[idx];
}

function DiscountBadge({discount}) {
  if (!discount) return null;

  return (
    <span className="absolute right-3 top-3 rounded-full border border-gold/25 bg-void/75 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-gold backdrop-blur-sm">
      -{discount}%
    </span>
  );
}

function ServiceCard({service, index}) {
  const {t} = useTranslation();
  const fromPrice = getFromPrice(service);
  const duration = getDuration(service);

  return (
    <ScrollAnimationWrapper delay={index * 0.05}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border/45 bg-card shadow-spa transition duration-500 ease-luxury hover:border-gold/20 hover:shadow-spa-hover focus-within:border-gold/25">
        <Link
          to={`/uslugi/${service.slug}`}
          className="relative z-10 flex h-full flex-col outline-none focus:outline-none focus-visible:outline-none">
          <div className="relative aspect-[4/2.35] overflow-hidden">
            <SiteImage
              src={service.img}
              alt={service.title}
              fill
              className="object-cover transition-all duration-500 group-hover:brightness-110"
              loading={index < 3 ? "eager" : "lazy"}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-card via-card/72 to-transparent" />
            <DiscountBadge discount={service.discount} />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                {duration} {t("common.min")} · {t("services.from")} {fromPrice}{" "}
                {t("common.pln")}
              </p>
              <h3 className="mt-1.5 font-display text-xl leading-tight text-milk">
                {service.title}
              </h3>
            </div>
          </div>
          <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
            <p className="line-clamp-2 min-h-[calc(1.625em*2)] text-sm leading-relaxed text-stone">
              {service.desc}
            </p>
            <div className="mt-auto pt-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gold transition-colors duration-300 group-hover:text-milk">
                {t("services.details")}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </div>
        </Link>
      </article>
    </ScrollAnimationWrapper>
  );
}

export default function MassageServices({services = []}) {
  const {t} = useTranslation();

  return (
    <section id="services" className="section-padding bg-surface">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle
            label={t("services.label")}
            description={t("services.description")}
            align="center"
            className="!mb-0">
            {t("services.title")}
          </SectionTitle>
          <div className="spa-divider my-6" />
        </ScrollAnimationWrapper>

        <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>

        <ScrollAnimationWrapper
          delay={0.15}
          className="mt-12 flex justify-center sm:mt-14">
          <BookVisitButton
            size="lg"
            className="bg-[#d8b88a] text-[#1d1510] hover:bg-[#d0a96d]">
            {t("services.book")}
          </BookVisitButton>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
