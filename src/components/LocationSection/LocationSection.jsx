import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import Button from "../../ui/Button";
import { useTranslation } from "../../i18n/LanguageProvider";
import { VisitStepIcon } from "../../constants/icons.jsx";
import StudioMap from "./StudioMap";
import { BOOKSY_URL, PHONE, PHONE_DISPLAY, STUDIO } from "../../constants/theme";

export default function LocationSection() {
  const { t } = useTranslation();
  const steps = t("visit.steps") ?? [];

  return (
    <section id="visit" className="section-padding bg-surface">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("visit.label")} description={t("visit.description")}>{t("visit.title")}</SectionTitle>
          <div className="spa-divider" />
        </ScrollAnimationWrapper>

        <ol className="mb-12 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {steps.map((step, index) => (
            <li key={step.title}>
              <ScrollAnimationWrapper delay={index * 0.08} className="h-full spa-card p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold/30 text-gold">
                    <VisitStepIcon id={step.id} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold">0{index + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg text-milk">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{step.description}</p>
              </ScrollAnimationWrapper>
            </li>
          ))}
        </ol>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <ScrollAnimationWrapper direction="left">
            <div className="space-y-4 text-sm leading-relaxed text-stone">
              <address className="not-italic">
                <p className="font-display text-lg text-milk">ul. Świętojerska 5/7</p>
                <p>00-236 Warszawa</p>
              </address>
              <p>{t("visit.metro")}</p>
              <div className="flex flex-col gap-2 pt-1">
                <a href={`tel:${PHONE}`} className="font-bold text-gold transition hover:text-gold-dark">{PHONE_DISPLAY}</a>
                <a href={STUDIO.mapsLink} target="_blank" rel="noopener noreferrer" className="font-bold text-gold transition hover:text-gold-dark">{t("visit.maps")}</a>
              </div>
              <Button href={BOOKSY_URL} size="sm" className="mt-4">{t("visit.book")}</Button>
            </div>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <StudioMap openLabel={t("visit.openMaps")} />
          </ScrollAnimationWrapper>
        </div>
      </Container>
    </section>
  );
}
