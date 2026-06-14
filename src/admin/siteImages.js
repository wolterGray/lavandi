import { adminRu } from "./adminStrings";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export const IMAGE_REF_PREFIX = "dbimg:";

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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error(adminRu.media.uploadFailed));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error(adminRu.media.uploadFailed));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error(adminRu.media.uploadFailed));
    reader.readAsDataURL(file);
  });
}

export function toDataUrl(mimeType, dataBase64) {
  return `data:${mimeType};base64,${dataBase64}`;
}

export function isSiteImagesConfigured() {
  return isSupabaseConfigured && Boolean(supabase);
}

function toImageId(value) {
  if (!value || typeof value !== "string") return null;
  return parseImageRef(value) ?? value;
}

export async function deleteSiteImagesByIds(ids = []) {
  const uniqueIds = [...new Set(ids.map(toImageId).filter(Boolean))];
  if (!uniqueIds.length || !isSiteImagesConfigured() || !supabase) return 0;

  const { error } = await supabase.from("site_images").delete().in("id", uniqueIds);
  if (error) throw error;
  return uniqueIds.length;
}

export async function deleteSiteImageByRef(imageRef) {
  const id = parseImageRef(imageRef);
  if (!id) return false;
  await deleteSiteImagesByIds([id]);
  return true;
}

/** Remove DB rows not referenced anywhere in current CMS overrides. */
export async function cleanupOrphanedSiteImages(overrides = {}) {
  if (!isSiteImagesConfigured() || !supabase) return { removed: 0 };

  const referenced = new Set(collectImageRefsFromOverrides(overrides));
  const { data, error } = await supabase.from("site_images").select("id");
  if (error) throw error;

  const orphanIds = (data ?? []).map((row) => row.id).filter((id) => !referenced.has(id));
  if (!orphanIds.length) return { removed: 0 };

  await deleteSiteImagesByIds(orphanIds);
  return { removed: orphanIds.length };
}

export async function fetchSiteImagesCatalog({ folder, limit = 60 } = {}) {
  if (!isSiteImagesConfigured() || !supabase) return [];

  let query = supabase
    .from("site_images")
    .select("id, folder, mime_type, size_bytes, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (folder) {
    query = query.eq("folder", sanitizeFolder(folder));
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
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
  if (!isSiteImagesConfigured() || !supabase) return { bytes: 0, count: 0 };

  const { data, error } = await supabase.from("site_images").select("size_bytes");
  if (error) throw error;

  const rows = data ?? [];
  return {
    count: rows.length,
    bytes: rows.reduce((sum, row) => sum + (row.size_bytes ?? 0), 0),
  };
}

export async function saveSiteImageToDatabase(file, folder = "uploads", replaceRef = null) {
  if (!isSiteImagesConfigured() || !supabase) {
    throw new Error(adminRu.media.storageNotConfigured);
  }

  if (!file || !ALLOWED_TYPES.has(file.type)) {
    throw new Error(adminRu.media.invalidFileType);
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(adminRu.media.fileTooLarge);
  }

  const safeFolder = sanitizeFolder(folder);
  const id = `${safeFolder}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const dataBase64 = await fileToBase64(file);

  const { error } = await supabase.from("site_images").upsert({
    id,
    folder: safeFolder,
    mime_type: file.type,
    data_base64: dataBase64,
    size_bytes: file.size,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;

  const newRef = toImageRef(id);
  const oldId = parseImageRef(replaceRef);
  if (oldId && oldId !== id) {
    await deleteSiteImagesByIds([oldId]);
  }

  return newRef;
}

export async function fetchSiteImageRecord(id) {
  if (!isSiteImagesConfigured() || !supabase || !id) return null;

  const { data, error } = await supabase
    .from("site_images")
    .select("id, mime_type, data_base64")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.data_base64) return null;

  return {
    id: data.id,
    mimeType: data.mime_type,
    dataUrl: toDataUrl(data.mime_type, data.data_base64),
  };
}

export async function fetchSiteImagesMap(ids = []) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length || !isSiteImagesConfigured() || !supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("site_images")
    .select("id, mime_type, data_base64")
    .in("id", uniqueIds);

  if (error) throw error;

  return Object.fromEntries(
    (data ?? []).map((row) => [row.id, toDataUrl(row.mime_type, row.data_base64)])
  );
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

function resolveImageValue(value, imageMap) {
  if (!value || typeof value !== "string") return value;
  const id = parseImageRef(value);
  if (!id) return value;
  return imageMap[id] ?? value;
}

export function resolveContentImages(content, imageMap = {}) {
  if (!content || !Object.keys(imageMap).length) return content;

  const resolved = structuredClone(content);

  if (resolved.aboutImage) {
    resolved.aboutImage = resolveImageValue(resolved.aboutImage, imageMap);
  }

  if (Array.isArray(resolved.services)) {
    resolved.services = resolved.services.map((service) => ({
      ...service,
      img: resolveImageValue(service.img, imageMap),
    }));
  }

  if (Array.isArray(resolved.gallery)) {
    resolved.gallery = resolved.gallery.map((item) => ({
      ...item,
      src: resolveImageValue(item.src, imageMap),
    }));
  }

  if (Array.isArray(resolved.team)) {
    resolved.team = resolved.team.map((member) => ({
      ...member,
      img: resolveImageValue(member.img, imageMap),
    }));
  }

  if (Array.isArray(resolved.cosmetics)) {
    resolved.cosmetics = resolved.cosmetics.map((product) => {
      const images = Array.isArray(product.images)
        ? product.images.map((ref) => resolveImageValue(ref, imageMap))
        : product.images;
      const img = resolveImageValue(product.img, imageMap);
      const primary = images?.[0] ?? img;
      return {
        ...product,
        images: images ?? (primary ? [primary] : []),
        img: primary,
      };
    });
  }

  if (resolved.locales && typeof resolved.locales === "object") {
    Object.values(resolved.locales).forEach((locale) => {
      const items = locale?.announcements?.items;
      if (!Array.isArray(items)) return;
      items.forEach((slide) => {
        if (slide?.img) slide.img = resolveImageValue(slide.img, imageMap);
      });
    });
  }

  return resolved;
}
