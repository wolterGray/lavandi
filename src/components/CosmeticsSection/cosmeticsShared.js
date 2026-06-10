import cosmeticsBase from "../../data/cosmetics.json";

export const PLACEHOLDER_GRADIENTS = [
  "bg-[radial-gradient(ellipse_at_25%_15%,rgba(184,149,107,0.28)_0%,transparent_52%),radial-gradient(ellipse_at_85%_90%,rgba(12,10,16,0.75)_0%,transparent_58%)]",
  "bg-[radial-gradient(ellipse_at_70%_20%,rgba(154,132,88,0.22)_0%,transparent_50%),radial-gradient(ellipse_at_15%_85%,rgba(8,6,12,0.8)_0%,transparent_55%)]",
  "bg-[radial-gradient(ellipse_at_40%_30%,rgba(184,149,107,0.18)_0%,transparent_48%),radial-gradient(ellipse_at_90%_70%,rgba(26,21,32,0.65)_0%,transparent_60%)]",
  "bg-[radial-gradient(ellipse_at_20%_75%,rgba(150,112,72,0.2)_0%,transparent_50%),radial-gradient(ellipse_at_80%_25%,rgba(12,10,16,0.7)_0%,transparent_55%)]",
  "bg-[radial-gradient(ellipse_at_55%_10%,rgba(184,149,107,0.24)_0%,transparent_45%),radial-gradient(ellipse_at_30%_95%,rgba(8,6,12,0.85)_0%,transparent_58%)]",
  "bg-[radial-gradient(ellipse_at_65%_60%,rgba(154,132,88,0.16)_0%,transparent_52%),radial-gradient(ellipse_at_10%_30%,rgba(16,14,20,0.7)_0%,transparent_55%)]",
];

export const CATEGORY_KEYS = ["all", "oils", "balms", "creams", "scrubs", "aroma", "home"];

export const FEATURED_PRODUCT_IDS = [
  "rose-body-oil",
  "magnesium-balm",
  "velvet-body-cream",
  "eucalyptus-mist",
];

export const COSMETICS_ROUTE = "/katalog";

export function getLocalizedProducts(t) {
  return cosmeticsBase.map((product) => ({
    ...product,
    name: t(`cosmetics.products.${product.id}.name`),
    brand: t(`cosmetics.products.${product.id}.brand`),
    tagline: t(`cosmetics.products.${product.id}.tagline`),
  }));
}

export function getFeaturedProducts(t) {
  const products = getLocalizedProducts(t);
  return FEATURED_PRODUCT_IDS.map((id) => products.find((product) => product.id === id)).filter(Boolean);
}
