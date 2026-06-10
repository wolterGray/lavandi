import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import CosmeticsCatalog from "../components/CosmeticsSection/CosmeticsCatalog";
import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";
import ScrollAnimationWrapper from "../ui/ScrollAnimationWrapper";
import { useTranslation } from "../i18n/LanguageProvider";
import { EMAIL, SITE_URL } from "../constants/theme";
import { COSMETICS_ROUTE } from "../components/CosmeticsSection/cosmeticsShared";

function PageNav() {
  const { t } = useTranslation();
  const linkClass = "cursor-pointer text-sm text-stone transition hover:text-gold";

  return (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label={t("cosmeticsPage.navLabel")}>
      <Link to="/" className={linkClass}>{t("common.backHome")}</Link>
    </nav>
  );
}

export default function CosmeticsPage() {
  const { t, lang } = useTranslation();
  const pageUrl = `${SITE_URL}${COSMETICS_ROUTE}`;
  const title = t("cosmeticsPage.meta.title");
  const description = t("cosmeticsPage.meta.description");

  const navItems = [
    { label: t("nav.home"), path: "home" },
    { label: t("nav.services"), path: "services" },
    { label: t("nav.price"), path: "prices" },
    { label: t("nav.cosmetics"), to: COSMETICS_ROUTE },
    { label: t("nav.about"), path: "about" },
  ];

  return (
    <>
      <Helmet>
        <html lang={lang === "uk" ? "uk" : lang} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
      </Helmet>

      <Header navItems={navItems} linkToHome />

      <section className="bg-surface pb-20 pt-28 lg:pt-36">
        <Container>
          <PageNav />

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
            <ScrollAnimationWrapper>
              <div>
                <SectionTitle label={t("cosmetics.label")}>{t("cosmetics.title")}</SectionTitle>
                <div className="spa-divider !mx-0" />
              </div>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper delay={0.08}>
              <p className="max-w-lg text-base leading-relaxed text-stone lg:pb-2">
                {t("cosmetics.description")}
              </p>
            </ScrollAnimationWrapper>
          </div>

          <CosmeticsCatalog />

          <ScrollAnimationWrapper delay={0.15} className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button href={`mailto:${EMAIL}?subject=${encodeURIComponent(t("cosmetics.emailSubject"))}`} size="lg">
              {t("cosmetics.cta")}
            </Button>
            <Link
              to="/#contact"
              className="inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-pill border border-border/50 px-6 text-[10px] font-bold uppercase tracking-[0.18em] text-stone transition hover:border-gold/40 hover:text-gold"
            >
              {t("cosmetics.ctaSecondary")}
            </Link>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper className="mt-10 border-t border-border/10 pt-8">
            <PageNav />
          </ScrollAnimationWrapper>
        </Container>
      </section>

      <Footer navItems={navItems} linkToHome />
    </>
  );
}
