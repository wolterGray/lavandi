import { useImageSrc } from "../../hooks/useImageSrc";
import {
  getProductImageSurfaceClass,
  PLACEHOLDER_GRADIENTS,
} from "./cosmeticsShared";

export default function CosmeticProductImage({
  product,
  className = "",
  compact = false,
  imageClassName = "h-full w-full object-contain object-center",
  initialsClassName,
}) {
  const imageRef = product.img;
  const { src: resolvedSrc } = useImageSrc(imageRef);
  const gradient = PLACEHOLDER_GRADIENTS[product.accent % PLACEHOLDER_GRADIENTS.length];
  const resolvedInitialsClassName =
    initialsClassName ??
    (compact
      ? "font-display text-2xl font-semibold tracking-[0.08em] text-milk/25 sm:text-3xl"
      : "font-display text-4xl font-semibold tracking-[0.08em] text-milk/25 sm:text-5xl");

  if (resolvedSrc) {
    return (
      <div
        className={`relative flex min-h-0 items-center justify-center ${
          compact ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
        } ${getProductImageSurfaceClass(product, { hasImage: true })} ${className}`}
      >
        <img
          src={resolvedSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className={imageClassName}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-h-0 items-center justify-center ${
        compact ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
      } ${gradient} ${className}`}
    >
      <span className={resolvedInitialsClassName}>{product.initials || "NU"}</span>
    </div>
  );
}
