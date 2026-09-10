import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import BookVisitButton from "../../ui/BookVisitButton";
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
        <ScrollAnimationWrapper className="mx-auto max-w-3xl text-center">
          <h2 className="section-heading text-milk">{visit.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone">
            {visit.description}
          </p>
        </ScrollAnimationWrapper>

        <ol className="mt-8 grid gap-4 border-y border-border/60 py-5 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 sm:border-r sm:border-border/45 sm:pr-4 sm:last:border-r-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/25 text-gold">
                <VisitStepIcon id={step.id} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">0{index + 1}</span>
                  <h3 className="font-display text-lg leading-snug text-milk">{step.title}</h3>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-stone">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <ScrollAnimationWrapper direction="left" className="w-full max-w-[560px] lg:justify-self-start">
            <StudioMap
              lat={contact.lat}
              lng={contact.lng}
              mapsLink={contact.mapsLink}
              openLabel={visit.openMaps}
            />
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <div className="rounded-card border border-border/60 bg-void/25 p-6 sm:p-8">
              <address className="not-italic">
                <p className="font-display text-2xl leading-snug text-milk">{contact.street}</p>
                <p className="mt-1 text-sm text-stone">{contact.city}</p>
              </address>
              <p className="mt-5 text-sm leading-relaxed text-stone">{visit.metro}</p>
              <div className="mt-5 flex flex-col gap-2 text-sm">
                <a href={`tel:${contact.phone}`} className="font-bold text-gold transition hover:text-gold-dark">{contact.phoneDisplay}</a>
                <a href={contact.mapsLink} target="_blank" rel="noopener noreferrer" className="font-bold text-gold transition hover:text-gold-dark">{visit.maps}</a>
              </div>
              <BookVisitButton size="sm" className="mt-7">{visit.book}</BookVisitButton>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </Container>
    </section>
  );
}
