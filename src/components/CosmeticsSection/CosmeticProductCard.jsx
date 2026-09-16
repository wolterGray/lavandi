import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import CosmeticProductImage from "./CosmeticProductImage";
import { formatCosmeticPriceLabel, getCosmeticAvailability, getCosmeticProductUrl } from "./cosmeticsShared";

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
  const priceLabel = formatCosmeticPriceLabel(product.price, t("common.pln"));
  const availability = getCosmeticAvailability(product);
  const statusLabel =
    availability.status === "COMING_SOON"
      ? t("cosmeticsOrder.comingSoon")
      : availability.status === "OUT_OF_STOCK"
        ? t("cosmeticsOrder.outOfStock")
        : "";
  const isUnavailable = availability.status === "OUT_OF_STOCK";
  const compactCategoryLabel = String(categoryLabel ?? "").split("·")[0]?.trim() || categoryLabel;

  const card = (
    <Link
      to={productUrl}
      aria-label={`${product.name} — ${t("cosmetics.viewProduct")}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-card border border-border/50 bg-card shadow-spa transition duration-700 ease-luxury hover:-translate-y-0.5 hover:border-gold/25 hover:shadow-spa-hover ${
        isUnavailable ? "bg-card/70" : ""
      }`}
    >
      {isUnavailable ? (
        <div className="pointer-events-none absolute inset-0 z-10 bg-void/28" aria-hidden />
      ) : null}
      {isUnavailable && statusLabel ? (
        <div className="pointer-events-none absolute right-0 top-4 z-20">
          <span className="inline-flex min-h-[34px] items-center justify-center rounded-l-pill bg-gold px-4 text-center font-sans text-[9px] font-extrabold uppercase tracking-[0.14em] text-void shadow-spa sm:text-[10px]">
            {statusLabel}
          </span>
        </div>
      ) : null}
        <CosmeticProductImage
          compact={!featured}
          priority={index < 12}
          product={product}
          className={`w-full shrink-0 transition duration-700 ${isUnavailable ? "opacity-45 grayscale-[35%]" : ""} ${
            featured ? "aspect-[4/5]" : "aspect-square"
          }`}
        />
        <div
          className={`relative z-20 flex flex-1 flex-col ${
            isUnavailable ? "opacity-70" : ""
          } ${featured ? "p-4 sm:p-5" : "p-3 sm:p-3.5"}`}
        >
          <p
            title={categoryLabel}
            className={`font-sans font-bold uppercase tracking-[0.12em] text-gold ${
              featured
                ? "text-[10px]"
                : "truncate text-[9px]"
            }`}
          >
            {compactCategoryLabel}
          </p>
          <h3
            title={product.name}
            className={`mt-2 font-sans font-semibold leading-snug text-milk ${
              featured
                ? "line-clamp-2 min-h-[3rem] text-[17px] sm:text-lg"
                : "line-clamp-2 min-h-[2.65rem] text-[15px] sm:text-base"
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
          {priceLabel ? (
            <p className={`mt-1 font-bold text-gold ${featured ? "text-sm" : "text-xs"}`}>
              {priceLabel}
            </p>
          ) : null}
          {statusLabel && !isUnavailable ? (
            <p className={`mt-2 inline-flex w-fit rounded-card bg-surface px-2 py-1 font-bold uppercase tracking-[0.08em] ${
              availability.status === "COMING_SOON" ? "text-gold" : "text-stone"
            } ${featured ? "text-[10px]" : "text-[9px]"}`}>
              {statusLabel}
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
