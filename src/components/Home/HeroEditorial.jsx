import { Link } from "react-scroll";
import { useTranslation } from "../../i18n/LanguageProvider";
import BookVisitButton from "../../ui/BookVisitButton";

export default function HeroEditorial({ image = "/massage/1.webp" }) {
  const { t } = useTranslation();

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={image}
        alt={t("hero.imageAlt")}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchPriority="high"
        decoding="sync"
      />
      <div className="absolute inset-0 bg-[rgba(154,132,88,0.06)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/80 via-void/30 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
        <div className="max-w-2xl">
          <p className="section-label">{t("hero.eyebrow")}</p>
          <h1 className="mt-4 font-display text-display-md font-bold tracking-[-0.03em] text-milk text-balance sm:text-display-lg lg:max-w-xl">{t("hero.title")}</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-stone md:text-[17px] md:leading-7">{t("hero.subtitle")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BookVisitButton size="lg">{t("hero.cta")}</BookVisitButton>
            <Link to="services" smooth duration={600} offset={-80} className="inline-flex min-h-[52px] items-center justify-center px-2 text-sm text-stone transition hover:text-milk">
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 right-6 hidden flex-col items-center gap-2 text-muted lg:flex">
          <span className="text-[10px] uppercase tracking-[0.2em]">{t("hero.scroll")}</span>
          <span className="h-8 w-px bg-white/20" />
        </div>
      </div>
    </div>
  );
}
