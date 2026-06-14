import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SiteImage from "../../ui/SiteImage";
import { IMAGE_VARIANT } from "../../admin/siteImages";
import CosmeticProductImageMagnifier from "./CosmeticProductImageMagnifier";
import { getProductImageSurfaceClass, getProductImages } from "./cosmeticsShared";

function GalleryThumbnail({ product, imageRef, active, onSelect, index, total }) {
  const surfaceClass = imageRef
    ? getProductImageSurfaceClass(product, { hasImage: true })
    : "bg-surface";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={`${index + 1} / ${total}`}
      onClick={onSelect}
      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-card border transition duration-300 ease-luxury sm:h-16 sm:w-16 ${
        active
          ? "border-gold/50 ring-1 ring-gold/30"
          : "border-border/40 opacity-75 hover:border-gold/30 hover:opacity-100"
      }`}
    >
      <span className={`relative flex h-full w-full items-center justify-center p-1 ${surfaceClass}`}>
        {imageRef ? (
          <SiteImage
            src={imageRef}
            alt=""
            fill
            imageVariant={IMAGE_VARIANT.thumb}
            wrapperClassName="absolute inset-0"
            className="object-contain object-center"
            loading="lazy"
          />
        ) : (
          <span className="font-display text-xs text-milk/30">{product.initials}</span>
        )}
      </span>
    </button>
  );
}

export default function CosmeticProductGallery({ product, className = "" }) {
  const images = getProductImages(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));
  const activeImage = images[safeIndex];

  if (images.length <= 1) {
    return (
      <CosmeticProductImageMagnifier
        product={product}
        imageRef={activeImage}
        className={className}
      />
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="flex shrink-0 flex-col gap-2" role="tablist" aria-orientation="vertical">
        {images.map((imageRef, index) => (
          <GalleryThumbnail
            key={`${imageRef}-${index}`}
            product={product}
            imageRef={imageRef}
            index={index}
            total={images.length}
            active={index === safeIndex}
            onSelect={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <div className={`relative min-w-0 flex-1 ${className}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            <CosmeticProductImageMagnifier
              product={product}
              imageRef={activeImage}
              className="h-full min-h-[360px] w-full sm:min-h-[480px]"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
