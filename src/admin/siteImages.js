import { adminRu } from "./adminStrings";
import { supabase } from "../lib/supabase";
import {
  cmsBackendPublicRequest,
  cmsBackendRequest,
  hasCmsBackendSession,
  isCmsBackendConfigured,
} from "./cmsBackend";
import {
  compressImageForUpload,
  compressImageThumbForUpload,
  fileToBase64,
  recompressStoredImageRow,
} from "../utils/imageCompress";
import {
  clearCachedImageDataUrl as clearIdbImage,
  readCachedImageDataUrl,
  writeCachedImageDataUrl,
} from "../utils/imageDbCache";

export const IMAGE_REF_PREFIX = "dbimg:";
export const IMAGE_VARIANT = {
  full: "full",
  thumb: "thumb",
};

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const IMAGE_FIELD_KEYS = new Set(["img", "src", "aboutImage"]);

function sanitizeFolder(folder = "uploads") {
  return folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") || "uploads";
}

export function isImageRef(value) {
  return typeof value === "string" && value.startsWith(IMAGE_REF_PREFIX);
}

export function parseImageRef(value) {
  if (!isImageRef(value)) return null;
  return value.slice(IMAGE_REF_PREFIX.length);
}

export function toImageRef(id) {
  return `${IMAGE_REF_PREFIX}${id}`;
}



export function toDataUrl(mimeType, dataBase64) {
  return `data:${mimeType};base64,${dataBase64}`;
}

const imageMemoryCache = new Map();

function cacheKey(id, variant = IMAGE_VARIANT.full) {
  return `${id}:${variant}`;
}

export function getCachedImageDataUrl(id, variant = IMAGE_VARIANT.full) {
  if (!id) return null;
  return imageMemoryCache.get(cacheKey(id, variant)) ?? null;
}

function setCachedImageDataUrl(id, variant, dataUrl) {
  if (!id || !dataUrl) return;
  imageMemoryCache.set(cacheKey(id, variant), dataUrl);
  void writeCachedImageDataUrl(cacheKey(id, variant), dataUrl);
}

export function clearImageCacheForId(id) {
  if (!id) return;
  imageMemoryCache.delete(cacheKey(id, IMAGE_VARIANT.full));
  imageMemoryCache.delete(cacheKey(id, IMAGE_VARIANT.thumb));
  void clearIdbImage(cacheKey(id, IMAGE_VARIANT.full));
  void clearIdbImage(cacheKey(id, IMAGE_VARIANT.thumb));
}

function rowToDataUrl(row, variant = IMAGE_VARIANT.full) {
  if (variant === IMAGE_VARIANT.thumb && row?.thumb_base64) {
    return toDataUrl(row.thumb_mime_type || "image/webp", row.thumb_base64);
  }
  if (row?.data_base64) {
    return toDataUrl(row.mime_type, row.data_base64);
  }
  return null;
}

function cacheImageRow(row, variant = IMAGE_VARIANT.full) {
  const dataUrl = rowToDataUrl(row, variant);
  if (!row?.id || !dataUrl) return null;
  setCachedImageDataUrl(row.id, variant, dataUrl);
  if (variant === IMAGE_VARIANT.thumb && row.thumb_base64 && row.data_base64) {
    const fullUrl = rowToDataUrl(row, IMAGE_VARIANT.full);
    if (fullUrl) setCachedImageDataUrl(row.id, IMAGE_VARIANT.full, fullUrl);
  }
  return dataUrl;
}

const shouldUseCmsBackend = () => isCmsBackendConfigured && hasCmsBackendSession();

export function isSiteImagesConfigured() {
  return isCmsBackendConfigured;
}

function toImageId(value) {
  if (!value || typeof value !== "string") return null;
  return parseImageRef(value) ?? value;
}

export async function deleteSiteImagesByIds(ids = []) {
  const uniqueIds = [...new Set(ids.map(toImageId).filter(Boolean))];
  if (!uniqueIds.length || !isSiteImagesConfigured()) return 0;

  if (!shouldUseCmsBackend()) return 0;

  const data = await cmsBackendRequest("/api/site-images", {
    method: "DELETE",
    body: JSON.stringify({ ids: uniqueIds }),
    label: "Delete site images",
  });
  uniqueIds.forEach(clearImageCacheForId);
  return data?.removed ?? uniqueIds.length;
}

export async function deleteSiteImageByRef(imageRef) {
  if (!imageRef || typeof imageRef !== "string") return false;

  if (imageRef.startsWith("https://") && imageRef.includes("/site-images/")) {
    try {
      const bucketPath = imageRef.split("/storage/v1/object/public/site-images/")[1];
      if (bucketPath && supabase) {
        const { error } = await supabase.storage.from("site-images").remove([bucketPath]);
        return !error;
      }
    } catch {
      return false;
    }
  }

  const id = parseImageRef(imageRef);
  if (!id) return false;
  await deleteSiteImagesByIds([id]);
  return true;
}

/** Remove DB rows not referenced anywhere in current CMS overrides. */
export async function cleanupOrphanedSiteImages(overrides = {}) {
  if (!isSiteImagesConfigured()) return { removed: 0 };

  const referenced = new Set(collectImageRefsFromOverrides(overrides));
  let data = [];

  if (!shouldUseCmsBackend()) return { removed: 0 };

  data = await cmsBackendRequest("/api/site-images/orphans", {
    label: "Fetch site image ids",
  });

  const orphanIds = (data ?? []).map((row) => row.id).filter((id) => !referenced.has(id));
  if (!orphanIds.length) return { removed: 0 };

  await deleteSiteImagesByIds(orphanIds);
  return { removed: orphanIds.length };
}

export async function fetchSiteImagesCatalog({ folder, limit = 60 } = {}) {
  if (!isSiteImagesConfigured()) return [];

  let rows = [];

  if (!shouldUseCmsBackend()) return [];

  const params = new URLSearchParams({ limit: String(limit) });
  if (folder) params.set("folder", sanitizeFolder(folder));
  rows = await cmsBackendRequest(`/api/site-images?${params.toString()}`, {
    label: "Fetch site images catalog",
  });
  const imageMap = await fetchSiteImagesMap(rows.map((row) => row.id));

  return rows.map((row) => ({
    id: row.id,
    folder: row.folder,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes ?? 0,
    updatedAt: row.updated_at,
    ref: toImageRef(row.id),
    dataUrl: imageMap[row.id] ?? null,
  }));
}

export async function fetchSiteImagesStorageUsage() {
  if (!isSiteImagesConfigured()) return { bytes: 0, count: 0 };

  if (!shouldUseCmsBackend()) return { bytes: 0, count: 0 };

  return cmsBackendRequest("/api/site-images/storage-usage", {
    label: "Fetch site images storage usage",
  });
}

export async function saveSiteImageToDatabase(file, folder = "uploads", replaceRef = null) {
  if (!isSiteImagesConfigured() && !supabase) {
    throw new Error(adminRu.media.storageNotConfigured);
  }

  if (!file || !ALLOWED_TYPES.has(file.type)) {
    throw new Error(adminRu.media.invalidFileType);
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error(adminRu.media.fileTooLarge);
  }

  const safeFolder = sanitizeFolder(folder);
  const prepared = await compressImageForUpload(file, safeFolder);
  const thumb = await compressImageThumbForUpload(file, safeFolder);
  const id = `${safeFolder}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const dataBase64 = await fileToBase64(prepared);
  const thumbBase64 = thumb ? await fileToBase64(thumb) : null;

  const payload = {
    id,
    folder: safeFolder,
    mime_type: prepared.type,
    data_base64: dataBase64,
    size_bytes: prepared.size,
    thumb_mime_type: thumb?.type ?? null,
    thumb_base64: thumbBase64,
    thumb_size_bytes: thumb?.size ?? null,
    updated_at: new Date().toISOString(),
  };

  let saved = false;

  if (shouldUseCmsBackend()) {
    try {
      await cmsBackendRequest(`/api/site-images/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        label: "Save site image",
      });
      saved = true;
    } catch {
      // Fall back to direct Supabase if CMS backend request fails or times out
    }
  }

  if (!saved) {
    if (!supabase) throw new Error(adminRu.media.storageNotConfigured);
    const { error } = await supabase.from("site_images").upsert(payload);

    if (error) throw error;
  }

  const newRef = toImageRef(id);

  const oldId = parseImageRef(replaceRef);
  if (oldId) {
    try {
      await deleteSiteImagesByIds([oldId]);
    } catch {
      // ignore delete errors
    }
  }

  return newRef;
}

export async function fetchSiteImageRecord(id, { variant = IMAGE_VARIANT.full } = {}) {
  if (!id) return null;

  const cached = getCachedImageDataUrl(id, variant);
  if (cached) {
    return { id, dataUrl: cached, mimeType: cached.slice(5, cached.indexOf(";")) };
  }

  const idbCached = await readCachedImageDataUrl(cacheKey(id, variant));
  if (idbCached) {
    setCachedImageDataUrl(id, variant, idbCached);
    return { id, dataUrl: idbCached, mimeType: idbCached.slice(5, idbCached.indexOf(";")) };
  }

  if (!isSiteImagesConfigured()) return null;

  let data = null;

  const rows = await cmsBackendPublicRequest(`/api/public/site-images?ids=${encodeURIComponent(id)}`, {
    label: "Fetch site image",
  });
  data = rows?.[0] ?? null;

  if (!data) return null;

  const dataUrl = cacheImageRow(data, variant);
  if (!dataUrl) return null;

  return {
    id: data.id,
    mimeType:
      variant === IMAGE_VARIANT.thumb && data.thumb_base64
        ? data.thumb_mime_type || "image/webp"
        : data.mime_type,
    dataUrl,
  };
}

export async function fetchSiteImagesMap(ids = [], { variant = IMAGE_VARIANT.full } = {}) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const result = {};
  const missing = [];

  await Promise.all(
    uniqueIds.map(async (id) => {
      const cached = getCachedImageDataUrl(id, variant);
      if (cached) {
        result[id] = cached;
        return;
      }
      const idbCached = await readCachedImageDataUrl(cacheKey(id, variant));
      if (idbCached) {
        setCachedImageDataUrl(id, variant, idbCached);
        result[id] = idbCached;
        return;
      }
      missing.push(id);
    }),
  );

  if (!missing.length || !isSiteImagesConfigured()) {
    return result;
  }

  let data = [];

  data = await cmsBackendPublicRequest(`/api/public/site-images?ids=${encodeURIComponent(missing.join(","))}`, {
    label: "Fetch site images map",
  });

  (data ?? []).forEach((row) => {
    const dataUrl = cacheImageRow(row, variant);
    if (dataUrl) result[row.id] = dataUrl;
  });

  return result;
}

const OPTIMIZE_FETCH_CHUNK = 4;

export async function optimizeReferencedSiteImages(overrides = {}, { onProgress } = {}) {
  if (!isSiteImagesConfigured()) {
    throw new Error(adminRu.media.storageNotConfigured);
  }

  const ids = collectImageRefsFromOverrides(overrides);
  if (!ids.length) {
    return { optimized: 0, skipped: 0, savedBytes: 0, total: 0 };
  }

  let optimized = 0;
  let skipped = 0;
  let savedBytes = 0;
  let done = 0;

  for (let index = 0; index < ids.length; index += OPTIMIZE_FETCH_CHUNK) {
    const chunk = ids.slice(index, index + OPTIMIZE_FETCH_CHUNK);
    let data = [];

    if (!shouldUseCmsBackend()) throw new Error(adminRu.media.storageNotConfigured);

    data = await cmsBackendRequest(`/api/site-images?ids=${encodeURIComponent(chunk.join(","))}`, {
      label: "Fetch site images for optimization",
    });

    for (const row of data ?? []) {
      const result = await recompressStoredImageRow(row);
      done += 1;

      if (!result.changed) {
        skipped += 1;
        onProgress?.({ done, total: ids.length, optimized, skipped, savedBytes });
        continue;
      }

      const payload = {
        mime_type: result.mime_type,
        data_base64: result.data_base64,
        size_bytes: result.size_bytes,
        thumb_mime_type: result.thumb_mime_type,
        thumb_base64: result.thumb_base64,
        thumb_size_bytes: result.thumb_size_bytes,
        updated_at: new Date().toISOString(),
      };

      await cmsBackendRequest(`/api/site-images/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        label: "Optimize site image",
      });

      clearImageCacheForId(row.id);
      optimized += 1;
      savedBytes += result.savedBytes ?? 0;
      onProgress?.({ done, total: ids.length, optimized, skipped, savedBytes });
    }
  }

  return { optimized, skipped, savedBytes, total: ids.length };
}

export function collectImageRefs(value, refs = new Set()) {
  if (typeof value === "string") {
    const id = parseImageRef(value);
    if (id) refs.add(id);
    return refs;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectImageRefs(item, refs));
    return refs;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, nested]) => {
      if (IMAGE_FIELD_KEYS.has(key) && typeof nested === "string") {
        const id = parseImageRef(nested);
        if (id) refs.add(id);
        return;
      }
      collectImageRefs(nested, refs);
    });
  }

  return refs;
}

export function collectImageRefsFromOverrides(overrides = {}) {
  return [...collectImageRefs(overrides)];
}

export function resolveImageValue(value, imageMap) {
  if (!value || typeof value !== "string") return value;
  const id = parseImageRef(value);
  if (!id) return value;
  return imageMap[id] ?? getCachedImageDataUrl(id, IMAGE_VARIANT.full) ?? value;
}

function resolveCosmeticProductImages(product, imageMap) {
  const images = Array.isArray(product.images)
    ? product.images.map((ref) => resolveImageValue(ref, imageMap))
    : product.images;
  const img = resolveImageValue(product.img, imageMap);
  const primary = images?.[0] ?? img;

  if (
    primary === product.img &&
    images === product.images &&
    (!Array.isArray(images) || images.every((ref, index) => ref === product.images?.[index]))
  ) {
    return product;
  }

  return {
    ...product,
    images: images ?? (primary ? [primary] : []),
    img: primary,
  };
}

export function resolveContentImages(content, imageMap = {}) {
  if (!content) return content;

  let next = content;
  let changed = false;

  const patchRootField = (field) => {
    const resolved = resolveImageValue(next[field], imageMap);
    if (resolved === next[field]) return;
    if (!changed) {
      next = { ...next };
      changed = true;
    }
    next[field] = resolved;
  };

  patchRootField("aboutImage");

  if (Array.isArray(next.services)) {
    const services = next.services.map((service) => {
      const img = resolveImageValue(service.img, imageMap);
      return img === service.img ? service : { ...service, img };
    });
    if (services.some((service, index) => service !== next.services[index])) {
      if (!changed) {
        next = { ...next };
        changed = true;
      }
      next.services = services;
    }
  }

  if (Array.isArray(next.gallery)) {
    const gallery = next.gallery.map((item) => {
      const src = resolveImageValue(item.src, imageMap);
      return src === item.src ? item : { ...item, src };
    });
    if (gallery.some((item, index) => item !== next.gallery[index])) {
      if (!changed) {
        next = { ...next };
        changed = true;
      }
      next.gallery = gallery;
    }
  }

  if (Array.isArray(next.team)) {
    const team = next.team.map((member) => {
      const img = resolveImageValue(member.img, imageMap);
      return img === member.img ? member : { ...member, img };
    });
    if (team.some((member, index) => member !== next.team[index])) {
      if (!changed) {
        next = { ...next };
        changed = true;
      }
      next.team = team;
    }
  }

  if (Array.isArray(next.cosmetics)) {
    const cosmetics = next.cosmetics.map((product) =>
      resolveCosmeticProductImages(product, imageMap),
    );
    if (cosmetics.some((product, index) => product !== next.cosmetics[index])) {
      if (!changed) {
        next = { ...next };
        changed = true;
      }
      next.cosmetics = cosmetics;
    }
  }

  if (next.locales && typeof next.locales === "object") {
    let localesChanged = false;
    const locales = { ...next.locales };

    Object.entries(locales).forEach(([lang, locale]) => {
      const items = locale?.announcements?.items;
      if (!Array.isArray(items)) return;

      const nextItems = items.map((slide) => {
        if (!slide?.img) return slide;
        const img = resolveImageValue(slide.img, imageMap);
        return img === slide.img ? slide : { ...slide, img };
      });

      if (nextItems.some((slide, index) => slide !== items[index])) {
        localesChanged = true;
        locales[lang] = {
          ...locale,
          announcements: {
            ...locale.announcements,
            items: nextItems,
          },
        };
      }
    });

    if (localesChanged) {
      if (!changed) {
        next = { ...next };
        changed = true;
      }
      next.locales = locales;
    }
  }

  return changed ? next : content;
}
