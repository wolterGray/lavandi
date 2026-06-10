/**
 * Merges CMS overrides from Supabase into src/i18n/locales/{pl,en,uk}.json.
 * Removes deleted cosmetics products and team members from locale JSON on build.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LANGS = ["pl", "en", "uk"];
const SITE_CONTENT_ROW_ID = "main";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function writeJson(relativePath, data) {
  fs.writeFileSync(
    path.join(ROOT, relativePath),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function collectNestedPatch(overrides, block, nestedKey, id, preferredLang) {
  const merged = {};
  const langs = [preferredLang, ...LANGS.filter((code) => code !== preferredLang)];

  langs.forEach((lang) => {
    const patch = overrides?.locales?.[lang]?.[block]?.[nestedKey]?.[id];
    if (!patch || typeof patch !== "object") return;

    Object.entries(patch).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length && merged[key] == null) merged[key] = value;
        return;
      }
      if (typeof value === "string") {
        if (value.trim() && merged[key] == null) merged[key] = value.trim();
        return;
      }
      if (value != null && merged[key] == null) merged[key] = value;
    });
  });

  return merged;
}

function mergeProductEntry(existing = {}, patch = {}) {
  const next = { ...existing };
  ["name", "description", "volume", "composition", "brand", "tagline"].forEach((key) => {
    if (patch[key]) next[key] = patch[key];
  });
  return next;
}

function mergeMemberEntry(existing = {}, patch = {}) {
  const next = { ...existing };
  if (patch.bio) next.bio = patch.bio;
  if (Array.isArray(patch.specialties) && patch.specialties.length) {
    next.specialties = patch.specialties;
  }
  return next;
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env.production"));

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("sync-locales: skip (Supabase env not set)");
    return;
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/site_content?id=eq.${SITE_CONTENT_ROW_ID}&select=data`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    console.warn("sync-locales: fetch failed:", response.status, response.statusText);
    return;
  }

  const rows = await response.json();
  const overrides =
    rows?.[0]?.data && typeof rows[0].data === "object" ? rows[0].data : null;
  if (!overrides) {
    console.log("sync-locales: no CMS overrides, locale JSON unchanged");
    return;
  }

  const activeProductIds = new Set((overrides.cosmetics ?? []).map((item) => item.id));
  const activeMemberIds = new Set((overrides.team ?? []).map((item) => item.id));

  LANGS.forEach((lang) => {
    const localePath = `src/i18n/locales/${lang}.json`;
    const locale = readJson(localePath);

    if (locale.cosmetics?.products) {
      Object.keys(locale.cosmetics.products).forEach((id) => {
        if (!activeProductIds.has(id)) {
          delete locale.cosmetics.products[id];
        }
      });

      activeProductIds.forEach((id) => {
        const patch = collectNestedPatch(overrides, "cosmetics", "products", id, lang);
        if (!Object.keys(patch).length) return;
        locale.cosmetics.products[id] = mergeProductEntry(
          locale.cosmetics.products[id],
          patch
        );
      });
    }

    if (locale.team) {
      const teamPatch = overrides.locales?.[lang]?.team;
      if (teamPatch?.label) locale.team.label = teamPatch.label;
      if (teamPatch?.title) locale.team.title = teamPatch.title;
      if (teamPatch?.description) locale.team.description = teamPatch.description;

      if (locale.team.members) {
        Object.keys(locale.team.members).forEach((id) => {
          if (!activeMemberIds.has(id)) {
            delete locale.team.members[id];
          }
        });

        activeMemberIds.forEach((id) => {
          const patch = collectNestedPatch(overrides, "team", "members", id, lang);
          if (!Object.keys(patch).length) return;
          locale.team.members[id] = mergeMemberEntry(locale.team.members[id], patch);
        });
      }
    }

    writeJson(localePath, locale);
    console.log(`sync-locales: updated ${localePath}`);
  });
}

main().catch((error) => {
  console.error("sync-locales: fatal error", error);
  process.exit(1);
});
