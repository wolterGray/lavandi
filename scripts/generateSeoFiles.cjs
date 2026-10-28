const { writeFileSync } = require("fs");
const { execFileSync } = require("child_process");
const path = require("path");
const { SitemapStream, streamToPromise } = require("sitemap");
const generateRobotstxt = require("generate-robotstxt");
const { readSnapshot } = require("./seoBuildData.cjs");

const BASE_URL = "https://nuarr.pl";
const ROOT = path.resolve(__dirname, "..");

function gitLastModified(relativePath) {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cI", "--", relativePath], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim() || undefined;
  } catch {
    return undefined;
  }
}

async function generateSitemap(snapshot) {
  const pageLastmod = snapshot.updatedAt || gitLastModified("src");
  const servicesLastmod = snapshot.sectionUpdatedAt.services || pageLastmod;
  const cosmeticsLastmod = snapshot.sectionUpdatedAt.cosmetics || pageLastmod;
  const privacyLastmod = gitLastModified("public/polityka-prywatnosci.html") || pageLastmod;
  const links = [
    { url: "/", changefreq: "weekly", priority: 1, lastmod: pageLastmod },
    { url: "/katalog", changefreq: "weekly", priority: 0.9, lastmod: cosmeticsLastmod },
    { url: "/polityka-prywatnosci.html", changefreq: "yearly", priority: 0.3, lastmod: privacyLastmod },
    ...snapshot.services.map((service) => ({
      url: `/uslugi/${service.slug}`,
      changefreq: "monthly",
      priority: 0.8,
      lastmod: servicesLastmod,
    })),
    ...snapshot.cosmetics.map((product) => ({
      url: `/katalog/${product.id}`,
      changefreq: "weekly",
      priority: 0.75,
      lastmod: cosmeticsLastmod,
    })),
  ];

  const sitemap = new SitemapStream({ hostname: BASE_URL });
  links.forEach((link) => sitemap.write(link));
  sitemap.end();
  writeFileSync(path.join(ROOT, "public/sitemap.xml"), (await streamToPromise(sitemap)).toString());
  console.log(`generate-seo: sitemap contains ${links.length} URLs from ${snapshot.source}`);
}

async function generateRobots() {
  const content = await generateRobotstxt({
    policy: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/club/"] }],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  });
  writeFileSync(path.join(ROOT, "public/robots.txt"), content);
}

async function main() {
  const snapshot = readSnapshot();
  await generateSitemap(snapshot);
  await generateRobots();
}

main().catch((error) => {
  console.error("generate-seo: fatal error", error);
  process.exit(1);
});
