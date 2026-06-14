import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useImageSrc } from "../hooks/useImageSrc";

export function ImageSkeleton({ className = "" }) {
  return <div aria-hidden="true" className={`image-skeleton ${className}`} />;
}

export default function SiteImage({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  imgClassName,
  skeletonClassName = "",
  loading = "lazy",
  fetchPriority,
  decoding = "async",
  imgRef,
  onLoad,
  onError,
  fill = false,
  showSkeleton = true,
  ...rest
}) {
  const { src: resolvedSrc, ready: srcReady } = useImageSrc(src);
  const [loaded, setLoaded] = useState(false);
  const localImgRef = useRef(null);

  const pending =
    showSkeleton &&
    Boolean(src) &&
    (!srcReady || (Boolean(resolvedSrc) && !loaded));

  useEffect(() => {
    setLoaded(false);
  }, [resolvedSrc, src]);

  const markLoadedIfComplete = () => {
    const node = localImgRef.current;
    if (node?.complete && node.naturalWidth > 0) {
      setLoaded(true);
    }
  };

  useLayoutEffect(() => {
    markLoadedIfComplete();
  }, [resolvedSrc]);

  const setImageRef = (node) => {
    localImgRef.current = node;
    if (typeof imgRef === "function") {
      imgRef(node);
    } else if (imgRef) {
      imgRef.current = node;
    }
    markLoadedIfComplete();
  };

  const wrapperClasses = fill
    ? `absolute inset-0 overflow-hidden ${wrapperClassName}`
    : `relative overflow-hidden ${wrapperClassName}`;

  const imageClasses = fill
    ? `absolute inset-0 h-full w-full ${imgClassName || className}`
    : imgClassName || className;

  const handleLoad = (event) => {
    setLoaded(true);
    onLoad?.(event);
  };

  const handleError = (event) => {
    setLoaded(true);
    onError?.(event);
  };

  return (
    <div className={wrapperClasses}>
      {pending ? <ImageSkeleton className={`absolute inset-0 ${skeletonClassName}`} /> : null}
      {resolvedSrc ? (
        <img
          ref={setImageRef}
          src={resolvedSrc}
          alt={alt}
          className={`${imageClasses} transform-gpu transition-[opacity,transform] duration-700 ease-luxury ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding={decoding}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      ) : null}
    </div>
  );
}
