import { useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn } from "lucide-react";
import { useImageSrc } from "../../hooks/useImageSrc";
import {
  getProductImageSurfaceClass,
  PLACEHOLDER_GRADIENTS,
} from "./cosmeticsShared";

const ZOOM_FACTOR = 2.4;
const LENS_SIZE = 112;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getContainMetrics(container, img) {
  if (!container || !img?.naturalWidth) return null;

  const width = container.clientWidth;
  const height = container.clientHeight;
  const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
  const displayWidth = img.naturalWidth * scale;
  const displayHeight = img.naturalHeight * scale;

  return {
    displayWidth,
    displayHeight,
    offsetX: (width - displayWidth) / 2,
    offsetY: (height - displayHeight) / 2,
  };
}

/** Rossmann-style hover zoom — product detail page only. */
export default function CosmeticProductImageMagnifier({
  product,
  className = "",
  imageClassName = "max-h-[min(72vh,560px)] h-full w-full object-contain object-center",
  initialsClassName = "font-display text-6xl font-semibold tracking-[0.08em] text-milk/25",
}) {
  const imageSrc = useImageSrc(product.img);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canMagnify, setCanMagnify] = useState(false);
  const [active, setActive] = useState(false);
  const [lens, setLens] = useState({ x: 0, y: 0 });
  const [zoomBackground, setZoomBackground] = useState({
    size: "100% 100%",
    position: "50% 50%",
  });

  const gradient = PLACEHOLDER_GRADIENTS[product.accent % PLACEHOLDER_GRADIENTS.length];
  const surfaceClass = imageSrc
    ? getProductImageSurfaceClass(product, { hasImage: true })
    : gradient;

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanMagnify(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const refreshMetrics = useCallback(() => {
    return getContainMetrics(containerRef.current, imgRef.current);
  }, []);

  useEffect(() => {
    if (!canMagnify || !imageLoaded) return undefined;

    const handleResize = () => setActive(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canMagnify, imageLoaded]);

  const handlePointerMove = useCallback(
    (event) => {
      if (!canMagnify || !imageLoaded) return;

      const container = containerRef.current;
      const metrics = refreshMetrics();
      if (!container || !metrics) return;

      const bounds = container.getBoundingClientRect();
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;
      const relativeX = pointerX - metrics.offsetX;
      const relativeY = pointerY - metrics.offsetY;

      const insideImage =
        relativeX >= 0 &&
        relativeY >= 0 &&
        relativeX <= metrics.displayWidth &&
        relativeY <= metrics.displayHeight;

      if (!insideImage) {
        setActive(false);
        return;
      }

      const lensRadius = LENS_SIZE / 2;
      const lensX = clamp(
        pointerX,
        metrics.offsetX + lensRadius,
        metrics.offsetX + metrics.displayWidth - lensRadius,
      );
      const lensY = clamp(
        pointerY,
        metrics.offsetY + lensRadius,
        metrics.offsetY + metrics.displayHeight - lensRadius,
      );

      setActive(true);
      setLens({ x: lensX, y: lensY });
      setZoomBackground({
        size: `${metrics.displayWidth * ZOOM_FACTOR}px ${metrics.displayHeight * ZOOM_FACTOR}px`,
        position: `${(relativeX / metrics.displayWidth) * 100}% ${(relativeY / metrics.displayHeight) * 100}%`,
      });
    },
    [canMagnify, imageLoaded, refreshMetrics],
  );

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className={`relative flex min-h-0 items-center justify-center overflow-hidden p-3 sm:p-4 ${surfaceClass} ${
          canMagnify && imageSrc ? "cursor-crosshair" : ""
        }`}
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setActive(false)}
      >
        {imageSrc ? (
          <>
            <img
              ref={imgRef}
              src={imageSrc}
              alt=""
              className={imageClassName}
              loading="eager"
              decoding="async"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
            />
            {canMagnify && imageLoaded ? (
              <>
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 bg-void/55 text-gold transition-opacity duration-200 ${
                    active ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <ZoomIn className="h-4 w-4" strokeWidth={2} />
                </div>
                {active ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute rounded-full border-2 border-gold/70 bg-gold/10 shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset]"
                    style={{
                      width: LENS_SIZE,
                      height: LENS_SIZE,
                      left: lens.x - LENS_SIZE / 2,
                      top: lens.y - LENS_SIZE / 2,
                    }}
                  />
                ) : null}
              </>
            ) : null}
          </>
        ) : (
          <span className={initialsClassName}>{product.initials}</span>
        )}
      </div>

      {canMagnify && active && imageSrc ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[calc(100%+14px)] top-0 z-20 hidden h-full min-h-[280px] w-[min(44vw,380px)] overflow-hidden rounded-card border border-gold/30 bg-card shadow-[0_24px_60px_rgba(0,0,0,0.35)] xl:block"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: zoomBackground.size,
            backgroundPosition: zoomBackground.position,
          }}
        />
      ) : null}
    </div>
  );
}
