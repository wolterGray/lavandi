import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import CosmeticProductCard from "./CosmeticProductCard";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import {
  buildLocalizedProducts,
  CATEGORY_KEYS,
  matchesProductSearch,
} from "./cosmeticsShared";

export default function CosmeticsCatalog() {
  const { t, lang } = useTranslation();
  const { cosmetics, getProductTexts } = useContent();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const products = useMemo(
    () => buildLocalizedProducts(cosmetics, t, lang, getProductTexts),
    [t, lang, cosmetics, getProductTexts]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          matchesProductSearch(product, searchQuery) &&
          (activeCategory === "all" || product.category === activeCategory)
      ),
    [activeCategory, products, searchQuery]
  );

  return (
    <>
      <ScrollAnimationWrapper delay={0.08} className="mt-10">
        <label className="block" htmlFor="cosmetics-search">
          <span className="sr-only">{t("cosmetics.searchLabel")}</span>
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="cosmetics-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("cosmetics.searchPlaceholder")}
              className="w-full rounded-pill border border-border/50 bg-card py-3 pl-11 pr-4 text-sm text-milk placeholder:text-muted transition focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>
        </label>
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.12} className="mt-6">
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

      {filteredProducts.length === 0 ? (
        <ScrollAnimationWrapper delay={0.15} className="mt-10 rounded-card border border-border/40 bg-card/60 px-6 py-12 text-center">
          <p className="text-sm text-stone">{t("cosmetics.noResults")}</p>
        </ScrollAnimationWrapper>
      ) : (
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
      )}
    </>
  );
}
