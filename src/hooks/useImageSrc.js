import { useContext, useEffect, useMemo, useState } from "react";
import { ContentContext } from "../context/ContentProvider";
import {
  fetchSiteImageRecord,
  getCachedImageDataUrl,
  isImageRef,
  parseImageRef,
} from "../admin/siteImages";

const EMPTY_STATE = { src: "", ready: true };
const IMAGE_FETCH_TIMEOUT_MS = 10000;

export function useImageSrc(value) {
  const ctx = useContext(ContentContext);
  const cacheVersion = ctx?.imageCacheVersion ?? 0;
  const prefetched = useMemo(
    () => ctx?.getImageDataUrl?.(value) ?? getCachedImageDataUrl(parseImageRef(value) ?? "") ?? "",
    [ctx, value, cacheVersion],
  );

  const [state, setState] = useState(() => {
    if (!value) return EMPTY_STATE;
    if (!isImageRef(value)) return { src: value, ready: true };
    if (prefetched) return { src: prefetched, ready: true };
    return { src: "", ready: false };
  });

  useEffect(() => {
    if (!value) {
      setState(EMPTY_STATE);
      return undefined;
    }

    if (!isImageRef(value)) {
      setState({ src: value, ready: true });
      return undefined;
    }

    const cached =
      ctx?.getImageDataUrl?.(value) ??
      getCachedImageDataUrl(parseImageRef(value) ?? "") ??
      "";

    if (cached) {
      setState({ src: cached, ready: true });
      return undefined;
    }

    let cancelled = false;
    setState({ src: "", ready: false });

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setState(EMPTY_STATE);
    }, IMAGE_FETCH_TIMEOUT_MS);

    fetchSiteImageRecord(parseImageRef(value))
      .then((record) => {
        if (!cancelled) {
          setState({ src: record?.dataUrl ?? "", ready: true });
        }
      })
      .catch(() => {
        if (!cancelled) setState(EMPTY_STATE);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [value, cacheVersion, ctx]);

  return state;
}

/** @deprecated use destructuring from useImageSrc return value */
export function useImageSrcString(value) {
  return useImageSrc(value).src;
}
