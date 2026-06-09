import { motion } from "framer-motion";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section id="about" className="section-padding border-t border-white/[0.06]">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} viewport={{ once: true }}>
            <SectionTitle label={t("about.label")} align="left">{t("about.title")}</SectionTitle>
            <p className="-mt-6 max-w-lg text-base leading-relaxed text-stone md:text-[17px] md:leading-8">{t("about.text")}</p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-muted">{t("about.location")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }} viewport={{ once: true }}>
            <img src="/about/about.webp" alt={t("hero.imageAlt")} loading="lazy" className="aspect-[4/5] w-full rounded-2xl object-cover" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
