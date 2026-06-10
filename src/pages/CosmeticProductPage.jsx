import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ChevronLeft } from "lucide-react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Container from "../ui/Container";
import Button from "../ui/Button";
import ScrollAnimationWrapper from "../ui/ScrollAnimationWrapper";
import { useTranslation } from "../i18n/LanguageProvider";
import { isImageRef } from "../admin/siteImages";
import { EMAIL, SITE_URL } from "../constants/theme";
import CosmeticProductImage from "../components/CosmeticsSection/CosmeticProductImage";
import {
  buildCosmeticInquiryMailto,
  COSMETICS_ROUTE,
} from "../components/CosmeticsSection/cosmeticsShared";
import { useImageSrc } from "../hooks/useImageSrc";

function resolveOgImage(image) {
  if (!image || isImageRef(image) || image.startsWith("data:")) {
    return `${SITE_URL}/og-image.jpg`;
  }
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image}`;
}

export default function CosmeticProductPage({ product }) {
  const { t, lang } = useTranslation();
  const imageSrc = useImageSrc(product.img);
  const pageUrl = `${SITE_URL}${COSMETICS_ROUTE}/${product.id}`;
  const categoryLabel = t(`cosmetics.categories.${product.category}`);
  const title = t("cosmeticsProductPage.meta.title", { name: product.name });
  const description =
    product.description?.trim() ||
    t("cosmeticsProductPage.meta.descriptionFallback", { name: product.name });

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
        <meta property="og:image" content={resolveOgImage(imageSrc)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            sku: product.id,
            brand: { "@type": "Brand", name: "NUAR" },
            image: resolveOgImage(imageSrc),
          })}
        </script>
      </Helmet>

      <Header navItems={navItems} linkToHome />

      <Container className="pb-20 pt-28 lg:pt-36">
        <Link
          to={COSMETICS_ROUTE}
          className="inline-flex items-center gap-1.5 text-sm text-stone transition hover:text-gold"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {t("cosmeticsProductPage.backToCatalog")}
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <ScrollAnimationWrapper direction="left">
            <div className="card-gradient-border overflow-hidden rounded-card shadow-spa">
              <CosmeticProductImage
                product={product}
                className="min-h-[320px] aspect-square sm:min-h-[420px]"
                imageClassName="max-h-[min(100%,520px)] max-w-full object-contain object-center"
                initialsClassName="font-display text-6xl font-semibold tracking-[0.08em] text-milk/25"
              />
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <div>
              <p className="section-label">{categoryLabel}</p>
              <div className="spa-divider !mx-0" />
              <h1 className="mt-4 font-display text-display-sm text-milk">{product.name}</h1>
              {product.volume ? (
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                  {product.volume}
                </p>
              ) : null}
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                {t("cosmeticsProductPage.productId")}: {product.id}
              </p>

              {product.description ? (
                <p className="mt-6 text-base leading-relaxed text-stone">{product.description}</p>
              ) : null}

              {product.composition ? (
                <div className="mt-8 rounded-card border border-border/40 bg-surface/60 p-5">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                    {t("cosmetics.compositionLabel")}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{product.composition}</p>
                </div>
              ) : null}

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.12em] text-stone/80">
                {t("cosmetics.availableAtStudio")}
              </p>

              <div className="mt-8">
                <Button href={buildCosmeticInquiryMailto(EMAIL, t, product)} size="lg">
                  {t("cosmetics.interestedCta")}
                </Button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </Container>

      <Footer navItems={navItems} linkToHome />
    </>
  );
}
