import en from "../i18n/locales/en.json";
import pl from "../i18n/locales/pl.json";
import uk from "../i18n/locales/uk.json";
import reviewsDefault from "../data/reviews.json";
import teamDefault from "../data/team.json";
import contactDefault from "../data/contact.json";

export const SITE_LANG_CODES = ["pl", "en", "uk"];
export const CMS_AUTHOR_LANG = "ru";
export const ADMIN_LANG_CODES = ["ru", ...SITE_LANG_CODES];
/** @deprecated use SITE_LANG_CODES on the public site */
export const LANG_CODES = SITE_LANG_CODES;

export const LANG_LABELS = {
  ru: "RU",
  pl: "PL",
  en: "EN",
  uk: "UA",
};

export const localeDefaults = { pl, en, uk };

export const siteDefaults = {
  reviews: reviewsDefault,
  team: teamDefault,
  contact: contactDefault,
  aboutImage: "/about/about.webp",
};

export function getLocaleDefaults(lang, block) {
  return localeDefaults[lang]?.[block];
}

export const EMPTY_TEAM_LOCALE = {
  label: "",
  title: "",
  description: "",
  members: {},
};

export function getAdminLocaleFallback(lang, block) {
  const defaults = getLocaleDefaults(lang, block);
  if (defaults) return defaults;
  if (lang === CMS_AUTHOR_LANG && block === "team") return EMPTY_TEAM_LOCALE;
  return defaults;
}

export function mergeLocaleBlock(lang, block, overrides, fallback) {
  const base = fallback ?? getLocaleDefaults(lang, block);
  const patch = overrides?.locales?.[lang]?.[block];
  if (!patch) return base;
  if (Array.isArray(base)) return patch;
  if (base && typeof base === "object" && !Array.isArray(base)) {
    return { ...base, ...patch };
  }
  return patch ?? base;
}

export function mergeServiceTexts(lang, slug, overrides, fallbackItem) {
  const patch = overrides?.locales?.[lang]?.servicesItems?.[slug];
  if (!patch) return fallbackItem;
  return { ...fallbackItem, ...patch };
}

function applyLocalePatch(fallbackItem, patch) {
  if (!patch) return fallbackItem;

  const merged = { ...fallbackItem };
  Object.entries(patch).forEach(([key, value]) => {
    if (typeof value === "string") {
      if (value.trim()) merged[key] = value.trim();
      return;
    }
    if (Array.isArray(value)) {
      if (value.length) merged[key] = value;
      return;
    }
    if (value != null) merged[key] = value;
  });
  return merged;
}

export function mergeProductTexts(lang, productId, overrides, fallbackItem) {
  const patch = overrides?.locales?.[lang]?.cosmetics?.products?.[productId];
  return applyLocalePatch(fallbackItem, patch);
}

export function mergeTeamMemberTexts(lang, memberId, overrides, fallbackMember) {
  const patch = overrides?.locales?.[lang]?.team?.members?.[memberId];
  return applyLocalePatch(fallbackMember, patch);
}
