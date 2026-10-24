const { writeFileSync, readFileSync } = require("fs");
const { execFileSync } = require("child_process");
const path = require("path");
const { SitemapStream, streamToPromise } = require("sitemap");
const generateRobotstxt = require("generate-robotstxt");

const baseUrl = "https://nuarr.pl";

function loadJson(relativePath) {
  const filePath = path.resolve(__dirname, relativePath);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function loadServices() {
  return loadJson("../src/data/services.json");
}

function loadCosmetics() {
  return loadJson("../src/data/cosmetics.json");
}

function gitLastModified(relativePath) {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cI", "--", relativePath], {
      cwd: path.resolve(__dirname, ".."),
      encoding: "utf8",
    }).trim() || undefined;
  } catch {
    return undefined;
  }
}

const fs = require("fs");

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

async function generateSitemap() {
  loadEnvFile(path.resolve(__dirname, "../.env.production"));
  loadEnvFile(path.resolve(__dirname, "../.env"));
  loadEnvFile(path.resolve(__dirname, "../.env.local"));

  let services = [];
  let cosmetics = [];
  let contentLastmod;
  let servicesLastmodFromCms;
  let cosmeticsLastmodFromCms;

  const backendUrl = String(process.env.VITE_CRM_BACKEND_URL || "").replace(/\/$/, "");

  if (backendUrl) {
    try {
      console.log(`generate-seo: Fetching latest content from CRM backend ${backendUrl}...`);
      const response = await fetch(`${backendUrl}/api/public/site-content`);
      if (response.ok) {
        const payload = await response.json();
        const overrides = payload?.data?.overrides;
        contentLastmod = payload?.data?.updatedAt;
        servicesLastmodFromCms = overrides?._adminMeta?.sections?.services;
        cosmeticsLastmodFromCms = overrides?._adminMeta?.sections?.cosmetics;
        if (overrides) {
          if (Array.isArray(overrides.services)) {
            services = overrides.services;
            console.log(`generate-seo: Loaded ${services.length} services from CRM backend`);
          }
          if (Array.isArray(overrides.cosmetics)) {
            cosmetics = overrides.cosmetics;
            console.log(`generate-seo: Loaded ${cosmetics.length} cosmetics from CRM backend`);
          }
        }
      } else {
        console.warn("generate-seo: CRM backend fetch failed, using local fallback");
      }
    } catch (error) {
      console.warn("generate-seo: Error fetching from CRM backend:", error.message);
    }
  }

  if (!services.length) {
    services = loadServices();
    console.log(`generate-seo: Loaded ${services.length} services from local fallback`);
  }
  if (!cosmetics.length) {
    cosmetics = loadCosmetics();
    console.log(`generate-seo: Loaded ${cosmetics.length} cosmetics from local fallback`);
  }

  const pageLastmod = contentLastmod || gitLastModified("src");
  const servicesLastmod = servicesLastmodFromCms || contentLastmod || gitLastModified("src/data/services.json") || pageLastmod;
  const cosmeticsLastmod = cosmeticsLastmodFromCms || contentLastmod || gitLastModified("src/data/cosmetics.json") || pageLastmod;
  const privacyLastmod = gitLastModified("public/polityka-prywatnosci.html") || pageLastmod;
  const links = [
    { url: "/", changefreq: "weekly", priority: 1.0, lastmod: pageLastmod },
    { url: "/katalog", changefreq: "weekly", priority: 0.9, lastmod: cosmeticsLastmod },
    {
      url: "/polityka-prywatnosci.html",
      changefreq: "yearly",
      priority: 0.3,
      lastmod: privacyLastmod,
    },
    ...services.map((service) => ({
      url: `/uslugi/${service.slug}`,
      changefreq: "monthly",
      priority: 0.8,
      lastmod: servicesLastmod,
    })),
    ...cosmetics.map((product) => ({
      url: `/katalog/${product.id}`,
      changefreq: "weekly",
      priority: 0.75,
      lastmod: cosmeticsLastmod,
    })),
  ];

  const sitemapStream = new SitemapStream({ hostname: baseUrl });
  links.forEach((link) => sitemapStream.write(link));
  sitemapStream.end();
  const xml = await streamToPromise(sitemapStream);

  const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
  writeFileSync(sitemapPath, xml.toString());
  console.log(`Sitemap сгенерирован (${links.length} URL):`, sitemapPath);
}

async function generateRobots() {
  const content = await generateRobotstxt({
    policy: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/club/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  });

  const robotsPath = path.resolve(__dirname, "../public/robots.txt");
  writeFileSync(robotsPath, content);
  console.log("robots.txt сгенерирован:", robotsPath);
}

async function main() {
  await generateSitemap();
  await generateRobots();
}

main();
