const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SNAPSHOT_PATH = path.join(ROOT, ".seo-build", "content-snapshot.json");

function loadEnvFile(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadBuildEnv() {
  loadEnvFile(".env.production");
  loadEnvFile(".env");
  loadEnvFile(".env.local");
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function appendLocation(description) {
  const text = cleanText(description);
  if (!text) return "Masaż premium w NUAR w centrum Warszawy, ul. Świętojerska 5/7.";
  if (/warszaw|świętojersk/i.test(text)) return text;
  return `${text} NUAR, centrum Warszawy, ul. Świętojerska 5/7.`;
}

function mergePolishServices(services, overrides, localPolish) {
  return services.map((service) => {
    const cms = overrides?.locales?.pl?.servicesItems?.[service.slug] || {};
    const local = localPolish?.servicesItems?.[service.slug] || {};
    const title = cleanText(cms.title) || cleanText(local.title) || cleanText(service.title);
    const desc = cleanText(cms.desc) || cleanText(local.desc) || cleanText(service.desc);
    return {
      ...service,
      title,
      desc,
      seoTitle: cleanText(cms.seoTitle) || `${title} — NUAR Warszawa | Masaż premium`,
      seoDescription: cleanText(cms.seoDescription) || appendLocation(desc),
    };
  });
}

function validateCollection(items, key, label) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`SEO snapshot: ${label} collection is empty`);
  }
  const values = items.map((item) => String(item?.[key] ?? "").trim());
  if (values.some((value) => !value)) {
    throw new Error(`SEO snapshot: ${label} contains an item without ${key}`);
  }
  if (new Set(values).size !== values.length) {
    throw new Error(`SEO snapshot: ${label} contains duplicate ${key} values`);
  }
}

function buildSnapshot(overrides, metadata = {}) {
  const localServices = readJson("src/data/services.json");
  const localCosmetics = readJson("src/data/cosmetics.json");
  const localPolish = readJson("src/i18n/locales/pl.json");
  const services = Array.isArray(overrides?.services) && overrides.services.length
    ? overrides.services
    : localServices;
  const cosmetics = Array.isArray(overrides?.cosmetics)
    ? overrides.cosmetics
    : localCosmetics;
  const mergedServices = mergePolishServices(services, overrides, localPolish);
  const productTexts = {
    ...(localPolish?.cosmetics?.products || {}),
    ...(overrides?.locales?.pl?.cosmetics?.products || {}),
  };

  validateCollection(mergedServices, "slug", "services");
  validateCollection(cosmetics, "id", "cosmetics");

  return {
    generatedAt: new Date().toISOString(),
    source: metadata.source || "local",
    updatedAt: metadata.updatedAt || null,
    sectionUpdatedAt: metadata.sectionUpdatedAt || {},
    overrides: overrides || {},
    services: mergedServices,
    cosmetics,
    productTexts,
  };
}

async function fetchSeoSnapshot() {
  loadBuildEnv();
  const backendUrl = String(process.env.VITE_CRM_BACKEND_URL || "").replace(/\/$/, "");

  if (!backendUrl) {
    if (process.env.VERCEL === "1" || process.env.SEO_REQUIRE_REMOTE === "1") {
      throw new Error("SEO snapshot: VITE_CRM_BACKEND_URL is required for production builds");
    }
    console.warn("SEO snapshot: CRM backend is not configured; using repository data");
    return buildSnapshot({}, {source: "local"});
  }

  let response;
  try {
    response = await fetch(`${backendUrl}/api/public/site-content`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    throw new Error(`SEO snapshot: CRM backend request failed (${error.message})`);
  }
  if (!response.ok) {
    throw new Error(`SEO snapshot: CRM backend returned ${response.status} ${response.statusText}`);
  }
  const payload = await response.json();
  const overrides = payload?.data?.overrides;
  if (!overrides || typeof overrides !== "object") {
    throw new Error("SEO snapshot: CRM response does not contain valid CMS overrides");
  }
  if (!Array.isArray(overrides.services) || overrides.services.length === 0) {
    throw new Error("SEO snapshot: CRM response does not contain published services");
  }
  if (!Array.isArray(overrides.cosmetics) || overrides.cosmetics.length === 0) {
    throw new Error("SEO snapshot: CRM response does not contain published cosmetics");
  }

  return buildSnapshot(overrides, {
    source: backendUrl,
    updatedAt: payload?.data?.updatedAt || null,
    sectionUpdatedAt: overrides?._adminMeta?.sections || {},
  });
}

function writeSnapshot(snapshot) {
  fs.mkdirSync(path.dirname(SNAPSHOT_PATH), {recursive: true});
  fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

function readSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    throw new Error("SEO snapshot is missing; run npm run prepare-seo first");
  }
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));
  validateCollection(snapshot.services, "slug", "services");
  validateCollection(snapshot.cosmetics, "id", "cosmetics");
  return snapshot;
}

module.exports = {
  ROOT,
  SNAPSHOT_PATH,
  fetchSeoSnapshot,
  readSnapshot,
  writeSnapshot,
};
