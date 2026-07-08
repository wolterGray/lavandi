/**
 * Merges CMS overrides from CRM backend into src/i18n/locales/{pl,en,uk}.json.
 * Removes deleted cosmetics products and team members from locale JSON on build.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LANGS = ["pl", "en", "uk"];

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

  const backendUrl = String(process.env.VITE_CRM_BACKEND_URL || "").replace(/\/$/, "");

  if (!backendUrl) {
    console.log("sync-locales: skip (CRM backend env not set)");
    return;
  }

  const response = await fetch(`${backendUrl}/api/public/site-content`);

  if (!response.ok) {
    console.warn("sync-locales: fetch failed:", response.status, response.statusText);
    return;
  }

  const payload = await response.json();
  const overrides =
    payload?.data?.overrides && typeof payload.data.overrides === "object"
      ? payload.data.overrides
      : null;
  if (!overrides) {
    console.log("sync-locales: no CMS overrides, locale JSON unchanged");
    return;
  }

  const hasCosmeticsOverride = Array.isArray(overrides.cosmetics);
  const activeProductIds = hasCosmeticsOverride
    ? new Set(overrides.cosmetics.map((item) => String(item.id)))
    : null;

  const hasTeamOverride = Array.isArray(overrides.team);
  const activeMemberIds = hasTeamOverride
    ? new Set(overrides.team.map((item) => String(item.id)))
    : null;

  LANGS.forEach((lang) => {
    const localePath = `src/i18n/locales/${lang}.json`;
    const locale = readJson(localePath);
    let changed = false;

    if (hasCosmeticsOverride && locale.cosmetics?.products) {
      Object.keys(locale.cosmetics.products).forEach((id) => {
        if (!activeProductIds.has(id)) {
          delete locale.cosmetics.products[id];
          changed = true;
        }
      });

      activeProductIds.forEach((id) => {
        if (locale.cosmetics.products[id]) return;
        locale.cosmetics.products[id] = {};
        changed = true;
      });
    }

    if (locale.team) {
      const teamPatch = overrides.locales?.[lang]?.team;
      if (teamPatch?.label && locale.team.label !== teamPatch.label) {
        locale.team.label = teamPatch.label;
        changed = true;
      }
      if (teamPatch?.title && locale.team.title !== teamPatch.title) {
        locale.team.title = teamPatch.title;
        changed = true;
      }
      if (teamPatch?.description && locale.team.description !== teamPatch.description) {
        locale.team.description = teamPatch.description;
        changed = true;
      }

      if (hasTeamOverride && locale.team.members) {
        Object.keys(locale.team.members).forEach((id) => {
          if (!activeMemberIds.has(id)) {
            delete locale.team.members[id];
            changed = true;
          }
        });

        activeMemberIds.forEach((id) => {
          const patch = collectNestedPatch(overrides, "team", "members", id, lang);
          if (!Object.keys(patch).length) return;
          const original = JSON.stringify(locale.team.members[id]);
          locale.team.members[id] = mergeMemberEntry(locale.team.members[id], patch);
          if (JSON.stringify(locale.team.members[id]) !== original) {
            changed = true;
          }
        });
      }
    }
    if (changed) {
      writeJson(localePath, locale);
      console.log(`sync-locales: updated ${localePath}`);
    }
  });
}

main().catch((error) => {
  console.error("sync-locales: fatal error", error);
  process.exit(1);
});
