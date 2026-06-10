import { mergeContent } from "./contentStore";
import { LANG_CODES, localeDefaults } from "./siteContent";

const CMS_LOCALE_BLOCKS = [
  "announcements",
  "homeNews",
  "about",
  "trust",
  "stats",
  "team",
  "visit",
  "servicesItems",
  "cosmetics",
];

function buildDefaultFaq() {
  return Object.fromEntries(
    LANG_CODES.map((lang) => [lang, localeDefaults[lang]?.faq?.items ?? []])
  );
}

function buildDefaultLocales() {
  return Object.fromEntries(
    LANG_CODES.map((lang) => {
      const source = localeDefaults[lang] ?? {};
      const blocks = {};

      CMS_LOCALE_BLOCKS.forEach((block) => {
        if (source[block] !== undefined) {
          blocks[block] = source[block];
        }
      });

      return [lang, blocks];
    })
  );
}

/** Snapshot of all visible site data for storing in site_content (not just diffs). */
export function buildFullPublishedOverrides(currentOverrides = {}) {
  const merged = mergeContent(currentOverrides);

  return {
    services: merged.services,
    gallery: merged.gallery,
    cosmetics: merged.cosmetics,
    reviews: merged.reviews,
    team: merged.team,
    contact: merged.contact,
    aboutImage: merged.aboutImage,
    siteSettings: merged.siteSettings,
    faq: merged.faq ?? buildDefaultFaq(),
    locales: merged.locales ?? buildDefaultLocales(),
  };
}
