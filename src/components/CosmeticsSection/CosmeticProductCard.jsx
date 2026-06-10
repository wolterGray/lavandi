import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import CosmeticProductImage from "./CosmeticProductImage";
import { getCosmeticProductUrl } from "./cosmeticsShared";

export default function CosmeticProductCard({ product, index, categoryLabel }) {
  const { t } = useTranslation();
  const productUrl = getCosmeticProductUrl(product.id);

  return (
    <ScrollAnimationWrapper delay={index * 0.05}>
      <Link
        to={productUrl}
        aria-label={`${product.name} — ${t("cosmetics.viewProduct")}`}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-border/50 bg-card shadow-spa transition duration-700 ease-luxury hover:-translate-y-0.5 hover:border-gold/25 hover:shadow-spa-hover"
      >
        <CosmeticProductImage product={product} className="aspect-[4/5] w-full shrink-0" />
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{categoryLabel}</p>
          <h3 className="mt-2 font-display text-lg text-milk sm:text-xl">{product.name}</h3>
          {product.volume ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-stone/80">
              {product.volume}
            </p>
          ) : null}
          {product.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone">{product.description}</p>
          ) : null}
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-gold transition group-hover:text-gold-dark">
            {t("cosmetics.viewProduct")}
            <ArrowUpRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </p>
        </div>
      </Link>
    </ScrollAnimationWrapper>
  );
}
