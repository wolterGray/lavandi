import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ImageSkeleton } from "../../ui/SiteImage";
import CosmeticProductCard from "./CosmeticProductCard";
import CosmeticProductCardSkeleton from "./CosmeticProductCardSkeleton";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import {
  buildLocalizedProducts,
  CATEGORY_KEYS,
  formatProductCategoryLabels,
  getCategoryFilterLabel,
  matchesProductSearch,
  productMatchesCategory,
} from "./cosmeticsShared";

const CATALOG_GRID_CLASSNAME =
  "mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]";

const CATEGORY_GRID_CLASSNAME =
  "mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:gap-2";

function CategoryFilters({ activeCategory, onSelect, t }) {
  return (
    <div className={CATEGORY_GRID_CLASSNAME} role="tablist" aria-label={t("cosmetics.filterLabel")}>
      {CATEGORY_KEYS.map((key) => {
        const isActive = activeCategory === key;
        const fullLabel = t(`cosmetics.categories.${key}`);

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            title={fullLabel}
            onClick={() => onSelect(key)}
            className={`min-h-[44px] rounded-pill border px-3 py-2.5 text-center text-[10px] font-bold uppercase leading-snug tracking-[0.08em] transition duration-300 sm:tracking-[0.1em] md:min-h-0 md:w-auto md:whitespace-nowrap md:px-4 md:py-2 md:tracking-[0.14em] ${
              isActive
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-border/50 text-stone hover:border-gold/30 hover:text-milk"
            }`}
          >
            <span className="md:hidden">{getCategoryFilterLabel(t, key, { short: true })}</span>
            <span className="hidden md:inline">{fullLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function CosmeticsCatalog() {
  const { t, lang } = useTranslation();
  const { cosmetics, getProductTexts, contentLoading } = useContent();
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
          productMatchesCategory(product, activeCategory)
      ),
    [activeCategory, products, searchQuery]
  );

  if (contentLoading) {
    return (
      <>
        <ScrollAnimationWrapper delay={0.08} className="mt-10">
          <div className="relative max-w-xl">
            <ImageSkeleton className="h-12 w-full rounded-pill" />
          </div>
        </ScrollAnimationWrapper>
        <div className={CATEGORY_GRID_CLASSNAME}>
          {CATEGORY_KEYS.map((key) => (
            <ImageSkeleton key={key} className="h-11 rounded-pill" />
          ))}
        </div>
        <div className={CATALOG_GRID_CLASSNAME}>
          {Array.from({ length: cosmetics.length }, (_, index) => (
            <CosmeticProductCardSkeleton key={index} />
          ))}
        </div>
      </>
    );
  }

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

      <CategoryFilters
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        t={t}
      />

      {filteredProducts.length === 0 ? (
        <ScrollAnimationWrapper delay={0.15} className="mt-10 rounded-card border border-border/40 bg-card/60 px-6 py-12 text-center">
          <p className="text-sm text-stone">{t("cosmetics.noResults")}</p>
        </ScrollAnimationWrapper>
      ) : (
        <div className={CATALOG_GRID_CLASSNAME}>
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
