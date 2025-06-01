const {writeFileSync} = require("fs");
const path = require("path");
const {SitemapStream, streamToPromise} = require("sitemap");
const {createGzip} = require("zlib");
const generateRobotstxt = require("generate-robotstxt");

async function generateSitemap() {
  // Укажи базовый URL
  const baseUrl = "https://lavandi.pl";

  // Пути сайта, которые хочешь включить
  const links = [
    {url: "/", changefreq: "daily", priority: 1.0},
    {url: "/o-nas", changefreq: "weekly", priority: 0.8},
    {url: "/kontakt", changefreq: "monthly", priority: 0.7},
    // Добавляй остальные страницы по необходимости
  ];

  const sitemapStream = new SitemapStream({hostname: baseUrl});

  const xml = await streamToPromise(
    links
      .reduce((stream, link) => stream.write(link) && stream, sitemapStream)
      .end()
  );

  const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
  writeFileSync(sitemapPath, xml.toString());
  console.log("Sitemap сгенерирован:", sitemapPath);
}

async function generateRobots() {
  const content = await generateRobotstxt({
    policy: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://lavandi.pl/sitemap.xml",
    host: "https://lavandi.pl",
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
