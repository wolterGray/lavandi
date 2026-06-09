import { useState } from "react";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-base text-milk sm:text-lg">{question}</span>
        <span className="mt-1 shrink-0 text-gold">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <p className="pb-5 text-sm leading-relaxed text-stone">{answer}</p>}
    </div>
  );
}

export default function FaqSection() {
  const { t } = useTranslation();
  const faqItems = t("faq.items") ?? [];
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="section-padding border-t border-white/[0.06]">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("faq.label")} description={t("faq.description")}>
            {t("faq.title")}
          </SectionTitle>

          <div className="mx-auto max-w-3xl">
            {faqItems.map((item, index) => (
              <FaqItem
                key={item.question}
                {...item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </div>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
