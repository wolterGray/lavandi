import { useMemo } from "react";
import { FaComments, FaStar } from "react-icons/fa";
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
    <section id="opinie" className="section-padding overflow-x-hidden border-t border-white/[0.06]">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("reviews.label")} description={t("reviews.description")}>
            {t("reviews.title")}
          </SectionTitle>

          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone">
            <span className="inline-flex items-center gap-1.5 text-milk">
              <FaStar className="h-4 w-4 text-gold" aria-hidden="true" />
              {t("reviews.rating")}
            </span>
            <span className="text-muted">·</span>
            <span>{t("reviews.count", { count: reviews.length })}</span>
          </div>

          {featured && (
            <blockquote className="max-w-3xl break-words border-l border-gold/40 pl-6 sm:pl-8">
              <p className="break-words font-display text-2xl italic leading-relaxed text-milk sm:text-3xl sm:leading-snug">
                «{featured.text}»
              </p>
              <footer className="mt-6 text-sm text-stone">— {featured.name}</footer>
            </blockquote>
          )}

          <div className="mt-12 grid min-w-0 gap-5 md:grid-cols-3 md:gap-6">
            {picks.map((review) => (
              <figure
                key={`${review.name}-${review.text.slice(0, 24)}`}
                className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-graphite p-5 sm:p-6"
              >
                <FaComments className="mb-3 h-4 w-4 text-gold/60" aria-hidden="true" />
                <blockquote className="break-words text-sm leading-relaxed text-stone line-clamp-5">
                  «{review.text}»
                </blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-[0.14em] text-muted">
                  {review.name}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button href={BOOKSY_URL} variant="secondary" size="sm">
              {t("reviews.seeAllOnBooksy", { count: reviews.length })}
            </Button>
          </div>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
