import { translateFaqItems, translateTeamLocale } from "./autoTranslate";
import { patchLocaleBlock } from "./contentStore";
import { buildCosmeticLocaleFromAuthor } from "../components/CosmeticsSection/cosmeticsShared";
import { buildTeamLocalePayload } from "./localeSync";
import { CMS_AUTHOR_LANG } from "./siteContent";

export function publishCosmeticsLocalesFromAuthor(overrides, authorProducts) {
  const previousSourceProducts =
    overrides?.locales?.[CMS_AUTHOR_LANG]?.cosmetics?.products ??
    overrides?.locales?.ru?.cosmetics?.products ??
    {};
  const previousTranslations = Object.fromEntries(
    ["pl", "en", "uk"].map((lang) => [
      lang,
      overrides?.locales?.[lang]?.cosmetics?.products ?? {},
    ]),
  );

  let next = patchLocaleBlock(overrides, CMS_AUTHOR_LANG, "cosmetics", {
    products: authorProducts,
  });

  for (const lang of ["pl", "en"]) {
    const products = {};
    Object.entries(authorProducts).forEach(([id, fields]) => {
      products[id] = buildCosmeticLocaleFromAuthor(fields, lang, {
        previousSource: previousSourceProducts[id] ?? {},
        previousTranslated: previousTranslations[lang]?.[id] ?? {},
      });
    });
    next = patchLocaleBlock(next, lang, "cosmetics", { products });
  }

  return next;
}

export async function publishTeamLocalesFromAuthor(overrides, teamDraft, authorLocaleDraft) {
  const authorTeamLocale = buildTeamLocalePayload(authorLocaleDraft, teamDraft);
  const translated = await translateTeamLocale(authorTeamLocale);
  let next = { ...overrides, team: teamDraft };

  next = patchLocaleBlock(next, CMS_AUTHOR_LANG, "team", authorTeamLocale);
  Object.entries(translated).forEach(([lang, teamLocale]) => {
    next = patchLocaleBlock(next, lang, "team", teamLocale);
  });

  return next;
}

export async function publishFaqLocalesFromAuthor(overrides, authorItems) {
  const translated = await translateFaqItems(authorItems);
  return {
    ...overrides,
    faq: {
      [CMS_AUTHOR_LANG]: authorItems,
      ...translated,
    },
  };
}

/** @deprecated use publishTeamLocalesFromAuthor */
export const publishTeamLocalesFromRussian = publishTeamLocalesFromAuthor;

/** @deprecated use publishFaqLocalesFromAuthor */
export const publishFaqLocalesFromRussian = publishFaqLocalesFromAuthor;
