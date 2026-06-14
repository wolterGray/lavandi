const SKIP_TYPES = new Set(["image/svg+xml", "image/gif"]);

const FOLDER_PRESETS = {
  cosmetics: { maxWidth: 960, maxHeight: 960, quality: 0.8 },
  uploads: { maxWidth: 1200, maxHeight: 1200, quality: 0.82 },
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

/**
 * Resize and re-encode uploads as WebP before storing in site_images.
 * Skips vector/animated formats and files that are already small enough.
 */
export async function compressImageForUpload(file, folder = "uploads") {
  if (!file || SKIP_TYPES.has(file.type)) return file;

  const preset = getPreset(folder);
  const { maxWidth, maxHeight, quality } = preset;

  if (file.type === "image/webp" && file.size <= 350_000) return file;

  let source = null;
  let width = 0;
  let height = 0;

  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      width = bitmap.width;
      height = bitmap.height;
      source = bitmap;
    } else {
      const image = await loadImageElement(file);
      width = image.naturalWidth;
      height = image.naturalHeight;
      source = image;
    }
  } catch {
    return file;
  }

  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  if (scale >= 1 && file.type === "image/webp" && file.size <= 700_000) {
    source.close?.();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    source.close?.();
    return file;
  }

  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  source.close?.();

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });

  if (!blob) return file;
  if (blob.size >= file.size && file.type === "image/webp") return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
