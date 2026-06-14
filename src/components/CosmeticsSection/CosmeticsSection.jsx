import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import CosmeticProductCard from "./CosmeticProductCard";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import { buildLocalizedProduct, COSMETICS_ROUTE, formatProductCategoryLabels, getFeaturedProducts } from "./cosmeticsShared";

export default function CosmeticsSection() {
  const { t, lang } = useTranslation();
  const { cosmetics, featuredCosmeticIds, getProductTexts } = useContent();

  const featuredProducts = useMemo(() => {
    const featured = getFeaturedProducts(t, cosmetics, featuredCosmeticIds);
    return featured.map((product) => {
      const base = cosmetics.find((item) => item.id === product.id);
      return base ? buildLocalizedProduct(base, t, lang, getProductTexts) : product;
    });
  }, [t, lang, cosmetics, featuredCosmeticIds, getProductTexts]);

  return (
    <section id="catalog" className="section-padding bg-surface">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
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

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {featuredProducts.map((product, index) => (
            <CosmeticProductCard
              key={product.id}
              product={product}
              index={index}
              categoryLabel={formatProductCategoryLabels(t, product)}
              variant="featured"
            />
          ))}
        </div>

        <ScrollAnimationWrapper delay={0.12} className="mt-10 flex justify-center">
          <RouterLink
            to={COSMETICS_ROUTE}
            className="inline-flex min-h-[52px] items-center justify-center rounded-pill border border-gold/40 bg-gold/10 px-9 font-display text-xs font-bold uppercase tracking-[0.22em] text-gold transition duration-300 ease-luxury hover:border-gold hover:bg-gold hover:text-void"
          >
            {t("cosmetics.viewAll")}
          </RouterLink>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
