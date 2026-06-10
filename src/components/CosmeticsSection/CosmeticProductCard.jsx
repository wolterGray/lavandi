import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useImageSrc } from "../../hooks/useImageSrc";
import { PLACEHOLDER_GRADIENTS } from "./cosmeticsShared";

export default function CosmeticProductCard({ product, index, categoryLabel }) {
  const { t } = useTranslation();
  const copy = t(`cosmetics.products.${product.id}`) ?? {};
  const gradient = PLACEHOLDER_GRADIENTS[product.accent % PLACEHOLDER_GRADIENTS.length];
  const imageSrc = useImageSrc(product.img);

  return (
    <ScrollAnimationWrapper delay={index * 0.05}>
      <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border/50 bg-card shadow-spa transition duration-700 ease-luxury hover:-translate-y-0.5 hover:border-gold/25 hover:shadow-spa-hover">
        <div className={`relative aspect-[4/5] overflow-hidden ${imageSrc ? "bg-void" : gradient}`}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-4xl font-semibold tracking-[0.08em] text-milk/25 transition duration-700 group-hover:text-milk/40 sm:text-5xl">
                {product.initials}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{categoryLabel}</p>
            <h3 className="mt-2 font-display text-lg text-milk sm:text-xl">{copy.name}</h3>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{copy.brand}</p>
          <p className="mt-2 text-sm leading-relaxed text-stone">{copy.tagline}</p>
          <p className="mt-auto pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-stone/80">
            {t("cosmetics.availableAtStudio")}
          </p>
        </div>
      </article>
    </ScrollAnimationWrapper>
  );
}
