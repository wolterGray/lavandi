import servicesDefault from "../data/services.json";
import galleryDefault from "../data/gallery.json";
import cosmeticsDefault from "../data/cosmetics.json";
import { siteDefaults } from "../admin/siteContent";

export const CONTENT_STORAGE_KEY = "nuar_content_overrides";

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(overrides) {
  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(overrides));
}

export function clearOverrides() {
  localStorage.removeItem(CONTENT_STORAGE_KEY);
}

export function mergeContent(overrides = loadOverrides()) {
  return {
    services: overrides.services ?? servicesDefault,
    gallery: overrides.gallery ?? galleryDefault,
    cosmetics: overrides.cosmetics ?? cosmeticsDefault,
    faq: overrides.faq ?? null,
    reviews: overrides.reviews ?? siteDefaults.reviews,
    team: overrides.team ?? siteDefaults.team,
    contact: { ...siteDefaults.contact, ...overrides.contact },
    aboutImage: overrides.aboutImage ?? siteDefaults.aboutImage,
    locales: overrides.locales ?? null,
    siteSettings: {
      googleAnalyticsId: import.meta.env.VITE_GA_ID || "G-NYM3P4FJJE",
      analyticsEnabled: true,
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
