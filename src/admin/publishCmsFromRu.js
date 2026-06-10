import { translateCosmeticsProducts, translateFaqItems, translateTeamLocale } from "./autoTranslate";
import { patchLocaleBlock } from "./contentStore";
import { buildTeamLocalePayload } from "./localeSync";
import { CMS_AUTHOR_LANG } from "./siteContent";

export async function publishCosmeticsLocalesFromRussian(overrides, ruProducts) {
  const translated = await translateCosmeticsProducts(ruProducts);
  let next = patchLocaleBlock(overrides, CMS_AUTHOR_LANG, "cosmetics", {
    products: ruProducts,
  });

  Object.entries(translated).forEach(([lang, products]) => {
    next = patchLocaleBlock(next, lang, "cosmetics", { products });
  });

  return next;
}

export async function publishTeamLocalesFromRussian(overrides, teamDraft, ruLocaleDraft) {
  const ruTeamLocale = buildTeamLocalePayload(ruLocaleDraft, teamDraft);
  const translated = await translateTeamLocale(ruTeamLocale);
  let next = { ...overrides, team: teamDraft };

  next = patchLocaleBlock(next, CMS_AUTHOR_LANG, "team", ruTeamLocale);
  Object.entries(translated).forEach(([lang, teamLocale]) => {
    next = patchLocaleBlock(next, lang, "team", teamLocale);
  });

  return next;
}

export async function publishFaqLocalesFromRussian(overrides, ruItems) {
  const translated = await translateFaqItems(ruItems);
  return {
    ...overrides,
    faq: {
      ru: ruItems,
      ...translated,
    },
  };
}
