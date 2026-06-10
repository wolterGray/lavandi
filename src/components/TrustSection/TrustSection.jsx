import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function TrustSection() {
  const { t } = useTranslation();
  const items = t("trust.items") ?? [];

  if (!items.length) return null;

  return (
    <section id="trust" className="section-padding bg-cream">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("trust.label")} description={t("trust.description")}>
            {t("trust.title")}
          </SectionTitle>
          <div className="spa-divider" />
        </ScrollAnimationWrapper>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((item, index) => (
            <li key={item.title}>
              <ScrollAnimationWrapper delay={index * 0.08} className="h-full spa-card p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/30 bg-surface text-sm font-bold text-gold">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 font-display text-lg text-milk">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{item.text}</p>
              </ScrollAnimationWrapper>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
