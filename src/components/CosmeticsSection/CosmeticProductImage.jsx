import SiteImage from "../../ui/SiteImage";
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
  const { src: resolvedSrc, ready } = useImageSrc(imageRef);
  const hasImageRef = Boolean(imageRef);
  const showPhoto = hasImageRef && (!ready || Boolean(resolvedSrc));
  const gradient = PLACEHOLDER_GRADIENTS[product.accent % PLACEHOLDER_GRADIENTS.length];
  const surfaceClass = showPhoto
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
      {showPhoto ? (
        <SiteImage
          src={imageRef}
          alt=""
          fill
          wrapperClassName="absolute inset-0"
          className={imageClassName}
          loading="lazy"
        />
      ) : (
        <span className={resolvedInitialsClassName}>{product.initials || "NU"}</span>
      )}
    </div>
  );
}
