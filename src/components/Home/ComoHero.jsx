import { Link } from "react-scroll";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function ComoHero() {
  const { t } = useTranslation();
  const slide = t("announcements.items")?.[0];

  return (
    <section id="home" className="relative h-screen min-h-[640px] w-full overflow-hidden">
      <img
        src={slide?.img ?? "/massage/1.webp"}
        alt={t("hero.imageAlt")}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-void/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-void/50 via-void/10 to-void/20" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-milk">
        <p className="section-label text-stone">
          {t("hero.eyebrow")}
        </p>
        <h1 className="mt-6 max-w-4xl font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.03em] sm:text-display-xl">
          {t("hero.welcome")}
        </h1>
        <h2 className="mt-5 font-display text-xl font-normal italic text-milk/90 sm:text-2xl">
          {t("hero.tagline")}
        </h2>
      </div>

      <Link
        to="intro"
        smooth
        duration={800}
        offset={-80}
        className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-3 text-stone transition hover:text-milk"
      >
        <span className="text-[10px] uppercase tracking-[0.24em]">{t("hero.scrollExplore")}</span>
        <span className="h-10 w-px origin-top animate-scroll-line bg-milk/40" />
      </Link>
    </section>
  );
}
