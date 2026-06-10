import { useState } from "react";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { BOOKSY_URL } from "../../constants/theme";

export default function WellnessExperiences() {
  const { t } = useTranslation();
  const items = t("wellness.items") ?? [];
  const [active, setActive] = useState(0);
  const current = items[active];

  if (!items.length) return null;

  return (
    <section id="signature" className="section-padding bg-surface">
      <Container>
        <ScrollAnimationWrapper>
          <div className="max-w-2xl">
            <p className="como-label">{t("wellness.label")}</p>
            <h2 className="como-heading mt-4">{t("wellness.title")}</h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">{t("wellness.description")}</p>
          </div>
        </ScrollAnimationWrapper>

        <div className="mt-14 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <ScrollAnimationWrapper direction="left" delay={0.08}>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`flex shrink-0 items-baseline gap-4 rounded-card border px-5 py-4 text-left ring-1 transition lg:w-full ${
                    active === index
                      ? "border-gold/60 bg-canvas text-ink ring-gold/15"
                      : "border-gold/40 bg-transparent text-ink-muted ring-gold/10 hover:border-gold/60"
                  }`}
                >
                  <span className="font-display text-2xl text-ink/30">{index + 1}</span>
                  <span className="text-sm font-medium uppercase tracking-[0.1em]">{item.title}</span>
                </button>
              ))}
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper direction="right" delay={0.16}>
            <div className="min-w-0">
            <div className="flex items-baseline gap-4 border-b border-ink/10 pb-6">
              <span className="font-display text-4xl text-ink/20">{active + 1}</span>
              <span className="text-label text-ink-faint">{active + 1} — {items.length}</span>
            </div>
            <h3 className="mt-8 font-display text-3xl text-ink">{current?.title}</h3>
            <p className="mt-6 max-w-prose text-base leading-relaxed text-ink-muted">{current?.text}</p>
            {current?.cta && (
              <a href={BOOKSY_URL} target="_blank" rel="noopener noreferrer" className="como-link mt-8 inline-block">
                {current.cta}
              </a>
            )}
          </div>
          </ScrollAnimationWrapper>
        </div>
      </Container>
    </section>
  );
}
