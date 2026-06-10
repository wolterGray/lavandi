import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import Button from "../../ui/Button";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import { VisitStepIcon } from "../../constants/icons.jsx";
import StudioMap from "./StudioMap";

export default function LocationSection() {
  const { t, lang } = useTranslation();
  const { contact, getLocaleSection } = useContent();
  const visit = getLocaleSection(lang, "visit", t("visit"));
  const steps = visit.steps ?? [];

  return (
    <section id="visit" className="section-padding bg-surface">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={visit.label} description={visit.description}>{visit.title}</SectionTitle>
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
                <p className="font-display text-lg text-milk">{contact.street}</p>
                <p>{contact.city}</p>
              </address>
              <p>{visit.metro}</p>
              <div className="flex flex-col gap-2 pt-1">
                <a href={`tel:${contact.phone}`} className="font-bold text-gold transition hover:text-gold-dark">{contact.phoneDisplay}</a>
                <a href={contact.mapsLink} target="_blank" rel="noopener noreferrer" className="font-bold text-gold transition hover:text-gold-dark">{visit.maps}</a>
              </div>
              <Button href={contact.booksyUrl} size="sm" className="mt-4">{visit.book}</Button>
            </div>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <StudioMap
              lat={contact.lat}
              lng={contact.lng}
              mapsLink={contact.mapsLink}
              openLabel={visit.openMaps}
            />
          </ScrollAnimationWrapper>
        </div>
      </Container>
    </section>
  );
}
