import { useImageSrc } from "../../hooks/useImageSrc";
import { PLACEHOLDER_GRADIENTS } from "./cosmeticsShared";

export default function CosmeticProductImage({
  product,
  className = "",
  imageClassName = "max-h-full max-w-full object-contain object-center",
  initialsClassName = "font-display text-4xl font-semibold tracking-[0.08em] text-milk/25 sm:text-5xl",
}) {
  const imageSrc = useImageSrc(product.img);
  const gradient = PLACEHOLDER_GRADIENTS[product.accent % PLACEHOLDER_GRADIENTS.length];

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden p-4 sm:p-5 ${
        imageSrc ? "bg-void" : gradient
      } ${className}`}
    >
      {imageSrc ? (
        <img src={imageSrc} alt="" className={imageClassName} />
      ) : (
        <span className={initialsClassName}>{product.initials}</span>
      )}
    </div>
  );
}
