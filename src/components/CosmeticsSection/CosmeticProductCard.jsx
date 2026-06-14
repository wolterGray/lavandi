import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import CosmeticProductImage from "./CosmeticProductImage";
import { getCosmeticProductUrl } from "./cosmeticsShared";

export default function CosmeticProductCard({
  product,
  index,
  categoryLabel,
  variant = "compact",
  reveal = true,
}) {
  const { t } = useTranslation();
  const productUrl = getCosmeticProductUrl(product.id);
  const featured = variant === "featured";

  const card = (
    <Link
      to={productUrl}
      aria-label={`${product.name} — ${t("cosmetics.viewProduct")}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-border/50 bg-card shadow-spa transition duration-700 ease-luxury hover:-translate-y-0.5 hover:border-gold/25 hover:shadow-spa-hover"
    >
        <CosmeticProductImage
          compact={!featured}
          product={product}
          className={`w-full shrink-0 ${featured ? "aspect-[4/5]" : "aspect-square"}`}
        />
        <div
          className={`flex flex-1 flex-col ${featured ? "p-4 sm:p-5" : "p-3 sm:p-3.5"}`}
        >
          <p
            className={`font-bold uppercase tracking-[0.14em] text-gold ${
              featured
                ? "text-[10px] tracking-[0.16em]"
                : "text-[9px] line-clamp-1"
            }`}
          >
            {categoryLabel}
          </p>
          <h3
            className={`mt-1.5 font-display leading-snug text-milk ${
              featured
                ? "mt-2 line-clamp-2 text-base sm:text-lg"
                : "line-clamp-2 text-sm sm:text-[15px]"
            }`}
          >
            {product.name}
          </h3>
          {product.volume ? (
            <p
              className={`mt-1 font-semibold uppercase tracking-[0.08em] text-stone/80 ${
                featured ? "text-xs tracking-[0.1em]" : "text-[10px]"
              }`}
            >
              {product.volume}
            </p>
          ) : null}
          {featured && product.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">
              {product.description}
            </p>
          ) : null}
          <p
            className={`mt-auto flex items-center gap-1 font-bold uppercase tracking-[0.12em] text-gold transition group-hover:text-gold-dark ${
              featured ? "gap-1.5 pt-3 text-[10px]" : "pt-2 text-[9px]"
            }`}
          >
            {t("cosmetics.viewProduct")}
            <ArrowUpRight
              className={`transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                featured ? "h-3.5 w-3.5" : "h-3 w-3"
              }`}
            />
          </p>
        </div>
      </Link>
  );

  if (!reveal) {
    return <div className="h-full">{card}</div>;
  }

  return (
    <ScrollAnimationWrapper delay={Math.min(index * 0.05, 0.2)} className="h-full">
      {card}
    </ScrollAnimationWrapper>
  );
}
