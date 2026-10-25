import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import SiteImage from "../ui/SiteImage";
import Container from "../ui/Container";
import BookVisitButton from "../ui/BookVisitButton";
import ScrollAnimationWrapper from "../ui/ScrollAnimationWrapper";
import { useTranslation } from "../i18n/LanguageProvider";
import { isImageRef } from "../admin/siteImages";
import { SITE_URL } from "../constants/theme";
import { COSMETICS_ROUTE } from "../components/CosmeticsSection/cosmeticsShared";

function resolveOgImage(image) {
  if (!image || isImageRef(image) || image.startsWith("data:")) {
    return `${SITE_URL}/og-image.jpg`;
  }
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image}`;
}

function PageNav() {
  const { t } = useTranslation();
  const linkClass = "cursor-pointer text-sm font-medium text-stone transition hover:text-gold";

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
  const priceRows = service.time.map((minutes, index) => {
    const base = service.price[index];
    const top = service.priceTopMaster?.[index];
    return { minutes, base, top };
  });

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

      <Container className="pb-20 pt-4 sm:pt-5 lg:pt-6">
        <div className="mb-4">
          <PageNav />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(440px,1fr)] lg:items-start xl:gap-12">
          <ScrollAnimationWrapper direction="left">
            <div className="card-gradient-border overflow-hidden rounded-card shadow-spa">
              <SiteImage
                src={service.img}
                alt={service.title}
                wrapperClassName="w-full bg-card/30"
                className="block max-h-[680px] w-full object-contain"
              />
            </div>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <div className="py-2 sm:py-4 lg:py-0">
              <div>
                <p className="section-label">{t("servicePage.location")}</p>
                <div className="spa-divider !mx-0 !my-4" />
                <h1 className="max-w-xl font-display text-[2.2rem] leading-[1.04] text-milk sm:text-display-lg">
                  {service.title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone sm:text-lg">
                  {service.desc}
                </p>
              </div>

              <div className="mt-7 rounded-card border border-border/70 bg-surface/35 p-2.5 sm:p-4">
                <div className="mb-2 px-1 sm:mb-4">
                  <h2 className="font-display text-xl text-milk sm:text-2xl">{t("servicePage.priceList")}</h2>
                </div>
                <ul className="grid grid-cols-2 gap-2 sm:gap-2.5 xl:grid-cols-4">
                  {priceRows.map(({ minutes, base, top }) => (
                    <li key={minutes} className="rounded-card border border-border/70 bg-card/70 px-3 py-3 shadow-sm sm:min-h-[132px] sm:px-4 sm:py-4">
                      <span className="block text-xs font-semibold text-stone sm:text-sm">{minutes} {t("common.min")}</span>
                      <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                        {top && top !== base ? (
                          <>
                            <div>
                              <span className="block text-base font-bold leading-none text-gold sm:text-lg">{formatPrice(base)}</span>
                              <span className="mt-1 block text-[10px] leading-none text-muted sm:text-xs">{t("pricing.master") || "Master"}</span>
                            </div>
                            <div className="border-t border-border/50 pt-1.5 sm:pt-2">
                              <span className="block text-sm font-semibold leading-none text-milk sm:text-base">{formatPrice(top)}</span>
                              <span className="mt-1 block text-[10px] leading-none text-muted sm:text-xs">{t("pricing.topMaster") || "Top Master"}</span>
                            </div>
                          </>
                        ) : (
                          <span className="block text-lg font-bold text-gold">{formatPrice(base)}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <BookVisitButton size="lg" className="w-full sm:w-auto">
                  {t("servicePage.book")}
                </BookVisitButton>
                <Link to="/#services" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-pill border border-border/60 px-7 font-display text-xs font-bold uppercase tracking-[0.18em] text-milk transition duration-300 hover:border-gold/60 hover:bg-gold/[0.06] hover:text-gold sm:w-auto">
                  {t("servicePage.backToServices")}
                </Link>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>

      </Container>

      <Footer navItems={navItems} linkToHome />
    </>
  );
}
