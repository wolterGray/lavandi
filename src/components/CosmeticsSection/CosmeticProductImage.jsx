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
  const imageSrc = useImageSrc(product.img);
  const gradient = PLACEHOLDER_GRADIENTS[product.accent % PLACEHOLDER_GRADIENTS.length];
  const surfaceClass = imageSrc
    ? getProductImageSurfaceClass(product, { hasImage: true })
    : gradient;
  const resolvedInitialsClassName =
    initialsClassName ??
    (compact
      ? "font-display text-2xl font-semibold tracking-[0.08em] text-milk/25 sm:text-3xl"
      : "font-display text-4xl font-semibold tracking-[0.08em] text-milk/25 sm:text-5xl");

  return (
    <div
      className={`relative flex min-h-0 items-center justify-center ${
        compact ? "p-2 sm:p-2.5" : "p-3 sm:p-4"
      } ${surfaceClass} ${className}`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className={imageClassName}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className={resolvedInitialsClassName}>{product.initials}</span>
      )}
    </div>
  );
}
