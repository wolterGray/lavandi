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

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <ScrollAnimationWrapper direction="left">
            <div className="flex h-full flex-col justify-between gap-8 border-y border-border/60 py-8 lg:py-10">
              <div className="space-y-5 text-sm leading-relaxed text-stone">
                <address className="not-italic">
                  <p className="font-display text-2xl leading-snug text-milk">{contact.street}</p>
                  <p className="mt-1">{contact.city}</p>
                </address>
                <p>{visit.metro}</p>
                <div className="flex flex-col gap-2 pt-1">
                  <a href={`tel:${contact.phone}`} className="font-bold text-gold transition hover:text-gold-dark">{contact.phoneDisplay}</a>
                  <a href={contact.mapsLink} target="_blank" rel="noopener noreferrer" className="font-bold text-gold transition hover:text-gold-dark">{visit.maps}</a>
                </div>
              </div>

              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[2.75rem_1fr] gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/25 text-gold">
                      <VisitStepIcon id={step.id} />
                    </div>
                    <div className="border-b border-border/45 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-baseline gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">0{index + 1}</span>
                        <h3 className="font-display text-xl leading-snug text-milk">{step.title}</h3>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-stone">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div>
                <BookVisitButton size="sm">{visit.book}</BookVisitButton>
              </div>
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
