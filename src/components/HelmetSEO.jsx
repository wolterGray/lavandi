import {Helmet} from "react-helmet";

export default function HelmetSEO() {
  return (
    <Helmet>
      {/* SEO Title */}
      <title>NUAR – Najlepszy masaż premium w Warszawie</title>

      {/* Meta Description (до 160 символов) */}
      

      {/* Meta Keywords (не для Google, но для других поисковиков) */}
      <meta
        name="keywords"
        content="masaż Warszawa, masaż premium, masaż relaksacyjny, masaż klasyczny, limfodrenaż, masaż sportowy, masaż antycellulitowy, masaż twarzy, masaż autorski, gabinet masażu, NUAR, Śródmieście"
      />

      {/* Индексация */}
      <meta name="robots" content="index, follow" />

      {/* Open Graph для соцсетей */}
      <meta
        property="og:title"
        content="NUAR – Najlepszy masaż premium w Warszawie"
      />
      <meta
        property="og:description"
        content="Luksusowe masaże w Warszawie: relaksacyjny, klasyczny, sportowy, limfatyczny, antycellulitowy, twarzy i autorski. Poczuj różnicę od pierwszej wizyty."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://nuarr.pl" />
      <meta property="og:locale" content="pl_PL" />
      <meta property="og:image" content="https://nuarr.pl/og-image.jpg" />

      {/* Twitter Cards (для X/Twitter) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="NUAR – Najlepszy masaż premium w Warszawie"
      />
      <meta
        name="twitter:description"
        content="Luksusowe masaże w Warszawie: relaksacyjny, klasyczny, sportowy, limfatyczny, antycellulitowy, twarzy i autorski."
      />
      <meta name="twitter:image" content="https://nuarr.pl/og-image.jpg" />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "NUAR",
          "image": "https://nuarr.pl/logo_nuar.png",
          "description": "Luksusowe masaże w Warszawie: relaksacyjny, klasyczny, sportowy, limfatyczny, antycellulitowy, twarzy i autorski.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "ul. Świętojerska 5/7",
            "addressLocality": "Warszawa",
            "postalCode": "00-236",
            "addressCountry": "PL"
          },
          "telephone": "+48 452 402 006",
          "url": "https://nuarr.pl",
          "sameAs": [
            "https://www.facebook.com/nuarmassage",
            "https://www.instagram.com/nuar_massage"
          ],
          "openingHours": [
            "Mo-Fr 09:00-22:00",
            "Sa 10:00-20:00"
          ]
        }
        `}
      </script>
    </Helmet>
  );
}
