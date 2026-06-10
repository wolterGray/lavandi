import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import { SCROLL_REVEAL_EASE } from "../../ui/ScrollAnimationWrapper";

function FaqItem({ question, answer, isOpen, onToggle }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="border-b border-border/10 last:border-b-0">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors duration-300 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <span className="font-display text-lg text-milk">{question}</span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: SCROLL_REVEAL_EASE }}
          className="mt-1 shrink-0 text-xl leading-none text-gold"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: SCROLL_REVEAL_EASE }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-stone">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  const { t, lang } = useTranslation();
  const { getFaqItems } = useContent();
  const faqItems = getFaqItems(lang, t("faq.items") ?? []);
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="section-padding bg-cream">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("faq.label")} description={t("faq.description")}>{t("faq.title")}</SectionTitle>
          <div className="spa-divider" />
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper delay={0.08}>
          <div className="card-gradient-border mx-auto mt-10 max-w-3xl overflow-hidden rounded-card bg-card px-5 shadow-spa sm:px-8">
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
