import SiteImage, { ImageSkeleton } from "../../ui/SiteImage";
import { IMAGE_VARIANT } from "../../admin/siteImages";
import { getProductImageSurfaceClass } from "./cosmeticsShared";

export default function CosmeticProductImage({
  product,
  className = "",
  compact = false,
  priority = false,
  imageVariant = IMAGE_VARIANT.thumb,
  imageClassName = "h-full w-full object-contain object-center",
}) {
  const imageRef = product.img;
  const padding = compact ? "p-2 sm:p-2.5" : "p-3 sm:p-4";

  if (!imageRef) {
    return (
      <div className={`relative flex min-h-0 items-center justify-center ${padding} ${className}`}>
        <ImageSkeleton className="absolute inset-0 h-full w-full" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-h-0 items-center justify-center ${padding} ${getProductImageSurfaceClass(product, { hasImage: true })} ${className}`}
    >
      <SiteImage
        src={imageRef}
        alt=""
        fill
        imageVariant={imageVariant}
        wrapperClassName="absolute inset-0"
        className={imageClassName}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}
