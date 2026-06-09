import services from "../data/services.json";

export function getServiceBySlug(slug) {
  return services.find((service) => service.slug === slug) ?? null;
}

export function getDiscountedPrice(price, discount = 0) {
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

export function formatPricePln(value) {
  return `${value} zł`;
}

export { services as allServices };
