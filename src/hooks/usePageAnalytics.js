import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { configureAnalytics, resolveGaId, trackPageView } from "../utils/analytics";

export function usePageAnalytics(siteSettings) {
  const location = useLocation();
  const gaId = resolveGaId(siteSettings);

  useEffect(() => {
    if (!gaId) return;
    configureAnalytics(gaId);
  }, [gaId]);

  useEffect(() => {
    if (!gaId) return;
    const path = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(path, document.title, gaId);
  }, [gaId, location.pathname, location.search, location.hash]);
}
