import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { useTranslation } from "../i18n/LanguageProvider";
import { BOOKSY_URL, SITE_URL } from "../constants/theme";
import { getDiscountedPrice } from "../utils/serviceUtils";

function PageNav() {
  const { t } = useTranslation();
  const linkClass = "cursor-pointer text-sm text-stone transition hover:text-milk";

  return (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label={t("servicePage.navLabel")}>
      <Link to="/#services" className={linkClass}>
        {t("servicePage.backToServices")}
      </Link>
      <span className="text-muted" aria-hidden="true">·</span>
      <Link to="/" className={linkClass}>
        {t("common.backHome")}
      </Link>
    </nav>
  );
}

export default function ServicePage({ service }) {
  const { t, lang } = useTranslation();
  const pageUrl = `${SITE_URL}/uslugi/${service.slug}`;

  const navItems = [
    { label: t("nav.rituals"), path: "signature" },
    { label: t("nav.about"), path: "about" },
    { label: t("nav.contact"), path: "contact" },
  ];

  const formatPrice = (value) => `${value} ${t("common.pln")}`;

  return (
    <>
      <Helmet>
        <html lang={lang === "uk" ? "uk" : lang} />
        <title>{service.seoTitle}</title>
        <meta name="description" content={service.seoDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={service.seoTitle} />
        <meta property="og:description" content={service.seoDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${SITE_URL}${service.img}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.desc,
            provider: { "@type": "LocalBusiness", name: "NUAR", url: SITE_URL },
            areaServed: "Warszawa",
            image: `${SITE_URL}${service.img}`,
          })}
        </script>
      </Helmet>

      <Header navItems={navItems} linkToHome />

      <Container className="pb-20 pt-28">
        <PageNav />

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
            <img src={service.img} alt={service.title} className="aspect-[4/3] w-full object-cover" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">{t("servicePage.location")}</p>
            <h1 className="mt-3 font-display text-display-sm text-milk">{service.title}</h1>
            <p className="mt-5 text-base leading-relaxed text-stone">{service.desc}</p>
            {service.discount > 0 && (
              <p className="mt-4 text-sm text-gold">{t("servicePage.discount", { percent: service.discount })}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={BOOKSY_URL} size="lg">
                {t("servicePage.book")}
              </Button>
              <Link to="/#services" className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/20 px-8 text-sm font-medium tracking-wide text-milk transition hover:border-white/40 hover:bg-white/[0.03]">
                {t("servicePage.backToServices")}
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-16 rounded-2xl border border-white/[0.06] bg-graphite p-6 sm:p-8">
          <h2 className="font-display text-2xl text-milk">{t("servicePage.priceList")}</h2>
          <ul className="mt-6 divide-y divide-white/[0.06]">
            {service.time.map((minutes, index) => {
              const base = service.price[index];
              const finalPrice = getDiscountedPrice(base, service.discount);
              return (
                <li key={minutes} className="flex justify-between py-4 text-sm sm:text-base">
                  <span className="text-stone">{minutes} {t("common.min")}</span>
                  <span>
                    {service.discount > 0 && (
                      <span className="mr-2 text-muted line-through">{formatPrice(base)}</span>
                    )}
                    <span className="text-champagne">{formatPrice(finalPrice)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="mt-10 border-t border-white/[0.06] pt-8">
          <PageNav />
        </div>
      </Container>

      <Footer navItems={navItems} linkToHome />
    </>
  );
}
