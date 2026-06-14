import { Link } from "react-router-dom";
import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import BookVisitButton from "../../ui/BookVisitButton";
import { useTranslation } from "../../i18n/LanguageProvider";

function getFromPrice(service) {
  const idx = service.time.indexOf(60) >= 0 ? service.time.indexOf(60) : 0;
  const price = service.price[idx];
  return service.discount ? Math.round(price * (1 - service.discount / 100)) : price;
}

function getDuration(service) {
  const idx = service.time.indexOf(60) >= 0 ? service.time.indexOf(60) : 0;
  return service.time[idx];
}

function DiscountBadge({ discount }) {
  if (!discount) return null;

  return (
    <span className="absolute right-4 top-4 rounded-full border border-gold/30 bg-void/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gold backdrop-blur-sm">
      -{discount}%
    </span>
  );
}

function ServiceCard({ service, index }) {
  const { t } = useTranslation();
  const fromPrice = getFromPrice(service);
  const duration = getDuration(service);

  return (
    <ScrollAnimationWrapper delay={index * 0.05}>
      <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border/50 bg-card shadow-spa transition-[border-color,box-shadow] duration-500 ease-luxury hover:border-gold/20 hover:shadow-spa-hover focus-within:border-gold/25">
        <Link
          to={`/uslugi/${service.slug}`}
          className="flex h-full flex-col outline-none focus:outline-none focus-visible:outline-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <SiteImage
              src={service.img}
              alt={service.title}
              fill
              className="object-cover transition duration-700 ease-luxury group-hover:scale-[1.02]"
              loading={index < 3 ? "eager" : "lazy"}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-card via-card/55 to-transparent" />
            <DiscountBadge discount={service.discount} />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                {duration} {t("common.min")} · {t("services.from")} {fromPrice} {t("common.pln")}
              </p>
              <h3 className="mt-2 font-display text-lg text-milk sm:text-xl">{service.title}</h3>
            </div>
          </div>
          <div className="flex flex-1 flex-col border-t border-border/30 bg-card p-5">
            <p className="line-clamp-2 text-sm leading-relaxed text-stone">{service.desc}</p>
            <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-stone/80 transition-colors duration-300 group-hover:text-gold group-focus-within:text-gold">
              {t("services.details")}
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </Link>
      </article>
    </ScrollAnimationWrapper>
  );
}

export default function MassageServices({ services = [] }) {
  const { t } = useTranslation();

  return (
    <section id="services" className="section-padding bg-surface">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle
            label={t("services.label")}
            description={t("services.description")}
            align="left"
            className="!mb-0"
          >
            {t("services.title")}
          </SectionTitle>
          <div className="spa-divider !mx-0 mt-6" />
        </ScrollAnimationWrapper>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>

        <ScrollAnimationWrapper delay={0.15} className="mt-12 flex justify-center sm:mt-14">
          <BookVisitButton size="lg">
            {t("services.book")}
          </BookVisitButton>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
