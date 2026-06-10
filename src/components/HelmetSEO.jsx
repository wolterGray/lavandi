import { Helmet } from "react-helmet";
import { useTranslation } from "../i18n/LanguageProvider";
import { useContent } from "../context/ContentProvider";
import { SITE_URL } from "../constants/theme";

const OG_LOCALE = { en: "en_US", pl: "pl_PL", uk: "uk_UA" };

export default function HelmetSEO() {
  const { t, lang } = useTranslation();
  const { contact, reviews } = useContent();
  const reviewCount = reviews.length;
  const title = t("meta.title");
  const description = t("meta.description");

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "NUAR",
    image: `${SITE_URL}/logo_nuar.PNG`,
    description,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.street,
      addressLocality: contact.city.replace(/^\d+-\d+\s*/, "") || "Warszawa",
      postalCode: contact.city.match(/\d+-\d+/)?.[0] ?? "00-236",
      addressCountry: "PL",
    },
    telephone: contact.phoneDisplay,
    url: SITE_URL,
    sameAs: [
      "https://www.facebook.com/nuarmassage",
      "https://www.instagram.com/nuar_massage",
    ],
    openingHours: ["Mo-Fr 09:00-22:00", "Sa 10:00-20:00"],
    priceRange: "PLN 150-400",
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: String(reviewCount),
        bestRating: "5",
      },
    }),
  };

  return (
    <Helmet>
      <html lang={lang === "uk" ? "uk" : lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:locale" content={OG_LOCALE[lang] ?? "en_US"} />
      <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
      <meta name="twitter:site" content="@nuar_massage" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
