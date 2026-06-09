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
    <section id="visit" className="section-padding border-t border-white/[0.06]">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("visit.label")} description={t("visit.description")}>
            {t("visit.title")}
          </SectionTitle>

          <ol className="mb-14 grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/[0.06] bg-graphite/40 p-6 sm:p-7"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gradient-to-b from-gold/[0.1] to-transparent">
                    <VisitStepIcon id={step.id} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-gold">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl text-milk">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{step.description}</p>
              </li>
            ))}
          </ol>
        </ScrollAnimationWrapper>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <ScrollAnimationWrapper>
            <div className="space-y-5 text-sm leading-relaxed text-stone">
              <address className="not-italic">
                <p className="text-milk">ul. Świętojerska 5/7</p>
                <p>00-236 Warszawa</p>
              </address>
              <p>{t("visit.metro")}</p>
              <div className="flex flex-col gap-2 pt-2">
                <a href={`tel:${PHONE}`} className="text-gold transition hover:text-champagne">
                  {PHONE_DISPLAY}
                </a>
                <a
                  href={STUDIO.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold transition hover:text-champagne"
                >
                  {t("visit.maps")}
                </a>
              </div>
              <Button href={BOOKSY_URL} size="sm" className="mt-4">
                {t("visit.book")}
              </Button>
            </div>
          </ScrollAnimationWrapper>

          <StudioMap openLabel={t("visit.openMaps")} />
        </div>
      </Container>
    </section>
  );
}
