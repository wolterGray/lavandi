import { useMemo, useState } from "react";
import CosmeticProductCard from "./CosmeticProductCard";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import { CATEGORY_KEYS, getLocalizedProducts } from "./cosmeticsShared";

export default function CosmeticsCatalog() {
  const { t, lang } = useTranslation();
  const { cosmetics, getProductTexts } = useContent();
  const [activeCategory, setActiveCategory] = useState("all");

  const products = useMemo(
    () =>
      getLocalizedProducts(t, cosmetics).map((product) => ({
        ...product,
        ...getProductTexts(lang, product.id, t),
      })),
    [t, lang, cosmetics, getProductTexts]
  );

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products]
  );

  return (
    <>
      <ScrollAnimationWrapper delay={0.12} className="mt-10">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("cosmetics.filterLabel")}>
          {CATEGORY_KEYS.map((key) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(key)}
                className={`rounded-pill border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition duration-300 ${
                  isActive
                    ? "border-gold/40 bg-gold/10 text-gold"
                    : "border-border/50 text-stone hover:border-gold/30 hover:text-milk"
                }`}
              >
                {t(`cosmetics.categories.${key}`)}
              </button>
            );
          })}
        </div>
      </ScrollAnimationWrapper>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
        {filteredProducts.map((product, index) => (
          <CosmeticProductCard
            key={product.id}
            product={product}
            index={index}
            categoryLabel={t(`cosmetics.categories.${product.category}`)}
          />
        ))}
      </div>
    </>
  );
}
