import servicesDefault from "../data/services.json";
import galleryDefault from "../data/gallery.json";
import cosmeticsDefault from "../data/cosmetics.json";
import { DEFAULT_FEATURED_COSMETIC_IDS } from "../components/CosmeticsSection/cosmeticsShared";
import { siteDefaults, CMS_AUTHOR_LANG } from "../admin/siteContent";

export const CONTENT_STORAGE_KEY = "nuar_content_overrides";

/** Ignore tiny stale drafts in localStorage (e.g. one product after a failed save). */
export const MIN_USABLE_CATALOG_SIZE = 5;

export function getProductNameFromOverrides(overrides = {}, productId) {
  for (const lang of [CMS_AUTHOR_LANG, "ru", "pl", "en"]) {
    const name = overrides?.locales?.[lang]?.cosmetics?.products?.[productId]?.name?.trim();
    if (name) return name;
  }
  return "";
}

export function hasUsableCachedCatalog(overrides = {}) {
  const products = overrides.cosmetics;
  if (!Array.isArray(products) || products.length < MIN_USABLE_CATALOG_SIZE) return false;

  const namedCount = products.filter((product) => getProductNameFromOverrides(overrides, product.id)).length;
  return namedCount >= MIN_USABLE_CATALOG_SIZE;
}

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(overrides) {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(overrides));
  } catch (error) {
    if (error?.name !== "QuotaExceededError") {
      throw error;
    }
  }
}

export function clearOverrides() {
  localStorage.removeItem(CONTENT_STORAGE_KEY);
}

export function mergeContent(overrides = loadOverrides()) {
  return {
    services: overrides.services ?? servicesDefault,
    gallery: overrides.gallery ?? galleryDefault,
    cosmetics: hasUsableCachedCatalog(overrides) ? overrides.cosmetics : cosmeticsDefault,
    featuredCosmeticIds: overrides.featuredCosmeticIds ?? DEFAULT_FEATURED_COSMETIC_IDS,
    cosmeticRetiredIds: overrides.cosmeticRetiredIds ?? [],
    faq: overrides.faq ?? null,
    reviews: overrides.reviews ?? siteDefaults.reviews,
    team: overrides.team ?? siteDefaults.team,
    contact: { ...siteDefaults.contact, ...overrides.contact },
    aboutImage: overrides.aboutImage ?? siteDefaults.aboutImage,
    locales: overrides.locales ?? null,
    siteSettings: {
      googleAnalyticsId: import.meta.env.VITE_GA_ID || "G-NYM3P4FJJE",
      analyticsEnabled: true,
      bookingEnabled: true,
      ...overrides.siteSettings,
    },
  };
}

export function exportContentBundle(overrides = loadOverrides()) {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      overrides,
    },
    null,
    2
  );
}

export function importContentBundle(raw) {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  const overrides = parsed.overrides ?? parsed;
  saveOverrides(overrides);
  return mergeContent(overrides);
}

export function patchLocaleBlock(overrides, lang, block, value) {
  return {
    ...overrides,
    locales: {
      ...overrides.locales,
      [lang]: {
        ...overrides.locales?.[lang],
        [block]: value,
      },
    },
  };
}
