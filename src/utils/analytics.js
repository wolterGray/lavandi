export const DEFAULT_GA_ID = import.meta.env.VITE_GA_ID || "G-NYM3P4FJJE";

export function resolveGaId(siteSettings) {
  if (siteSettings?.analyticsEnabled === false) return null;
  const configured = siteSettings?.googleAnalyticsId?.trim();
  return configured || DEFAULT_GA_ID;
}

export function hasAnalyticsConsent() {
  try {
    return localStorage.getItem("nuar_consent") === "granted";
  } catch {
    return false;
  }
}

export function trackPageView(path, title, gaId) {
  if (!gaId || !window.gtag || !hasAnalyticsConsent()) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    send_to: gaId,
  });
}

export function configureAnalytics(gaId) {
  if (!gaId || !window.gtag) return;
  window.gtag("config", gaId, { send_page_view: false });
}
