import { translateCosmeticsProducts, translateFaqItems, translateTeamLocale } from "./autoTranslate";
import { patchLocaleBlock } from "./contentStore";
import { buildTeamLocalePayload } from "./localeSync";
import { CMS_AUTHOR_LANG } from "./siteContent";

export async function publishCosmeticsLocalesFromAuthor(overrides, authorProducts) {
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

  try {
    const translated = await translateCosmeticsProducts(authorProducts, {
      previousSourceProducts,
      previousTranslations,
    });

    Object.entries(translated).forEach(([lang, products]) => {
      next = patchLocaleBlock(next, lang, "cosmetics", { products });
    });

    return { next, translationError: null };
  } catch (error) {
    return {
      next,
      translationError:
        error instanceof Error ? error : new Error("Не удалось перевести тексты на PL и EN"),
    };
  }
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
