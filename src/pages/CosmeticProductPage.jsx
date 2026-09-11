import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ChevronLeft, Minus, Plus, X } from "lucide-react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Container from "../ui/Container";
import Button from "../ui/Button";
import ScrollAnimationWrapper from "../ui/ScrollAnimationWrapper";
import { useTranslation } from "../i18n/LanguageProvider";
import { isImageRef, IMAGE_VARIANT } from "../admin/siteImages";
import { EMAIL, PHONE, SITE_URL } from "../constants/theme";
import CosmeticProductGallery from "../components/CosmeticsSection/CosmeticProductGallery";
import {
  buildCosmeticOrderMailto,
  formatProductCategoryLabels,
  formatCosmeticPriceLabel,
  getCosmeticAvailability,
  getCosmeticPriceNumber,
  getCosmeticSchemaAvailability,
  getProductImages,
  COSMETICS_ROUTE,
} from "../components/CosmeticsSection/cosmeticsShared";
import { useImageSrc } from "../hooks/useImageSrc";
import { useContent } from "../context/ContentProvider";

function resolveOgImage(image) {
  if (!image || isImageRef(image) || image.startsWith("data:")) {
    return `${SITE_URL}/og-image.jpg`;
  }
  if (image.startsWith("http")) return image;
  return `${SITE_URL}${image}`;
}

function createOrderId(productId) {
  return `NUAR-${productId}-${Date.now().toString(36).toUpperCase()}`;
}

function ProductOrderModal({ open, product, contact, onClose }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const safeQuantity = Math.max(1, Number.parseInt(String(quantity), 10) || 1);
  const availability = getCosmeticAvailability(product, safeQuantity);
  const unitPriceLabel = formatCosmeticPriceLabel(product.price, t("common.pln"));
  const unitPrice = getCosmeticPriceNumber(product.price);
  const totalLabel = unitPrice != null
    ? formatCosmeticPriceLabel(String(unitPrice * safeQuantity), t("common.pln"))
    : unitPriceLabel;
  const availabilityLabel = availability.status === "IN_STOCK"
    ? t("cosmeticsOrder.inStock")
    : availability.status === "COMING_SOON"
      ? t("cosmeticsOrder.comingSoon")
      : availability.status === "OUT_OF_STOCK"
        ? t("cosmeticsOrder.outOfStock")
        : t("cosmeticsOrder.orderRequiredShort");

  const handleQuantity = (next) => {
    setQuantity(Math.max(1, Number.parseInt(String(next), 10) || 1));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting || success) return;

    if (!name.trim()) {
      setError(t("cosmeticsOrder.nameRequired"));
      return;
    }
    if (!phone.trim()) {
      setError(t("cosmeticsOrder.phoneRequired"));
      return;
    }
    if (!Number.isInteger(safeQuantity) || safeQuantity < 1) {
      setError(t("cosmeticsOrder.quantityRequired"));
      return;
    }

    setError("");
    setIsSubmitting(true);
    const order = {
      orderId: createOrderId(product.id),
      name: name.trim(),
      phone: phone.trim(),
      quantity: safeQuantity,
      deliveryMethod,
      comment: comment.trim(),
    };

    window.location.href = buildCosmeticOrderMailto(contact?.email || EMAIL, t, product, order);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setName("");
      setPhone("");
      setQuantity(1);
      setDeliveryMethod("pickup");
      setComment("");
    }, 350);
  };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-void/85 p-3 backdrop-blur-md sm:items-center sm:p-5"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("cosmeticsOrder.title")}
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-card border border-border/60 bg-card shadow-spa-hover"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label={t("cosmeticsOrder.close")}
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-card border border-border/60 bg-surface text-stone transition hover:border-gold/40 hover:text-gold"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="border-b border-border/50 px-5 py-5 pr-16">
          <p className="section-label">{t("cosmeticsOrder.label")}</p>
          <h2 className="mt-2 font-display text-3xl text-milk">{t("cosmeticsOrder.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone">
            {t("cosmeticsOrder.payment")}
          </p>
        </div>

        {success ? (
          <div className="px-5 py-8">
            <p className="font-display text-2xl text-milk">{t("cosmeticsOrder.thanksTitle")}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone">{t("cosmeticsOrder.thanksBody")}</p>
            <Button className="mt-6 w-full" onClick={onClose}>
              {t("cosmeticsOrder.close")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                  {t("cosmeticsOrder.name")}
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="mt-2 w-full rounded-card border border-border/60 bg-surface px-3 py-3 text-sm text-milk outline-none transition placeholder:text-muted focus:border-gold/45"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                  {t("cosmeticsOrder.phone")}
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  className="mt-2 w-full rounded-card border border-border/60 bg-surface px-3 py-3 text-sm text-milk outline-none transition placeholder:text-muted focus:border-gold/45"
                />
              </label>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                {t("cosmeticsOrder.quantity")}
              </span>
              <div className="mt-2 inline-grid grid-cols-[44px_76px_44px] overflow-hidden rounded-card border border-border/60 bg-surface">
                <button
                  type="button"
                  onClick={() => handleQuantity(safeQuantity - 1)}
                  className="flex min-h-11 items-center justify-center text-stone transition hover:text-gold"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <input
                  value={safeQuantity}
                  onChange={(event) => handleQuantity(event.target.value)}
                  inputMode="numeric"
                  className="min-h-11 border-x border-border/60 bg-transparent text-center text-sm font-semibold text-milk outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleQuantity(safeQuantity + 1)}
                  className="flex min-h-11 items-center justify-center text-stone transition hover:text-gold"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                {t("cosmeticsOrder.deliveryMethod")}
              </span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {["pickup", "delivery"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setDeliveryMethod(method)}
                    className={`rounded-card border px-4 py-3 text-left text-sm transition ${
                      deliveryMethod === method
                        ? "border-gold/55 bg-gold/10 text-milk"
                        : "border-border/60 bg-surface text-stone hover:border-gold/35 hover:text-milk"
                    }`}
                  >
                    {method === "pickup" ? t("cosmeticsOrder.pickup") : t("cosmeticsOrder.delivery")}
                  </button>
                ))}
              </div>
              {deliveryMethod === "pickup" ? (
                <p className="mt-3 rounded-card border border-border/50 bg-surface/70 px-4 py-3 text-sm leading-relaxed text-stone">
                  NUAR<br />
                  {contact?.street || "ul. Świętojerska 5/7"}<br />
                  {contact?.city || "00-236 Warszawa"}
                </p>
              ) : null}
            </div>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                {t("cosmeticsOrder.comment")}
              </span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-y rounded-card border border-border/60 bg-surface px-3 py-3 text-sm text-milk outline-none transition placeholder:text-muted focus:border-gold/45"
              />
            </label>

            <div className="rounded-card border border-border/60 bg-surface/70 p-4">
              <p className="text-sm font-semibold text-milk">{product.name}</p>
              <p className="mt-2 text-sm text-stone">
                {safeQuantity} × {unitPriceLabel || "-"}
              </p>
              <p className="mt-2 text-base font-semibold text-gold">
                {t("cosmeticsOrder.total")}: {totalLabel || "-"}
              </p>
              <p className="mt-2 text-sm text-stone">{availabilityLabel}</p>
            </div>

            <p className="rounded-card border border-gold/20 bg-gold/[0.06] px-4 py-3 text-sm leading-relaxed text-stone">
              {availability.status === "IN_STOCK"
                ? t("cosmeticsOrder.inStockNotice")
                : availability.status === "COMING_SOON"
                  ? t("cosmeticsOrder.comingSoonNotice")
                  : availability.status === "OUT_OF_STOCK"
                    ? t("cosmeticsOrder.outOfStockNotice")
                    : t("cosmeticsOrder.partialNotice")}
            </p>

            {error ? <p className="text-sm text-red-200" role="alert">{error}</p> : null}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("cosmeticsOrder.sending") : t("cosmeticsOrder.submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CosmeticProductPage({ product }) {
  const { t, lang } = useTranslation();
  const { contact } = useContent();
  const [orderOpen, setOrderOpen] = useState(false);
  const { src: imageSrc } = useImageSrc(getProductImages(product)[0], { variant: IMAGE_VARIANT.full });
  const pageUrl = `${SITE_URL}${COSMETICS_ROUTE}/${product.id}`;
  const categoryLabel = formatProductCategoryLabels(t, product);
  const priceLabel = formatCosmeticPriceLabel(product.price, t("common.pln"));
  const priceValue = getCosmeticPriceNumber(product.price);
  const availability = getCosmeticAvailability(product);
  const canOrder = availability.status === "IN_STOCK";
  const stockLabel = availability.status === "COMING_SOON"
    ? t("cosmeticsOrder.comingSoon")
    : availability.stock > 0
    ? availability.isLowStock
      ? t("cosmeticsOrder.lowStock", { count: availability.stock })
      : t("cosmeticsOrder.inStock")
    : t("cosmeticsOrder.outOfStock");
  const phoneHref = `tel:${contact?.phone || PHONE}`;
  const title = t("cosmeticsProductPage.meta.title", { name: product.name });
  const description =
    product.description?.trim() ||
    t("cosmeticsProductPage.meta.descriptionFallback", { name: product.name });
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    sku: product.id,
    category: categoryLabel,
    brand: { "@type": "Brand", name: "NUAR" },
    image: resolveOgImage(imageSrc),
    offers: priceValue == null ? undefined : {
      "@type": "Offer",
      url: pageUrl,
      price: String(priceValue),
      priceCurrency: "PLN",
      availability: getCosmeticSchemaAvailability(product),
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "NUAR",
      },
    },
  };

  const navItems = [
    { label: t("nav.home"), path: "home" },
    { label: t("nav.services"), path: "services" },
    { label: t("nav.price"), path: "prices" },
    { label: t("nav.cosmetics"), to: COSMETICS_ROUTE },
    { label: t("nav.about"), path: "about" },
  ];

  return (
    <>
      <Helmet>
        <html lang={lang === "uk" ? "uk" : lang} />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={resolveOgImage(imageSrc)} />
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>

      <Header navItems={navItems} linkToHome />

      <Container className="pb-16 pt-5 sm:pt-6 lg:pt-7">
        <Link
          to={COSMETICS_ROUTE}
          className="inline-flex items-center gap-1.5 text-sm text-stone transition hover:text-gold"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {t("cosmeticsProductPage.backToCatalog")}
        </Link>

        <div className="mt-4 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <ScrollAnimationWrapper direction="left">
            <div className="card-gradient-border overflow-visible rounded-card shadow-spa">
              <CosmeticProductGallery
                product={product}
                className="min-h-[300px] w-full sm:min-h-[400px] lg:min-h-[460px]"
              />
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper direction="right" delay={0.1}>
            <div>
              <p className="section-label">{categoryLabel}</p>
              <div className="spa-divider !mx-0" />
              <h1 className="mt-4 font-display text-display-sm text-milk">{product.name}</h1>

              <dl className="mt-5 grid max-w-xl gap-3 border-y border-border/35 py-4 sm:grid-cols-4">
                {product.volume ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      {t("cosmeticsProductPage.volume")}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-gold">
                      {product.volume}
                    </dd>
                  </div>
                ) : null}
                {priceLabel ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      {t("cosmeticsProductPage.price")}
                    </dt>
                    <dd className="mt-1 text-xl font-semibold text-milk">{priceLabel}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    {t("cosmeticsProductPage.productId")}
                  </dt>
                  <dd className="mt-1 text-sm uppercase tracking-[0.08em] text-stone">{product.id}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    {t("cosmeticsProductPage.stock")}
                  </dt>
                  <dd className="mt-1 text-sm uppercase tracking-[0.08em] text-stone">{availability.stock}</dd>
                </div>
              </dl>

              <p className={`mt-4 inline-flex rounded-pill border px-4 py-2 text-sm font-semibold ${
                availability.status === "IN_STOCK"
                  ? "border-gold/30 bg-gold/[0.08] text-gold"
                  : availability.status === "COMING_SOON"
                    ? "border-gold/30 bg-gold/[0.08] text-gold"
                    : "border-border/60 bg-surface/70 text-stone"
              }`}>
                {stockLabel}
              </p>

              {product.description ? (
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone">{product.description}</p>
              ) : null}

              {product.composition ? (
                <div className="mt-8 rounded-card border border-border/40 bg-surface/60 p-5">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                    {t("cosmetics.compositionLabel")}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{product.composition}</p>
                </div>
              ) : null}

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.12em] text-stone/80">
                {t("cosmetics.availableAtStudio")}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                {canOrder ? (
                  <Button onClick={() => setOrderOpen(true)} size="lg">
                    {t("cosmeticsOrder.orderCta")}
                  </Button>
                ) : null}
                <Button href={phoneHref} variant="secondary" size="lg">
                  {t("cosmeticsProductPage.contactPhone")}
                </Button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </Container>

      <Footer navItems={navItems} linkToHome />
      <ProductOrderModal
        open={orderOpen}
        product={product}
        contact={contact}
        onClose={() => setOrderOpen(false)}
      />
    </>
  );
}
