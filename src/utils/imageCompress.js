const SKIP_TYPES = new Set(["image/svg+xml", "image/gif"]);

const FOLDER_PRESETS = {
  cosmetics: { maxWidth: 1800, maxHeight: 1800, quality: 0.86, maxBytes: 420 * 1024, thumb: 480, thumbQuality: 0.76 },
  gallery: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
    maxBytes: 420 * 1024,
    thumb: 480,
    thumbQuality: 0.76,
  },
  services: { maxWidth: 1600, maxHeight: 2000, quality: 0.85, maxBytes: 420 * 1024, thumb: 480, thumbQuality: 0.76 },
  team: { maxWidth: 1200, maxHeight: 1400, quality: 0.85, maxBytes: 400 * 1024, thumb: 400, thumbQuality: 0.76 },
  uploads: { maxWidth: 1800, maxHeight: 1800, quality: 0.85, maxBytes: 420 * 1024, thumb: 480, thumbQuality: 0.76 },
};

function getPreset(folder = "uploads") {
  const key = String(folder ?? "")
    .split("/")[0]
    .toLowerCase();
  return FOLDER_PRESETS[key] ?? FOLDER_PRESETS.uploads;
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image decode failed"));
    };
    image.src = url;
  });
}

async function loadImageSource(file) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      draw(ctx, width, height) {
        ctx.drawImage(bitmap, 0, 0, width, height);
      },
      close() {
        bitmap.close?.();
      },
      width: bitmap.width,
      height: bitmap.height,
    };
  }

  const image = await loadImageElement(file);
  return {
    draw(ctx, width, height) {
      ctx.drawImage(image, 0, 0, width, height);
    },
    close() {},
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

async function renderWebpBlob(source, maxWidth, maxHeight, quality) {
  const scale = Math.min(1, maxWidth / source.width, maxHeight / source.height);
  const targetWidth = Math.max(1, Math.round(source.width * scale));
  const targetHeight = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  source.draw(context, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });
}

async function renderWebpFile(file, folder, { thumb = false } = {}) {
  if (!file || SKIP_TYPES.has(file.type)) return file;

  const preset = getPreset(folder);
  const maxWidth = thumb ? preset.thumb : preset.maxWidth;
  const maxHeight = thumb ? preset.thumb : preset.maxHeight;
  const quality = thumb ? preset.thumbQuality : preset.quality;
  const maxBytes = thumb ? null : preset.maxBytes;

  let source;
  try {
    source = await loadImageSource(file);
  } catch {
    return file;
  }

  let targetWidth = maxWidth;
  let targetHeight = maxHeight;
  let targetQuality = quality;
  let blob = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    blob = await renderWebpBlob(source, targetWidth, targetHeight, targetQuality);
    if (!blob || !maxBytes || blob.size <= maxBytes) break;
    targetWidth = Math.max(640, Math.round(targetWidth * 0.82));
    targetHeight = Math.max(640, Math.round(targetHeight * 0.82));
    targetQuality = Math.max(0.55, targetQuality - 0.08);
  }

  source.close();
  if (!blob) return file;
  if (!thumb && blob.size >= file.size && file.type === "image/webp") return file;

  const suffix = thumb ? "-thumb" : "";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}${suffix}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

export async function compressImageForUpload(file, folder = "uploads") {
  if (!file || SKIP_TYPES.has(file.type)) return file;
  const preset = getPreset(folder);
  const maxBytes = preset.maxBytes || 420 * 1024;
  if (file.size <= maxBytes && file.type === "image/webp") return file;
  return renderWebpFile(file, folder, { thumb: false });
}

export async function compressImageThumbForUpload(file, folder = "uploads") {
  if (!file || SKIP_TYPES.has(file.type)) return null;
  return renderWebpFile(file, folder, { thumb: true });
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Read failed"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Read failed"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

function base64ToFile(dataBase64, mimeType, name = "image") {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], name, { type: mimeType });
}

/**
 * Re-encode a stored site_images row (full + catalog thumb).
 */
export async function recompressStoredImageRow(row) {
  if (!row?.data_base64 || SKIP_TYPES.has(row.mime_type)) {
    return { changed: false, row };
  }

  const folder = row.folder ?? "uploads";
  const beforeBytes = (row.size_bytes ?? 0) + (row.thumb_size_bytes ?? 0);
  const sourceFile = base64ToFile(row.data_base64, row.mime_type, row.id);

  const fullFile = await compressImageForUpload(sourceFile, folder);
  const thumbFile = await compressImageThumbForUpload(fullFile, folder);

  const data_base64 = await fileToBase64(fullFile);
  const thumb_base64 = thumbFile ? await fileToBase64(thumbFile) : null;

  const next = {
    mime_type: fullFile.type,
    data_base64,
    size_bytes: fullFile.size,
    thumb_mime_type: thumbFile?.type ?? null,
    thumb_base64,
    thumb_size_bytes: thumbFile?.size ?? null,
  };

  const afterBytes = next.size_bytes + (next.thumb_size_bytes ?? 0);
  const changed =
    row.mime_type !== next.mime_type ||
    !row.thumb_base64 ||
    row.data_base64 !== next.data_base64 ||
    row.thumb_base64 !== next.thumb_base64 ||
    (row.size_bytes ?? 0) > next.size_bytes + 20_000;

  return {
    changed,
    savedBytes: Math.max(0, beforeBytes - afterBytes),
    ...next,
  };
}
