import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Container from "../ui/Container";
import BookVisitButton from "../ui/BookVisitButton";
import ScrollAnimationWrapper from "../ui/ScrollAnimationWrapper";
import { useTranslation } from "../i18n/LanguageProvider";
import { isImageRef } from "../admin/siteImages";
import { SITE_URL } from "../constants/theme";

function resolveOgImage(image) {
  if (!image || isImageRef(image) || image.startsWith("data:")) {
    return `${SITE_URL}/og-image.jpg`;
  }
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image}`;
}
import { getDiscountedPrice } from "../utils/serviceUtils";
import { COSMETICS_ROUTE } from "../components/CosmeticsSection/cosmeticsShared";

function PageNav() {
  const { t } = useTranslation();
  const linkClass = "cursor-pointer text-sm text-stone transition hover:text-gold";

  return (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label={t("servicePage.navLabel")}>
      <Link to="/#services" className={linkClass}>{t("servicePage.backToServices")}</Link>
      <span className="text-muted" aria-hidden="true">·</span>
      <Link to="/" className={linkClass}>{t("common.backHome")}</Link>
    </nav>
  );
}

export default function ServicePage({ service }) {
  const { t, lang } = useTranslation();
  const pageUrl = `${SITE_URL}/uslugi/${service.slug}`;

  const navItems = [
    { label: t("nav.home"), path: "home" },
    { label: t("nav.services"), path: "services" },
    { label: t("nav.price"), path: "prices" },
    { label: t("nav.cosmetics"), to: COSMETICS_ROUTE },
    { label: t("nav.about"), path: "about" },
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
        <meta property="og:image" content={resolveOgImage(service.img)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.desc,
            provider: { "@type": "LocalBusiness", name: "NUAR", url: SITE_URL },
            areaServed: "Warszawa",
            image: resolveOgImage(service.img),
          })}
        </script>
      </Helmet>

      <Header navItems={navItems} linkToHome />

      <Container className="pb-20 pt-28 lg:pt-36">
        <PageNav />

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <ScrollAnimationWrapper direction="left">
            <div className="card-gradient-border overflow-hidden rounded-card shadow-spa">
              <img src={service.img} alt={service.title} className="aspect-[4/3] w-full object-cover" />
            </div>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <div>
              <p className="section-label">{t("servicePage.location")}</p>
              <div className="spa-divider !mx-0" />
              <h1 className="mt-4 font-display text-display-sm text-milk">{service.title}</h1>
              <p className="mt-5 text-base leading-relaxed text-stone">{service.desc}</p>
              {service.discount > 0 && (
                <p className="mt-4 text-sm font-bold text-gold">{t("servicePage.discount", { percent: service.discount })}</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <BookVisitButton size="lg">{t("servicePage.book")}</BookVisitButton>
                <Link to="/#services" className="inline-flex min-h-[52px] items-center justify-center rounded-pill border border-border/20 px-8 text-xs font-bold uppercase tracking-[0.12em] text-milk transition hover:border-gold hover:text-gold">
                  {t("servicePage.backToServices")}
                </Link>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>

        <section className="card-gradient-border mt-16 overflow-hidden rounded-card bg-surface p-6 shadow-spa sm:p-8">
          <ScrollAnimationWrapper>
            <h2 className="font-display text-2xl text-milk">{t("servicePage.priceList")}</h2>
          </ScrollAnimationWrapper>
          <ul className="mt-6 divide-y divide-spa-brown/10">
            {service.time.map((minutes, index) => {
              const base = service.price[index];
              const finalPrice = getDiscountedPrice(base, service.discount);
              return (
                <li key={minutes}>
                  <ScrollAnimationWrapper delay={index * 0.06} className="flex justify-between py-4 text-sm sm:text-base">
                    <span className="text-stone">{minutes} {t("common.min")}</span>
                    <span>
                      {service.discount > 0 && <span className="mr-2 text-muted line-through">{formatPrice(base)}</span>}
                      <span className="font-bold text-gold">{formatPrice(finalPrice)}</span>
                    </span>
                  </ScrollAnimationWrapper>
                </li>
              );
            })}
          </ul>
        </section>

        <ScrollAnimationWrapper className="mt-10 border-t border-border/10 pt-8">
          <PageNav />
        </ScrollAnimationWrapper>
      </Container>

      <Footer navItems={navItems} linkToHome />
    </>
  );
}
