import { SITE_LANG_CODES } from "./siteContent";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";
const REQUEST_GAP_MS = 400;
const MAX_CHUNK = 420;

const LANGPAIR = {
  pl: "ru|pl",
  en: "ru|en",
  uk: "ru|uk",
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

async function translateChunk(text, targetLang) {
  const trimmed = text?.trim();
  if (!trimmed) return "";

  const now = Date.now();
  const wait = REQUEST_GAP_MS - (now - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  const pair = LANGPAIR[targetLang];
  if (!pair) return trimmed;

  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(trimmed)}&langpair=${pair}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Перевод недоступен (${response.status})`);

  const payload = await response.json();
  const translated = payload?.responseData?.translatedText?.trim();
  if (!translated) return trimmed;

  return translated;
}

export async function translateText(text, targetLang) {
  const chunks = chunkText(String(text ?? ""));
  const parts = [];
  for (const chunk of chunks) {
    parts.push(await translateChunk(chunk, targetLang));
  }
  return parts.join(" ").trim();
}

export async function translateCosmeticCopy(fields, targetLang) {
  const volume = fields.volume?.trim();
  const shouldTranslateVolume = volume && /[а-яА-ЯёЁa-zA-Z]/.test(volume);

  return {
    name: String(fields.name ?? "").trim(),
    description: await translateText(fields.description, targetLang),
    volume: shouldTranslateVolume ? await translateText(volume, targetLang) : (volume ?? ""),
    composition: await translateText(fields.composition, targetLang),
  };
}

export async function translateCosmeticsProducts(ruProducts) {
  const translated = {};
  for (const lang of SITE_LANG_CODES) {
    translated[lang] = {};
    for (const [id, fields] of Object.entries(ruProducts)) {
      translated[lang][id] = await translateCosmeticCopy(fields, lang);
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
