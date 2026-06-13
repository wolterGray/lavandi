import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ZoomIn } from "lucide-react";
import { useImageSrc } from "../../hooks/useImageSrc";
import {
  getProductImageSurfaceClass,
  PLACEHOLDER_GRADIENTS,
} from "./cosmeticsShared";

const ZOOM_FACTOR = 2.4;
const LENS_SIZE = 112;
const ZOOM_WINDOW_SIZE = 220;
const CURSOR_GAP = 20;

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

function getZoomWindowPosition(clientX, clientY) {
  const viewportPadding = 12;
  let left = clientX + CURSOR_GAP;
  let top = clientY + CURSOR_GAP;

  if (left + ZOOM_WINDOW_SIZE > window.innerWidth - viewportPadding) {
    left = clientX - ZOOM_WINDOW_SIZE - CURSOR_GAP;
  }
  if (top + ZOOM_WINDOW_SIZE > window.innerHeight - viewportPadding) {
    top = clientY - ZOOM_WINDOW_SIZE - CURSOR_GAP;
  }

  return {
    left: clamp(left, viewportPadding, window.innerWidth - ZOOM_WINDOW_SIZE - viewportPadding),
    top: clamp(top, viewportPadding, window.innerHeight - ZOOM_WINDOW_SIZE - viewportPadding),
  };
}

/** Rossmann-style hover zoom — floating pane follows the cursor. */
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
  const [zoomWindow, setZoomWindow] = useState({ left: 0, top: 0 });
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
      setZoomWindow(getZoomWindowPosition(event.clientX, event.clientY));
      setZoomBackground({
        size: `${metrics.displayWidth * ZOOM_FACTOR}px ${metrics.displayHeight * ZOOM_FACTOR}px`,
        position: `${(relativeX / metrics.displayWidth) * 100}% ${(relativeY / metrics.displayHeight) * 100}%`,
      });
    },
    [canMagnify, imageLoaded, refreshMetrics],
  );

  const zoomPortal =
    canMagnify && active && imageSrc
      ? createPortal(
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-[120] overflow-hidden rounded-full border-2 border-gold/50 bg-card shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            style={{
              width: ZOOM_WINDOW_SIZE,
              height: ZOOM_WINDOW_SIZE,
              left: zoomWindow.left,
              top: zoomWindow.top,
              backgroundImage: `url(${imageSrc})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: zoomBackground.size,
              backgroundPosition: zoomBackground.position,
            }}
          />,
          document.body,
        )
      : null;

  return (
    <>
      <div className={`relative ${className}`}>
        <div
          ref={containerRef}
          className={`relative flex min-h-0 items-center justify-center overflow-hidden p-3 sm:p-4 ${surfaceClass} ${
            canMagnify && imageSrc && active ? "cursor-none" : canMagnify && imageSrc ? "cursor-crosshair" : ""
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
      </div>
      {zoomPortal}
    </>
  );
}
