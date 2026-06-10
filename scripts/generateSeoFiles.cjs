const { writeFileSync, readFileSync } = require("fs");
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

async function generateSitemap() {
  const services = loadServices();
  const cosmetics = loadCosmetics();

  const links = [
    { url: "/", changefreq: "weekly", priority: 1.0 },
    { url: "/katalog", changefreq: "weekly", priority: 0.9 },
    {
      url: "/polityka-prywatnosci.html",
      changefreq: "yearly",
      priority: 0.3,
    },
    ...services.map((service) => ({
      url: `/uslugi/${service.slug}`,
      changefreq: "monthly",
      priority: 0.8,
    })),
    ...cosmetics.map((product) => ({
      url: `/katalog/${product.id}`,
      changefreq: "monthly",
      priority: 0.7,
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
    policy: [{ userAgent: "*", allow: "/" }],
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
