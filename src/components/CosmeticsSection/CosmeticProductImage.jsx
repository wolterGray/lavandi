import { useImageSrc } from "../../hooks/useImageSrc";
import { PLACEHOLDER_GRADIENTS } from "./cosmeticsShared";

export default function CosmeticProductImage({
  product,
  className = "",
  imageClassName = "h-full w-full object-contain object-center p-3",
  initialsClassName = "font-display text-4xl font-semibold tracking-[0.08em] text-milk/25 sm:text-5xl",
}) {
  const imageSrc = useImageSrc(product.img);
  const gradient = PLACEHOLDER_GRADIENTS[product.accent % PLACEHOLDER_GRADIENTS.length];

  return (
    <div className={`relative overflow-hidden ${imageSrc ? "bg-void" : gradient} ${className}`}>
      {imageSrc ? (
        <img src={imageSrc} alt="" className={imageClassName} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className={initialsClassName}>{product.initials}</span>
        </div>
      )}
    </div>
  );
}
