import { formatCosmeticVolume } from "../components/CosmeticsSection/cosmeticsShared";
import { SITE_LANG_CODES } from "./siteContent";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";
const REQUEST_GAP_MS = 700;
const MAX_CHUNK = 420;
const MAX_TRANSLATE_ATTEMPTS = 5;

const LANGPAIR = {
  pl: "ru|pl",
  en: "ru|en",
  uk: "pl|uk",
};

let lastRequestAt = 0;

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function chunkText(text) {
  if (text.length <= MAX_CHUNK) return [text];
  const parts = [];
  let rest = text;
  while (rest.length > MAX_CHUNK) {
    const slice = rest.slice(0, MAX_CHUNK);
    const splitAt = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf(", "),
      slice.lastIndexOf(" ")
    );
    const cut = splitAt > 80 ? splitAt + 1 : MAX_CHUNK;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

function postProcessTranslation(text, lang) {
  if (!text) return text;

  let result = text
    .replace(/\s+'\s+/g, "'")
    .replace(/\s+’\s+/g, "'")
    .replace(/\s+'\s+/g, "'");

  if (lang === "uk") {
    result = result
      .replace(/\bсприяти\b/gi, "сприяють")
      .replace(/\bгарантування\b/gi, "забезпечують")
      .replace(/\bвластивостей\b/gi, "властивостям")
      .replace(/\bбагатий діючими\b/gi, "багата на активні")
      .replace(/\bмає охолодження\b/gi, "має охолоджувальну")
      .replace(/\bзавдяки його заспокійливому\b/gi, "завдяки заспокійливим");
  }

  if (lang === "pl") {
    result = result
      .replace(/\bpromowanie\b/gi, "wspierają")
      .replace(/\bgwarancja odciążenia\b/gi, "gwarantują ulgę")
      .replace(/\bi działanie przeciwbólowe\b/gi, "i działaniem przeciwbólowym")
      .replace(/\buspokajającemu\s+właściwości\b/gi, "łagodzącym właściwościom");
  }

  return result.trim();
}

async function translateChunk(text, langPair, attempt = 0) {
  const trimmed = text?.trim();
  if (!trimmed) return "";

  const now = Date.now();
  const wait = REQUEST_GAP_MS - (now - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  if (!langPair) return trimmed;

  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(trimmed)}&langpair=${langPair}`;
  const response = await fetch(url);

  if (response.status === 429 && attempt < MAX_TRANSLATE_ATTEMPTS) {
    await sleep(1200 * (attempt + 1));
    return translateChunk(text, langPair, attempt + 1);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "Перевод недоступен (429): лимит MyMemory. Подождите минуту и сохраните снова — переводятся только изменённые поля.",
      );
    }
    throw new Error(`Перевод недоступен (${response.status})`);
  }

  const payload = await response.json();
  const translated = payload?.responseData?.translatedText?.trim();
  if (!translated) return trimmed;

  if (/^MYMEMORY WARNING:/i.test(translated)) {
    if (attempt < MAX_TRANSLATE_ATTEMPTS) {
      await sleep(1200 * (attempt + 1));
      return translateChunk(text, langPair, attempt + 1);
    }
    throw new Error(
      "Перевод недоступен: дневной лимит MyMemory. Попробуйте позже или сохраните без изменения текстов.",
    );
  }

  return translated;
}

async function translateViaPair(text, langPair) {
  const chunks = chunkText(String(text ?? ""));
  const parts = [];
  for (const chunk of chunks) {
    parts.push(await translateChunk(chunk, langPair));
  }
  return parts.join(" ").trim();
}

async function translateParagraph(text, targetLang) {
  if (targetLang === "uk") {
    const polish = await translateViaPair(text, LANGPAIR.pl);
    return translateViaPair(polish, LANGPAIR.uk);
  }

  return translateViaPair(text, LANGPAIR[targetLang]);
}

export async function translateText(text, targetLang) {
  const source = String(text ?? "");
  if (!source.trim()) return "";

  const lines = source.split("\n");
  const translated = [];

  for (const line of lines) {
    if (!line.trim()) {
      translated.push("");
      continue;
    }
    translated.push(await translateParagraph(line, targetLang));
  }

  return postProcessTranslation(translated.join("\n"), targetLang);
}

const TRANSLATABLE_COSMETIC_FIELDS = ["description", "composition"];

function cosmeticFieldUnchanged(previousFields = {}, nextFields = {}, field) {
  return (
    String(previousFields?.[field] ?? "").trim() === String(nextFields?.[field] ?? "").trim()
  );
}

export async function translateCosmeticCopy(
  fields,
  targetLang,
  { previousRu = {}, previousTranslated = {} } = {},
) {
  const volume = formatCosmeticVolume(fields.volume ?? "");
  const result = {
    name: String(fields.name ?? "").trim(),
    volume,
    description: "",
    composition: "",
  };

  for (const field of TRANSLATABLE_COSMETIC_FIELDS) {
    const ruText = String(fields[field] ?? "").trim();
    if (!ruText) continue;

    if (
      cosmeticFieldUnchanged(previousRu, fields, field) &&
      String(previousTranslated[field] ?? "").trim()
    ) {
      result[field] = String(previousTranslated[field]).trim();
      continue;
    }

    result[field] = await translateText(fields[field], targetLang);
  }

  return result;
}

export async function translateCosmeticsProducts(
  ruProducts,
  { previousRuProducts = {}, previousTranslations = {} } = {},
) {
  const translated = {};
  for (const lang of SITE_LANG_CODES) {
    translated[lang] = {};
  }

  for (const [id, fields] of Object.entries(ruProducts)) {
    const previousRu = previousRuProducts[id] ?? {};

    for (const lang of SITE_LANG_CODES) {
      translated[lang][id] = await translateCosmeticCopy(fields, lang, {
        previousRu,
        previousTranslated: previousTranslations[lang]?.[id] ?? {},
      });
    }
  }

  return translated;
}

export async function translateFaqItems(ruItems = []) {
  const result = {};
  for (const lang of SITE_LANG_CODES) {
    result[lang] = [];
    for (const item of ruItems) {
      result[lang].push({
        question: await translateText(item?.question, lang),
        answer: await translateText(item?.answer, lang),
      });
    }
  }
  return result;
}

export async function translateTeamLocale(ruLocale) {
  const result = {};
  for (const lang of SITE_LANG_CODES) {
    const members = {};
    for (const [id, member] of Object.entries(ruLocale?.members ?? {})) {
      members[id] = {
        bio: await translateText(member.bio, lang),
        specialties: await Promise.all(
          (member.specialties ?? []).map((item) => translateText(item, lang))
        ),
      };
    }
    result[lang] = {
      label: await translateText(ruLocale?.label, lang),
      title: await translateText(ruLocale?.title, lang),
      description: await translateText(ruLocale?.description, lang),
      members,
    };
  }
  return result;
}
