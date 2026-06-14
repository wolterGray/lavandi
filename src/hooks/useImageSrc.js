import { useContext, useEffect, useState } from "react";
import { ContentContext } from "../context/ContentProvider";
import {
  fetchSiteImageRecord,
  isImageRef,
  parseImageRef,
} from "../admin/siteImages";

const EMPTY_STATE = { src: "", ready: true };

export function useImageSrc(value) {
  const ctx = useContext(ContentContext);
  const prefetched = ctx?.getImageDataUrl?.(value) ?? "";

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

    if (prefetched) {
      setState({ src: prefetched, ready: true });
      return undefined;
    }

    let cancelled = false;
    setState({ src: "", ready: false });

    fetchSiteImageRecord(parseImageRef(value))
      .then((record) => {
        if (!cancelled) {
          setState({ src: record?.dataUrl ?? "", ready: true });
        }
      })
      .catch(() => {
        if (!cancelled) setState(EMPTY_STATE);
      });

    return () => {
      cancelled = true;
    };
  }, [value, prefetched]);

  return state;
}

/** @deprecated use destructuring from useImageSrc return value */
export function useImageSrcString(value) {
  return useImageSrc(value).src;
}
