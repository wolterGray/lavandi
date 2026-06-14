import { patchLocaleBlock } from "./contentStore";
import { translateFaqItems, translateTeamLocale } from "./autoTranslate";
import { buildTeamLocalePayload } from "./localeSync";
import { CMS_AUTHOR_LANG } from "./siteContent";

export function publishCosmeticsLocalesFromDrafts(overrides, productsByLang) {
  let next = overrides;
  Object.entries(productsByLang).forEach(([lang, products]) => {
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
