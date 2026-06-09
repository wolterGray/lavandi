const { writeFileSync, readFileSync } = require("fs");
const path = require("path");
const { SitemapStream, streamToPromise } = require("sitemap");
const generateRobotstxt = require("generate-robotstxt");

const baseUrl = "https://nuarr.pl";

function loadServices() {
  const filePath = path.resolve(__dirname, "../src/data/services.json");
  return JSON.parse(readFileSync(filePath, "utf8"));
}

async function generateSitemap() {
  const services = loadServices();

  const links = [
    { url: "/", changefreq: "weekly", priority: 1.0 },
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
  ];

  const sitemapStream = new SitemapStream({ hostname: baseUrl });

  const xml = await streamToPromise(
    links
      .reduce((stream, link) => stream.write(link) && stream, sitemapStream)
      .end()
  );

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
