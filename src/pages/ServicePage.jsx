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
import { getDiscountedPrice } from "../utils/serviceUtils";
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
    const finalPrice = getDiscountedPrice(base, service.discount);
    return { minutes, base, finalPrice };
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

      <Container className="pb-20 pt-10 sm:pt-12 lg:pt-14">
        <div className="mb-6 sm:mb-8">
          <PageNav />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(440px,1fr)] lg:items-start xl:gap-12">
          <ScrollAnimationWrapper direction="left">
            <div className="card-gradient-border overflow-hidden rounded-card shadow-spa">
              <SiteImage
                src={service.img}
                alt={service.title}
                wrapperClassName="aspect-[4/3] w-full max-h-[520px] sm:aspect-[16/11] lg:aspect-[5/4]"
                className="h-full w-full object-cover"
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

              {service.discount > 0 && (
                <p className="mt-6 inline-flex w-fit rounded-pill border border-gold/25 bg-gold/[0.08] px-4 py-2 text-sm font-bold text-gold">
                  {t("servicePage.discount", { percent: service.discount })}
                </p>
              )}

              <div className="mt-5 overflow-hidden rounded-card border border-border/60">
                <div className="border-b border-border/60 px-4 py-2.5">
                  <h2 className="font-display text-xl text-milk">{t("servicePage.priceList")}</h2>
                </div>
                <ul className="grid divide-y divide-border/60 md:grid-cols-5 md:divide-x md:divide-y-0">
                  {priceRows.map(({ minutes, base, finalPrice }) => (
                    <li key={minutes} className="flex items-center justify-between gap-4 px-4 py-3 text-sm md:block md:px-3 md:py-3.5">
                      <span className="text-stone">{minutes} {t("common.min")}</span>
                      <span className="text-right md:mt-1 md:block md:text-left">
                        {service.discount > 0 && <span className="mr-2 text-muted line-through md:mr-1 md:block">{formatPrice(base)}</span>}
                        <span className="font-bold text-gold">{formatPrice(finalPrice)}</span>
                      </span>
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
