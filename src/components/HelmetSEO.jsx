import {Helmet} from "react-helmet";

export default function HelmetSEO() {
  return (
    <Helmet>
      <title>Lavandi – Studio masażu w Warszawie</title>

      <meta
        name="description"
        content="Lavandi – Najlepszy masaż w Warszawie 🌟
Zanurz się w atmosferze relaksu i troski o siebie. W Lavandi czekają na Ciebie profesjonalne masaże, które naprawdę działają: relaksacyjny, klasyczny, sportowy, limfatyczny, antycellulitowy, masaż twarzy oraz unikalny masaż autorski, dopasowany do Twoich indywidualnych potrzeb.

Nie tylko masujemy – uwalniamy od napięcia, przywracamy równowagę i lekkość.
Umów się online i poczuj różnicę już po pierwszej wizycie.

"
      />
      <meta
        name="keywords"
        content="masaż, masaż Warszawa, masaż relaksacyjny, masaż klasyczny, limfodrenaż, masaż sportowy, masaż antycellulitowy, masaż twarzy, masaż autorski, gabinet masażu, Lavandi, Śródmieście"
      />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pl" />

      {/* Open Graph для соцсетей */}
      <meta
        property="og:title"
        content="Lavandi – Studio masażu w Warszawie | Profesjonalne masaże relaksacyjne i specjalistyczne"
      />
      <meta
        property="og:description"
        content="Profesjonalne masaże w Warszawie: relaksacyjny, klasyczny, limfodrenaż, sportowy, antycellulitowy, twarzy oraz autorski. Umów się online w Lavandi."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://lavandi.pl" />
      <meta property="og:locale" content="pl_PL" />
      <meta property="og:image" content="https://lavandi.pl/LavandiLogo.svg" />

      {/* Schema.org – микроразметка для Google */}
      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Lavandi",
          "image": "https://lavandi.pl/LavandiLogo.svg",
          "description": "Profesjonalne masaże w Warszawie: relaksacyjny, klasyczny, limfodrenaż, sportowy, antycellulitowy, twarzy oraz autorski.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "ul. Świętojerska 5/7",
            "addressLocality": "Warszawa",
            "postalCode": "00-236",
            "addressCountry": "PL"
          },
          "telephone": "+48 452 402 006",
          "url": "https://lavandi.pl",
          "sameAs": [
            "https://www.facebook.com/lavandi.warszawa",
            "https://www.instagram.com/profile.php?id=61567307305834&locale=pl_PL"
          ],
          "openingHours": "Mo-Fr 09:00-22:00, Sa 10:00-20:00"
        }
        `}
      </script>
    </Helmet>
  );
}
