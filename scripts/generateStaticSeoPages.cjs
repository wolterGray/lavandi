const { mkdirSync, readFileSync, writeFileSync, existsSync } = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = "https://nuarr.pl";
const HOME_TITLE = "Masaż Warszawa – NUAR | Masaż premium w centrum Warszawy";
const HOME_DESCRIPTION =
  "Masaż premium w centrum Warszawy przy ul. Świętojerskiej 5/7. Wybierz masaż klasyczny, relaksacyjny, sportowy lub rytuał dla dwojga i zarezerwuj online.";

function loadJson(relativePath) {
  return JSON.parse(readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function loadEnvFile(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function loadSeoContent() {
  loadEnvFile(".env.production");
  loadEnvFile(".env");
  loadEnvFile(".env.local");

  const fallback = {
    services: loadJson("src/data/services.json"),
    cosmetics: loadJson("src/data/cosmetics.json"),
    productTexts: {},
  };
  const backendUrl = String(process.env.VITE_CRM_BACKEND_URL || "").replace(/\/$/, "");
  if (!backendUrl) return fallback;

  try {
    const response = await fetch(`${backendUrl}/api/public/site-content`);
    if (!response.ok) return fallback;
    const overrides = (await response.json())?.data?.overrides;
    return {
      services: Array.isArray(overrides?.services) && overrides.services.length ? overrides.services : fallback.services,
      cosmetics: Array.isArray(overrides?.cosmetics) && overrides.cosmetics.length ? overrides.cosmetics : fallback.cosmetics,
      productTexts:
        overrides?.locales?.pl?.cosmeticsProducts?.products ||
        overrides?.locales?.pl?.cosmetics?.products ||
        {},
    };
  } catch (error) {
    console.warn(`SEO prerender: CRM content unavailable (${error.message}); using local fallback`);
    return fallback;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function absoluteUrl(value) {
  if (!value || String(value).startsWith("dbimg:") || String(value).startsWith("data:")) {
    return `${SITE_URL}/og-image.jpg`;
  }
  return String(value).startsWith("http") ? value : `${SITE_URL}${value}`;
}

function jsonLd(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function replaceHead(html, { title, description, canonical, image, robots = "index,follow", schema }) {
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(image || `${SITE_URL}/og-image.jpg`)}">`,
    `<meta property="og:locale" content="pl_PL">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    schema ? `<script type="application/ld+json">${jsonLd(schema)}</script>` : "",
  ].filter(Boolean).join("\n  ");

  return html
    .replace('<html lang="en">', '<html lang="pl">')
    .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta\s+name="description"[\s\S]*?>/i, "")
    .replace(/\s*<meta\s+name="robots"[\s\S]*?>/i, "")
    .replace(/\s*<link\s+rel="canonical"[\s\S]*?>/i, "")
    .replace(/\s*<meta\s+property="og:[\s\S]*?>/gi, "")
    .replace(/\s*<meta\s+name="twitter:[\s\S]*?>/gi, "")
    .replace("</head>", `  ${tags}\n</head>`);
}

function fallbackMarkup({ eyebrow = "NUAR · Warszawa", heading, text, links = [] }) {
  return `<main id="seo-fallback" style="min-height:100vh;background:#08060c;color:#e5dfd8;padding:clamp(32px,8vw,96px);font-family:Arial,sans-serif">
    <div style="max-width:960px;margin:0 auto">
      <p style="color:#b8956b;text-transform:uppercase;letter-spacing:.14em">${escapeHtml(eyebrow)}</p>
      <h1 style="max-width:850px;font-size:clamp(36px,6vw,72px);line-height:1.05;margin:24px 0">${escapeHtml(heading)}</h1>
      <p style="max-width:720px;color:#b8ada8;font-size:18px;line-height:1.7">${escapeHtml(text)}</p>
      ${links.length ? `<nav aria-label="Najważniejsze strony" style="display:flex;flex-wrap:wrap;gap:20px;margin-top:32px">${links.map(({ href, label }) => `<a href="${escapeHtml(href)}" style="color:#d6bb7d">${escapeHtml(label)}</a>`).join("")}</nav>` : ""}
    </div>
  </main>`;
}

function renderPage(template, config) {
  return replaceHead(template, config).replace('<div id="root"></div>', `<div id="root">${config.markup}</div>`);
}

function writeRoute(route, html) {
  const target = route === "/" ? path.join(DIST, "index.html") : path.join(DIST, `${route.replace(/^\//, "")}.html`);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, html);
}

function productText(product, productTexts) {
  const pl = product?.texts?.pl || product?.pl || {};
  const cms = productTexts?.[product.id] || {};
  return {
    name: cms.name || pl.name || product.name || product.title || `Produkt ${product.id}`,
    description: cms.description || pl.description || product.description || "Produkt dostępny w studio NUAR w centrum Warszawy.",
  };
}

async function main() {
  const templatePath = path.join(DIST, "index.html");
  if (!existsSync(templatePath)) throw new Error("dist/index.html does not exist; run Vite first");
  const template = readFileSync(templatePath, "utf8");
  const { services, cosmetics, productTexts } = await loadSeoContent();
  const serviceLinks = services.map((service) => ({ href: `/uslugi/${service.slug}`, label: service.title }));

  writeRoute("/", renderPage(template, {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonical: `${SITE_URL}/`,
    markup: fallbackMarkup({
      heading: "Profesjonalny masaż w Warszawie — NUAR Massage",
      text: HOME_DESCRIPTION,
      links: [...serviceLinks, { href: "/booking", label: "Rezerwacja online" }, { href: "/katalog", label: "Katalog" }],
    }),
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "NUAR Massage",
      url: SITE_URL,
      image: `${SITE_URL}/og-image.jpg`,
      telephone: "+48 452 402 006",
      address: {
        "@type": "PostalAddress",
        streetAddress: "ul. Świętojerska 5/7",
        postalCode: "00-236",
        addressLocality: "Warszawa",
        addressCountry: "PL",
      },
    },
  }));

  for (const service of services) {
    const canonical = `${SITE_URL}/uslugi/${service.slug}`;
    writeRoute(`/uslugi/${service.slug}`, renderPage(template, {
      title: service.seoTitle || `${service.title} – NUAR Warszawa`,
      description: service.seoDescription || service.desc,
      canonical,
      image: absoluteUrl(service.img),
      markup: fallbackMarkup({
        eyebrow: "Usługi masażu · NUAR Warszawa",
        heading: service.title,
        text: service.desc,
        links: [{ href: "/booking", label: "Zarezerwuj wizytę" }, { href: "/#services", label: "Wszystkie masaże" }],
      }),
      schema: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.title,
        description: service.desc,
        url: canonical,
        image: absoluteUrl(service.img),
        areaServed: "Warszawa",
        provider: { "@type": "LocalBusiness", name: "NUAR Massage", url: SITE_URL },
      },
    }));
  }

  const catalogTitle = "Katalog produktów – NUAR Warszawa | Wellness i aromaterapia";
  const catalogDescription = "Kosmetyki, olejki, świece, aromaterapia i produkty do domowych rytuałów dostępne w studio NUAR w Warszawie.";
  writeRoute("/katalog", renderPage(template, {
    title: catalogTitle,
    description: catalogDescription,
    canonical: `${SITE_URL}/katalog`,
    markup: fallbackMarkup({ heading: "Katalog produktów NUAR", text: catalogDescription, links: [{ href: "/", label: "Strona główna" }] }),
  }));

  for (const product of cosmetics) {
    if (!product?.id) continue;
    const copy = productText(product, productTexts);
    const canonical = `${SITE_URL}/katalog/${product.id}`;
    writeRoute(`/katalog/${product.id}`, renderPage(template, {
      title: `${copy.name} – Katalog NUAR Warszawa`,
      description: copy.description,
      canonical,
      image: absoluteUrl(product.image || product.img || product.images?.[0]),
      markup: fallbackMarkup({
        eyebrow: "Katalog NUAR",
        heading: copy.name,
        text: copy.description,
        links: [{ href: "/katalog", label: "Wróć do katalogu" }],
      }),
    }));
  }

  writeRoute("/booking", renderPage(template, {
    title: "Rezerwacja online – NUAR Massage Warszawa",
    description: "Wybierz masaż, specjalistę oraz dogodny termin wizyty w NUAR Massage w Warszawie.",
    canonical: `${SITE_URL}/booking`,
    robots: "noindex,follow",
    markup: fallbackMarkup({ heading: "Rezerwacja wizyty w NUAR", text: "Wybierz specjalistę, masaż i dogodny termin wizyty." }),
  }));

  writeFileSync(path.join(DIST, "404.html"), renderPage(template, {
    title: "Strona nie została znaleziona – NUAR",
    description: "Żądana strona nie istnieje.",
    canonical: `${SITE_URL}/404`,
    robots: "noindex,nofollow",
    markup: fallbackMarkup({ heading: "Strona nie została znaleziona", text: "Sprawdź adres lub wróć na stronę główną.", links: [{ href: "/", label: "Strona główna" }] }),
  }));

  console.log(`SEO prerender: home, booking, catalog, ${services.length} services, ${cosmetics.length} products`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
