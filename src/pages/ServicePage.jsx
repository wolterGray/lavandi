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
  const minFinalPrice = Math.min(...priceRows.map((item) => item.finalPrice));
  const minDuration = Math.min(...service.time);
  const maxDuration = Math.max(...service.time);

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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:items-start xl:gap-14">
          <ScrollAnimationWrapper direction="left">
            <div className="card-gradient-border h-full overflow-hidden rounded-card shadow-spa">
              <SiteImage
                src={service.img}
                alt={service.title}
                wrapperClassName="h-full min-h-[360px] w-full sm:min-h-[460px] lg:min-h-[560px] xl:min-h-[610px]"
                className="h-full w-full object-cover"
              />
            </div>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <div className="rounded-card border border-border/50 bg-surface/70 p-6 shadow-spa sm:p-8 lg:p-10">
              <div>
                <p className="section-label">{t("servicePage.location")}</p>
                <div className="spa-divider !mx-0 !my-5" />
                <h1 className="max-w-xl font-display text-[2.35rem] leading-[1.04] text-milk sm:text-display-lg">
                  {service.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone sm:text-lg">
                  {service.desc}
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-card border border-border/60 bg-void/35 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                    {t("booking.form.duration")}
                  </p>
                  <p className="mt-2 font-display text-2xl leading-none text-milk">
                    {minDuration === maxDuration ? minDuration : `${minDuration}-${maxDuration}`} {t("common.min")}
                  </p>
                </div>
                <div className="rounded-card border border-gold/25 bg-gold/[0.06] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                    {t("servicePage.priceList")}
                  </p>
                  <p className="mt-2 font-display text-2xl leading-none text-gold">
                    {t("common.from")} {formatPrice(minFinalPrice)}
                  </p>
                </div>
              </div>

              {service.discount > 0 && (
                <p className="mt-5 inline-flex w-fit rounded-pill border border-gold/25 bg-gold/[0.08] px-4 py-2 text-sm font-bold text-gold">
                  {t("servicePage.discount", { percent: service.discount })}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <BookVisitButton size="lg" className="w-full sm:w-auto">
                  {t("servicePage.book")}
                </BookVisitButton>
                <Link to="/#services" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-pill border border-border/60 px-7 font-display text-xs font-bold uppercase tracking-[0.18em] text-milk transition duration-300 hover:border-gold/60 hover:bg-gold/[0.06] hover:text-gold sm:w-auto">
                  {t("servicePage.backToServices")}
                </Link>
              </div>

              <div className="mt-8 overflow-hidden rounded-card border border-border/60">
                <ul className="divide-y divide-border/60">
                  {priceRows.slice(0, 3).map(({ minutes, base, finalPrice }) => (
                    <li key={minutes} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                      <span className="text-stone">{minutes} {t("common.min")}</span>
                      <span className="text-right">
                        {service.discount > 0 && <span className="mr-2 text-muted line-through">{formatPrice(base)}</span>}
                        <span className="font-bold text-gold">{formatPrice(finalPrice)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>

        <section className="card-gradient-border mt-12 overflow-hidden rounded-card bg-surface p-6 shadow-spa sm:p-8 lg:mt-14">
          <ScrollAnimationWrapper>
            <h2 className="font-display text-2xl text-milk">{t("servicePage.priceList")}</h2>
          </ScrollAnimationWrapper>
          <ul className="mt-6 divide-y divide-spa-brown/10">
            {priceRows.map(({ minutes, base, finalPrice }, index) => {
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
