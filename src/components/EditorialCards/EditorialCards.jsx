import { Link } from "react-scroll";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { BookVisitLink } from "../../ui/BookVisitButton";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function EditorialCards() {
  const { t } = useTranslation();
  const cards = t("editorial.items") ?? [];

  return (
    <section className="section-padding bg-canvas">
      <Container>
        <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <ScrollAnimationWrapper key={card.title} delay={index * 0.1}>
              <article className="group flex flex-col">
              <div className="aspect-[3/4] overflow-hidden rounded-card border border-gold/40 bg-surface ring-1 ring-gold/10">
                <img
                  src={card.img}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 ease-luxury group-hover:scale-[1.03]"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="mt-6 flex flex-1 flex-col">
                <p className="como-label">{card.eyebrow}</p>
                <h3 className="mt-3 font-display text-2xl text-ink">{card.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">{card.text}</p>
                {card.link === "booksy" ? (
                  <BookVisitLink className="como-link mt-6 inline-block">
                    {card.cta}
                  </BookVisitLink>
                ) : (
                  <Link
                    to={card.link}
                    smooth
                    duration={600}
                    offset={-80}
                    className="como-link mt-6 inline-block cursor-pointer"
                  >
                    {card.cta}
                  </Link>
                )}
              </div>
            </article>
            </ScrollAnimationWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
