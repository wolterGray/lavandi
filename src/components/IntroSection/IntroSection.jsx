import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function IntroSection() {
  const { t } = useTranslation();

  return (
    <section id="intro" className="section-padding bg-canvas">
      <Container>
        <ScrollAnimationWrapper>
          <div className="mx-auto max-w-prose text-center">
            <p className="text-base leading-relaxed text-ink-muted md:text-[17px] md:leading-8">
              {t("intro.text")}
            </p>
            <p className="mt-6 text-sm text-ink-faint">{t("intro.location")}</p>
          </div>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
