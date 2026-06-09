import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import CountUp, { useStatsInView } from "../../hooks/useCountUp";
import { StatIcon } from "../../constants/icons.jsx";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function StatsSection() {
  const { t } = useTranslation();
  const [ref, inView] = useStatsInView();
  const items = t("stats.items") ?? [];

  return (
    <section id="stats" className="section-padding border-t border-white/[0.06]">
      <Container>
        <SectionTitle label={t("stats.label")} description={t("stats.description")}>
          {t("stats.title")}
        </SectionTitle>

        <div
          ref={ref}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4"
        >
          {items.map((item) => (
            <article
              key={item.id ?? item.label}
              className="flex min-h-[168px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-graphite/50 px-3 py-7 text-center sm:min-h-[180px] sm:px-4 sm:py-8"
            >
              <div className="mb-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gradient-to-b from-gold/[0.1] to-transparent">
                <StatIcon id={item.id} />
              </div>
              <p className="font-display text-[2rem] leading-none tabular-nums text-milk sm:text-[2.35rem]">
                {item.prefix}
                <CountUp value={item.value} suffix={item.suffix ?? ""} active={inView} />
              </p>
              <p className="mt-3 max-w-[9rem] text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted">
                {item.label}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
