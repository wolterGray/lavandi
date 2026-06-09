import heroVariants from "../data/heroVariants.json";
import homeBanner from "../data/homeBanner.json";

const STORAGE_KEY = "nuar_hero_variant";

export function resolveHeroBanner() {
  let variant = sessionStorage.getItem(STORAGE_KEY);

  if (!variant) {
    variant = Math.random() < 0.5 ? "A" : "B";
    sessionStorage.setItem(STORAGE_KEY, variant);

    if (typeof window.gtag === "function") {
      window.gtag("event", "hero_variant_assigned", {
        variant,
        send_to: "G-NYM3P4FJJE",
      });
    }
  }

  return heroVariants[variant] ?? homeBanner;
}

export function getActiveHeroVariant() {
  return sessionStorage.getItem(STORAGE_KEY) ?? "A";
}
