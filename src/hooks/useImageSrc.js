import { useEffect, useState } from "react";
import {
  fetchSiteImageRecord,
  isImageRef,
  parseImageRef,
} from "../admin/siteImages";

export function useImageSrc(value) {
  const [src, setSrc] = useState(() => (isImageRef(value) ? "" : value ?? ""));

  useEffect(() => {
    if (!value) {
      setSrc("");
      return undefined;
    }

    if (!isImageRef(value)) {
      setSrc(value);
      return undefined;
    }

    let cancelled = false;

    fetchSiteImageRecord(parseImageRef(value))
      .then((record) => {
        if (!cancelled) setSrc(record?.dataUrl ?? "");
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  return src;
}
