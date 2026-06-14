import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ImageSkeleton } from "../../ui/SiteImage";
import CosmeticProductCard from "./CosmeticProductCard";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import {
  buildLocalizedProducts,
  CATEGORY_KEYS,
  formatProductCategoryLabels,
  matchesProductSearch,
  productMatchesCategory,
} from "./cosmeticsShared";

export default function CosmeticsCatalog() {
  const { t, lang } = useTranslation();
  const { cosmetics, getProductTexts, contentLoading } = useContent();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const categoryStripRef = useRef(null);
  const categoryButtonRefs = useRef({});

  useEffect(() => {
    const node = categoryButtonRefs.current[activeCategory];
    if (!node || !categoryStripRef.current) return;
    node.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCategory]);

  const products = useMemo(
    () => buildLocalizedProducts(cosmetics, t, lang, getProductTexts),
    [t, lang, cosmetics, getProductTexts]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          matchesProductSearch(product, searchQuery) &&
          productMatchesCategory(product, activeCategory)
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

      <ScrollAnimationWrapper delay={0.12} className="relative mt-6">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-6 bg-gradient-to-r from-surface to-transparent md:hidden"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-6 bg-gradient-to-l from-surface to-transparent md:hidden"
          aria-hidden="true"
        />
        <div
          ref={categoryStripRef}
          className="category-scroll-strip -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
          role="tablist"
          aria-label={t("cosmetics.filterLabel")}
        >
          {CATEGORY_KEYS.map((key) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                ref={(node) => {
                  categoryButtonRefs.current[key] = node;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(key)}
                className={`shrink-0 snap-start whitespace-nowrap rounded-pill border px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition duration-300 sm:px-4 md:py-2 md:tracking-[0.14em] ${
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

      {contentLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-card border border-border/50 bg-card shadow-spa"
            >
              <ImageSkeleton className="aspect-square w-full" />
              <div className="space-y-2 p-3 sm:p-3.5">
                <ImageSkeleton className="h-2 w-1/3 rounded-full" />
                <ImageSkeleton className="h-4 w-4/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <ScrollAnimationWrapper delay={0.15} className="mt-10 rounded-card border border-border/40 bg-card/60 px-6 py-12 text-center">
          <p className="text-sm text-stone">{t("cosmetics.noResults")}</p>
        </ScrollAnimationWrapper>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {filteredProducts.map((product, index) => (
            <CosmeticProductCard
              key={product.id}
              product={product}
              index={index}
              reveal={false}
              categoryLabel={formatProductCategoryLabels(t, product)}
            />
          ))}
        </div>
      )}
    </>
  );
}
