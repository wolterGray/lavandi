import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";

export default function AboutSection() {
  const { t, lang } = useTranslation();
  const { getAboutContent } = useContent();
  const about = getAboutContent(lang, t("about"));

  return (
    <section id="about" className="bg-surface pb-10 pt-16 md:pb-12 md:pt-20">
      <Container>
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <ScrollAnimationWrapper direction="left">
            <SectionTitle label={about.label} align="left" className="mb-0 max-w-xl">{about.title}</SectionTitle>
            <div className="spa-divider mx-0 my-6" />
            <p className="max-w-xl text-base leading-relaxed text-stone md:text-[17px] md:leading-8">{about.text}</p>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-gold">{about.location}</p>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <div className="relative h-[240px] overflow-hidden rounded-card shadow-spa sm:h-[300px] lg:h-[340px]">
              <SiteImage fill src={about.image} alt={t("hero.imageAlt")} className="object-cover object-center" loading="lazy" />
            </div>
          </ScrollAnimationWrapper>
        </div>
      </Container>
    </section>
  );
}
