import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section id="about" className="section-padding bg-surface">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          <ScrollAnimationWrapper direction="left">
            <SectionTitle label={t("about.label")} align="left">{t("about.title")}</SectionTitle>
            <div className="spa-divider !mx-0" />
            <p className="-mt-2 max-w-lg text-base leading-relaxed text-stone md:text-[17px] md:leading-8">{t("about.text")}</p>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-gold">{t("about.location")}</p>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper direction="right" delay={0.1} className="min-h-[220px] sm:min-h-[260px] lg:h-full lg:min-h-0">
            <div className="h-full overflow-hidden rounded-card shadow-spa">
              <img
                src="/about/about.webp"
                alt={t("hero.imageAlt")}
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </ScrollAnimationWrapper>
        </div>
      </Container>
    </section>
  );
}
