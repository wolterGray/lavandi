import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import CosmeticProductCard from "./CosmeticProductCard";
import CosmeticProductCardSkeleton from "./CosmeticProductCardSkeleton";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import { buildLocalizedProduct, COSMETICS_ROUTE, formatProductCategoryLabels, getFeaturedProducts } from "./cosmeticsShared";

export default function CosmeticsSection() {
  const { t, lang } = useTranslation();
  const { cosmetics, featuredCosmeticIds, getProductTexts, contentLoading } = useContent();

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
        <ScrollAnimationWrapper>
          <SectionTitle
            label={t("cosmetics.label")}
            description={t("cosmetics.description")}
            align="center"
          >
            {t("cosmetics.title")}
          </SectionTitle>
          <div className="spa-divider my-6" />
        </ScrollAnimationWrapper>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {contentLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <CosmeticProductCardSkeleton key={index} variant="featured" />
              ))
            : featuredProducts.map((product, index) => (
                <CosmeticProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  categoryLabel={formatProductCategoryLabels(t, product)}
                  variant="featured"
                  reveal={false}
                />
              ))}
        </div>

        <ScrollAnimationWrapper delay={0.12} className="mt-10 flex justify-center">
          <RouterLink
            to={COSMETICS_ROUTE}
            className="inline-flex min-h-[52px] items-center justify-center rounded-pill border border-[#d9a752]/40 bg-[#d9a752]/10 px-9 font-display text-xs font-bold uppercase tracking-[0.22em] text-[#d9a752] transition duration-300 ease-luxury hover:border-[#d9a752] hover:bg-[#d9a752] hover:text-[#08060c]"
          >
            {t("cosmetics.viewAll")}
          </RouterLink>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
