import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ChevronLeft } from "lucide-react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import CosmeticsCatalog from "../components/CosmeticsSection/CosmeticsCatalog";
import Container from "../ui/Container";
import Button from "../ui/Button";
import BookVisitButton from "../ui/BookVisitButton";
import ScrollAnimationWrapper from "../ui/ScrollAnimationWrapper";
import { useTranslation } from "../i18n/LanguageProvider";
import { useContent } from "../context/ContentProvider";
import { EMAIL, SITE_URL } from "../constants/theme";
import { COSMETICS_ROUTE } from "../components/CosmeticsSection/cosmeticsShared";

export default function CosmeticsPage() {
  const { t, lang } = useTranslation();
  const { cosmetics } = useContent();
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

      <section className="bg-surface pb-20 pt-10 sm:pt-12 lg:pt-14">
        <Container>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-stone transition hover:text-gold"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t("common.backHome")}
          </Link>

          <ScrollAnimationWrapper className="mt-8">
            <div className="border-b border-border/60 pb-8">
              <h1 className="max-w-3xl font-display text-[2.55rem] leading-[1.04] text-milk sm:text-display-lg lg:text-display-xl">
                {t("cosmetics.title")}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone sm:text-lg">
                {t("cosmetics.description")}
              </p>
            </div>
          </ScrollAnimationWrapper>

          <CosmeticsCatalog />

          {cosmetics.length > 0 && (
            <ScrollAnimationWrapper delay={0.15} className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Button href={`mailto:${EMAIL}?subject=${encodeURIComponent(t("cosmetics.emailSubject"))}`} size="lg">
                {t("cosmetics.cta")}
              </Button>
              <BookVisitButton variant="secondary" size="lg">
                {t("cosmetics.ctaSecondary")}
              </BookVisitButton>
            </ScrollAnimationWrapper>
          )}

        </Container>
      </section>

      <Footer navItems={navItems} linkToHome />
    </>
  );
}
