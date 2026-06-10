import { useMemo } from "react";
import { FaStar } from "react-icons/fa";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import Button from "../../ui/Button";
import { useTranslation } from "../../i18n/LanguageProvider";
import { BOOKSY_URL } from "../../constants/theme";

const PICK_INDICES = [4, 22, 14];

export default function ReviewsSection({ reviews = [] }) {
  const { t } = useTranslation();

  const featured = useMemo(
    () => reviews.find((r) => r.text.length > 80) ?? reviews[0],
    [reviews]
  );

  const picks = useMemo(() => {
    const selected = PICK_INDICES.map((i) => reviews[i]).filter(Boolean);
    return selected.length >= 3 ? selected : reviews.slice(0, 3);
  }, [reviews]);

  if (!reviews.length) return null;

  return (
    <section id="opinie" className="section-padding overflow-x-hidden bg-cream">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("reviews.label")} description={t("reviews.description")}>
            {t("reviews.title")}
          </SectionTitle>
          <div className="spa-divider" />

          <div className="mb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-stone">
            <span className="inline-flex items-center gap-1.5 font-bold text-milk">
              <FaStar className="h-4 w-4 text-gold" aria-hidden="true" />
              {t("reviews.rating")}
            </span>
            <span className="text-muted">·</span>
            <span>{t("reviews.count", { count: reviews.length })}</span>
          </div>
        </ScrollAnimationWrapper>

        {featured && (
          <ScrollAnimationWrapper delay={0.08}>
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="font-display text-2xl italic leading-relaxed text-milk sm:text-3xl">
                «{featured.text}»
              </p>
              <footer className="mt-5 text-sm font-bold uppercase tracking-[0.1em] text-gold">— {featured.name}</footer>
            </blockquote>
          </ScrollAnimationWrapper>
        )}

        <div className="mt-12 grid min-w-0 gap-5 md:grid-cols-3">
          {picks.map((review, index) => (
            <ScrollAnimationWrapper key={`${review.name}-${review.text.slice(0, 24)}`} delay={index * 0.08}>
              <figure className="spa-card min-w-0 p-6">
                <blockquote className="break-words text-sm leading-relaxed text-stone line-clamp-5">
                  «{review.text}»
                </blockquote>
                <figcaption className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-gold">
                  {review.name}
                </figcaption>
              </figure>
            </ScrollAnimationWrapper>
          ))}
        </div>

        <ScrollAnimationWrapper delay={0.2} className="mt-10 text-center">
          <Button href={BOOKSY_URL} variant="secondary" size="sm">
            {t("reviews.seeAllOnBooksy", { count: reviews.length })}
          </Button>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
