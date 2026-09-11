import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Search } from "lucide-react";
import { useTranslation } from "../i18n/LanguageProvider";
import { SITE_URL } from "../constants/theme";
import { COSMETICS_ROUTE } from "../components/CosmeticsSection/cosmeticsShared";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("notFound.title")} — NUAR</title>
        <meta name="description" content={t("notFound.description")} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${SITE_URL}/404`} />
      </Helmet>

      <section className="flex min-h-screen items-center bg-cream px-5 py-16">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold">
            {t("notFound.label")}
          </p>
          <div className="spa-divider" />
          <h1 className="mt-6 text-balance font-display text-4xl leading-tight text-milk sm:text-5xl">
            {t("notFound.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-stone sm:text-lg">
            {t("notFound.description")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-pill bg-gold px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-void transition hover:bg-gold-hover"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {t("common.home")}
            </Link>
            <Link
              to={COSMETICS_ROUTE}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-pill border border-border/60 px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-milk transition hover:border-gold/50 hover:text-gold"
            >
              <Search className="h-4 w-4" aria-hidden />
              {t("notFound.catalog")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
