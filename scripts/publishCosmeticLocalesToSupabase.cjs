/**
 * Pushes curated cosmetic product translations from locale JSON into Supabase CMS.
 * Run after editing src/i18n/locales/{pl,en,uk}.json product descriptions.
 *
 *   node scripts/publishCosmeticLocalesToSupabase.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PRODUCT_IDS = ["47843", "45996"];
const LANGS = ["pl", "en", "uk"];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, "utf8").split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

function readLocale(lang) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, "src/i18n/locales", `${lang}.json`), "utf8")
  );
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env.production"));
  loadEnvFile(path.join(ROOT, ".env.local"));

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or publishable key");
    process.exit(1);
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const getRes = await fetch(`${supabaseUrl}/rest/v1/site_content?id=eq.main&select=data`, {
    headers,
  });
  if (!getRes.ok) {
    console.error("Fetch failed:", getRes.status, await getRes.text());
    process.exit(1);
  }

  const rows = await getRes.json();
  const data = rows?.[0]?.data;
  if (!data) {
    console.error("No site_content row");
    process.exit(1);
  }

  data.locales = data.locales || {};

  LANGS.forEach((lang) => {
    const locale = readLocale(lang);
    data.locales[lang] = data.locales[lang] || {};
    data.locales[lang].cosmetics = data.locales[lang].cosmetics || {};
    data.locales[lang].cosmetics.products = data.locales[lang].cosmetics.products || {};

    PRODUCT_IDS.forEach((id) => {
      const source = locale.cosmetics?.products?.[id];
      if (!source) return;
      data.locales[lang].cosmetics.products[id] = {
        ...(data.locales[lang].cosmetics.products[id] || {}),
        ...source,
      };
    });
  });

  const patchRes = await fetch(`${supabaseUrl}/rest/v1/site_content?id=eq.main`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
  });

  if (!patchRes.ok) {
    console.error("PATCH failed:", patchRes.status, await patchRes.text());
    process.exit(1);
  }

  console.log("Published cosmetic locales to Supabase for:", PRODUCT_IDS.join(", "));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
