import cosmeticsBase from "../../data/cosmetics.json";

/** Warm studio sweep for PNG/WebP product shots without a baked-in background. */
export const PRODUCT_TRANSPARENT_BG =
  "bg-[linear-gradient(165deg,#FAF7F2_0%,#F3EDE4_42%,#E9E0D5_100%)] ring-1 ring-black/5";

export const PRODUCT_OPAQUE_BG = "bg-void";

export function usesTransparentProductPhoto(product) {
  return product?.transparentPhoto !== false;
}

export function getProductImageSurfaceClass(product, { hasImage = true } = {}) {
  if (!hasImage) return "";
  return usesTransparentProductPhoto(product) ? PRODUCT_TRANSPARENT_BG : PRODUCT_OPAQUE_BG;
}

export const PLACEHOLDER_GRADIENTS = [
  "bg-[radial-gradient(ellipse_at_25%_15%,rgba(184,149,107,0.28)_0%,transparent_52%),radial-gradient(ellipse_at_85%_90%,rgba(12,10,16,0.75)_0%,transparent_58%)]",
  "bg-[radial-gradient(ellipse_at_70%_20%,rgba(154,132,88,0.22)_0%,transparent_50%),radial-gradient(ellipse_at_15%_85%,rgba(8,6,12,0.8)_0%,transparent_55%)]",
  "bg-[radial-gradient(ellipse_at_40%_30%,rgba(184,149,107,0.18)_0%,transparent_48%),radial-gradient(ellipse_at_90%_70%,rgba(26,21,32,0.65)_0%,transparent_60%)]",
  "bg-[radial-gradient(ellipse_at_20%_75%,rgba(150,112,72,0.2)_0%,transparent_50%),radial-gradient(ellipse_at_80%_25%,rgba(12,10,16,0.7)_0%,transparent_55%)]",
  "bg-[radial-gradient(ellipse_at_55%_10%,rgba(184,149,107,0.24)_0%,transparent_45%),radial-gradient(ellipse_at_30%_95%,rgba(8,6,12,0.85)_0%,transparent_58%)]",
  "bg-[radial-gradient(ellipse_at_65%_60%,rgba(154,132,88,0.16)_0%,transparent_52%),radial-gradient(ellipse_at_10%_30%,rgba(16,14,20,0.7)_0%,transparent_55%)]",
];

export const PRODUCT_CATEGORY_KEYS = [
  "candles-aroma",
  "pro-cosmetics",
  "home-spa",
  "anti-cellulite",
  "gift-certificates",
  "nuar-premium",
];

export const CATEGORY_KEYS = ["all", ...PRODUCT_CATEGORY_KEYS];

/** @deprecated old catalog slugs → new 6 categories */
export const LEGACY_COSMETIC_CATEGORY_MAP = {
  oils: "pro-cosmetics",
  balms: "pro-cosmetics",
  creams: "pro-cosmetics",
  scrubs: "anti-cellulite",
  aroma: "candles-aroma",
  candles: "candles-aroma",
  incense: "candles-aroma",
  home: "home-spa",
  wraps: "anti-cellulite",
};

export function normalizeCosmeticCategory(category) {
  const key = String(category ?? "").trim();
  if (PRODUCT_CATEGORY_KEYS.includes(key)) return key;
  return LEGACY_COSMETIC_CATEGORY_MAP[key] ?? "pro-cosmetics";
}

export function getProductCategories(product) {
  const raw = Array.isArray(product?.categories)
    ? product.categories
    : product?.category != null && String(product.category).trim()
      ? [product.category]
      : [];

  const normalized = raw
    .map(normalizeCosmeticCategory)
    .filter((key, index, list) => PRODUCT_CATEGORY_KEYS.includes(key) && list.indexOf(key) === index);

  return normalized.length ? normalized : ["pro-cosmetics"];
}

export function productMatchesCategory(product, categoryKey) {
  if (categoryKey === "all") return true;
  return getProductCategories(product).includes(categoryKey);
}

export function formatProductCategoryLabels(t, product, { joiner = " · " } = {}) {
  return getProductCategories(product)
    .map((key) => t(`cosmetics.categories.${key}`))
    .join(joiner);
}

export function getProductImages(product) {
  const fromArray = Array.isArray(product?.images)
    ? product.images.map((value) => String(value ?? "").trim()).filter(Boolean)
    : [];

  if (fromArray.length) {
    return fromArray;
  }

  const primary = String(product?.img ?? "").trim();
  return primary ? [primary] : [];
}

export function syncProductImageFields(product) {
  const images = getProductImages(product);
  return {
    ...product,
    images,
    img: images[0] ?? undefined,
  };
}

export function normalizeCosmeticsList(products = cosmeticsBase) {
  return products.map((product) => {
    const categories = getProductCategories(product);
    return syncProductImageFields({
      ...product,
      categories,
      category: categories[0],
    });
  });
}

export const MAX_FEATURED_COSMETICS = 3;

export const DEFAULT_FEATURED_COSMETIC_IDS = [
  "rose-body-oil",
  "magnesium-balm",
  "velvet-body-cream",
];

export const COSMETICS_ROUTE = "/katalog";

export function getCosmeticProductUrl(id) {
  return `${COSMETICS_ROUTE}/${id}`;
}

export function buildLocalizedProduct(product, t, lang, getProductTexts) {
  const [localized] = getLocalizedProducts(t, [product]);
  return { ...localized, ...getProductTexts(lang, product.id, t) };
}

export function buildLocalizedProducts(products, t, lang, getProductTexts) {
  return products.map((product) => buildLocalizedProduct(product, t, lang, getProductTexts));
}

export function findLocalizedProduct(products, productId, t, lang, getProductTexts) {
  const product = products.find((item) => item.id === productId);
  if (!product) return null;
  return buildLocalizedProduct(product, t, lang, getProductTexts);
}

export function matchesProductSearch(product, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    product.id.toLowerCase().includes(q) ||
    String(product.name ?? "").toLowerCase().includes(q)
  );
}

export function buildCosmeticInquiryMailto(email, t, product) {
  const subject = t("cosmetics.interestedEmailSubject", { name: product.name });
  const body = t("cosmetics.interestedEmailBody", { name: product.name, id: product.id });
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const COSMETIC_TEXT_FIELDS = ["name", "description", "volume", "composition"];

export const COSMETIC_VOLUME_UNITS = ["ml", "g"];

export function parseCosmeticVolume(volume) {
  const raw = String(volume ?? "").trim().replace(/\s+/g, " ");
  if (!raw) return { amount: "", unit: "ml" };

  const mlMatch = raw.match(/^(\d+(?:[.,]\d+)?)\s*(?:ml|мл)\.?$/iu);
  if (mlMatch) {
    return { amount: mlMatch[1].replace(",", "."), unit: "ml" };
  }

  const gMatch = raw.match(/^(\d+(?:[.,]\d+)?)\s*(?:g|г|gram|grams)\.?$/iu);
  if (gMatch) {
    return { amount: gMatch[1].replace(",", "."), unit: "g" };
  }

  const bare = raw.match(/^(\d+(?:[.,]\d+)?)$/);
  if (bare) {
    return { amount: bare[1].replace(",", "."), unit: "g" };
  }

  return { amount: "", unit: "ml" };
}

export function formatCosmeticVolume(volume) {
  const raw = String(volume ?? "").trim();
  if (!raw) return "";

  const { amount, unit } =
    typeof volume === "object" && volume != null
      ? {
          amount: String(volume.amount ?? "").trim().replace(",", "."),
          unit: volume.unit === "g" ? "g" : "ml",
        }
      : parseCosmeticVolume(raw);

  if (!amount || !/^\d+(?:\.\d+)?$/.test(amount)) return "";

  return unit === "g" ? `${amount} g` : `${amount} ml`;
}

export function normalizeCosmeticCopy(source = {}) {
  return {
    name: source.name ?? "",
    description: source.description ?? source.tagline ?? "",
    volume: formatCosmeticVolume(source.volume ?? ""),
    composition: source.composition ?? source.brand ?? "",
  };
}

export function buildAuthorProductsDraft(draft = [], textDraft = {}) {
  const products = {};
  draft.forEach((item) => {
    const texts = textDraft[item.id] ?? {};
    const entry = {};
    COSMETIC_TEXT_FIELDS.forEach((field) => {
      const value = texts?.[field];
      if (typeof value === "string" && value.trim()) {
        entry[field] =
          field === "volume" ? formatCosmeticVolume(value.trim()) : value.trim();
      }
    });
    products[item.id] = entry;
  });
  return products;
}

const TRANSLATABLE_COSMETIC_FIELDS = ["description", "composition"];

function cosmeticFieldUnchanged(previousFields = {}, nextFields = {}, field) {
  return (
    String(previousFields?.[field] ?? "").trim() === String(nextFields?.[field] ?? "").trim()
  );
}

function copyCosmeticFields(fields) {
  return {
    name: String(fields.name ?? "").trim(),
    volume: formatCosmeticVolume(fields.volume ?? ""),
    description: String(fields.description ?? "").trim(),
    composition: String(fields.composition ?? "").trim(),
  };
}

export function buildCosmeticLocaleFromAuthor(
  fields,
  targetLang,
  { previousSource = {}, previousTranslated = {} } = {},
) {
  const normalized = copyCosmeticFields(fields);

  if (targetLang === "uk") {
    return normalized;
  }

  const result = {
    name: normalized.name,
    volume: normalized.volume,
    description: "",
    composition: "",
  };

  for (const field of TRANSLATABLE_COSMETIC_FIELDS) {
    const sourceText = normalized[field];
    if (!sourceText) continue;

    if (
      cosmeticFieldUnchanged(previousSource, fields, field) &&
      String(previousTranslated[field] ?? "").trim()
    ) {
      result[field] = String(previousTranslated[field]).trim();
      continue;
    }

    result[field] = sourceText;
  }

  return result;
}

export function sanitizeCosmeticsProductsDraft(products = {}) {
  const cleaned = {};
  Object.entries(products).forEach(([id, texts]) => {
    const entry = {};
    COSMETIC_TEXT_FIELDS.forEach((field) => {
      const value = texts?.[field];
      if (typeof value === "string" && value.trim()) {
        entry[field] = value.trim();
      }
    });
    if (Object.keys(entry).length) cleaned[id] = entry;
  });
  return cleaned;
}

export function getLocalizedProducts(t, products = cosmeticsBase) {
  return products.map((product) => ({
    ...product,
    ...normalizeCosmeticCopy({
      name: t(`cosmetics.products.${product.id}.name`),
      description: t(`cosmetics.products.${product.id}.description`),
      volume: t(`cosmetics.products.${product.id}.volume`),
      composition: t(`cosmetics.products.${product.id}.composition`),
      tagline: t(`cosmetics.products.${product.id}.tagline`),
      brand: t(`cosmetics.products.${product.id}.brand`),
    }),
  }));
}

export function generateCosmeticNumericId(existingIds = [], retiredIds = []) {
  const taken = new Set([...existingIds, ...retiredIds].map(String));
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const id = String(Math.floor(10000 + Math.random() * 90000));
    if (!taken.has(id)) return id;
  }
  return String(Date.now() % 1000000);
}

export function normalizeFeaturedCosmeticIds(ids = [], products = cosmeticsBase) {
  const productIds = new Set(products.map((item) => item.id));
  const unique = [];
  ids.forEach((id) => {
    if (productIds.has(id) && !unique.includes(id)) unique.push(id);
  });
  return unique.slice(0, MAX_FEATURED_COSMETICS);
}

export function getFeaturedProducts(t, products = cosmeticsBase, featuredIds = DEFAULT_FEATURED_COSMETIC_IDS) {
  const localized = getLocalizedProducts(t, products);
  const ordered = normalizeFeaturedCosmeticIds(featuredIds, products);
  return ordered.map((id) => localized.find((product) => product.id === id)).filter(Boolean);
}
