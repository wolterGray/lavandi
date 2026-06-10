import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import CountUp, { useStatsInView } from "../../hooks/useCountUp";
import { StatIcon } from "../../constants/icons.jsx";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function StatsSection() {
  const { t } = useTranslation();
  const [ref, inView] = useStatsInView();
  const items = t("stats.items") ?? [];

  return (
    <section id="stats" className="section-padding bg-surface">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("stats.label")} description={t("stats.description")}>
            {t("stats.title")}
          </SectionTitle>
          <div className="spa-divider" />
        </ScrollAnimationWrapper>

        <div ref={ref} className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {items.map((item, index) => (
            <ScrollAnimationWrapper key={item.id ?? item.label} delay={index * 0.08}>
              <article className="spa-card flex min-h-[150px] flex-col items-center justify-center px-3 py-6 text-center sm:py-7">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold">
                  <StatIcon id={item.id} />
                </div>
                <p className="font-display text-[1.75rem] leading-none tabular-nums text-gold sm:text-[2rem]">
                  {item.prefix}
                  <CountUp value={item.value} suffix={item.suffix ?? ""} active={inView} />
                </p>
                <p className="mt-2 max-w-[9rem] text-[10px] uppercase leading-relaxed tracking-[0.14em] text-stone">
                  {item.label}
                </p>
              </article>
            </ScrollAnimationWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
