import en from "../i18n/locales/en.json";
import pl from "../i18n/locales/pl.json";
import uk from "../i18n/locales/uk.json";
import reviewsDefault from "../data/reviews.json";
import teamDefault from "../data/team.json";
import contactDefault from "../data/contact.json";

export const LANG_CODES = ["pl", "en", "uk"];

export const LANG_LABELS = { pl: "PL", en: "EN", uk: "UA" };

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

export function mergeProductTexts(lang, productId, overrides, fallbackItem) {
  const patch = overrides?.locales?.[lang]?.cosmetics?.products?.[productId];
  if (!patch) return fallbackItem;

  const merged = { ...fallbackItem };
  Object.entries(patch).forEach(([key, value]) => {
    if (typeof value === "string") {
      if (value.trim()) merged[key] = value;
      return;
    }
    if (value != null) merged[key] = value;
  });
  return merged;
}

export function mergeTeamMemberTexts(lang, memberId, overrides, fallbackMember) {
  const patch = overrides?.locales?.[lang]?.team?.members?.[memberId];
  if (!patch) return fallbackMember;
  return { ...fallbackMember, ...patch };
}
