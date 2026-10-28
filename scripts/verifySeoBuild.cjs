const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = "https://nuarr.pl";

function decodeXml(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

function sitemapUrls() {
  const sitemapPath = path.join(DIST, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) throw new Error("SEO verify: dist/sitemap.xml is missing");
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeXml(match[1].trim()));
  if (!urls.length) throw new Error("SEO verify: sitemap contains no URLs");
  if (new Set(urls).size !== urls.length) throw new Error("SEO verify: sitemap contains duplicate URLs");
  return urls;
}

function routeFile(pathname) {
  if (pathname === "/") return path.join(DIST, "index.html");
  if (pathname.endsWith(".html")) return path.join(DIST, pathname.slice(1));
  return path.join(DIST, `${pathname.slice(1).replace(/\/$/, "")}.html`);
}

function tagValue(html, pattern, label, url) {
  const value = html.match(pattern)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!value) throw new Error(`SEO verify: ${url} has no ${label}`);
  return value;
}

function verifyHtml(url, html) {
  const title = tagValue(html, /<title[^>]*>([\s\S]*?)<\/title>/i, "title", url);
  const description = tagValue(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i, "description", url);
  const canonical = tagValue(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i, "canonical", url);
  const h1 = tagValue(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, "H1", url);
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/i)?.[1] || "";
  if (/noindex/i.test(robots)) throw new Error(`SEO verify: ${url} is marked noindex`);
  if (canonical !== url) throw new Error(`SEO verify: ${url} canonical is ${canonical}`);
  if (/<meta[^>]+http-equiv=["']refresh["']/i.test(html)) throw new Error(`SEO verify: ${url} contains a meta refresh`);
  return { title, description, h1 };
}

function assertUnique(records, key) {
  const seen = new Map();
  for (const record of records) {
    const normalized = record[key].toLocaleLowerCase("pl");
    if (seen.has(normalized)) {
      throw new Error(`SEO verify: duplicate ${key} on ${seen.get(normalized)} and ${record.url}`);
    }
    seen.set(normalized, record.url);
  }
}

async function main() {
  const urls = sitemapUrls();
  const files = new Map();
  for (const url of urls) {
    const parsed = new URL(url);
    if (parsed.origin !== SITE_URL) throw new Error(`SEO verify: foreign sitemap URL ${url}`);
    const file = routeFile(parsed.pathname);
    if (!fs.existsSync(file)) throw new Error(`SEO verify: ${url} has no generated HTML (${path.relative(ROOT, file)})`);
    files.set(parsed.pathname, fs.readFileSync(file, "utf8"));
  }

  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const html = files.get(pathname);
    if (!html) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(html);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const records = [];
  try {
    const { port } = server.address();
    for (const url of urls) {
      const pathname = new URL(url).pathname;
      const response = await fetch(`http://127.0.0.1:${port}${pathname}`, { redirect: "manual" });
      if (response.status !== 200) throw new Error(`SEO verify: ${url} returned HTTP ${response.status}`);
      const html = await response.text();
      const metadata = verifyHtml(url, html);
      records.push({ url, ...metadata });
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }

  const commercial = records.filter(({ url }) => /\/uslugi\/|\/katalog(?:\/|$)/.test(new URL(url).pathname));
  ["title", "description", "h1"].forEach((key) => assertUnique(commercial, key));

  const catalog = files.get("/katalog");
  const linkedProducts = new Set([...catalog.matchAll(/<a\s+[^>]*href=["'](\/katalog\/[^"']+)["']/gi)].map((match) => match[1]));
  const sitemapProducts = urls.map((url) => new URL(url).pathname).filter((pathname) => /^\/katalog\/[^/]+$/.test(pathname));
  for (const pathname of sitemapProducts) {
    if (!linkedProducts.has(pathname)) throw new Error(`SEO verify: /katalog does not link to ${pathname}`);
  }
  if (linkedProducts.size !== sitemapProducts.length) {
    throw new Error(`SEO verify: catalog links (${linkedProducts.size}) differ from sitemap products (${sitemapProducts.length})`);
  }

  console.log(`SEO verify: ${urls.length} sitemap URLs return 200 and passed metadata/content checks`);
  console.log(`SEO verify: /katalog contains ${linkedProducts.size} crawlable product links`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
