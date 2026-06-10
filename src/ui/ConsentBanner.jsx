import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { useTranslation } from "../i18n/LanguageProvider";

const GA_ID = "G-NYM3P4FJJE";
const LS_KEY = "nuar_consent";
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) setVisible(true);
    if (saved === "granted" && window.gtag) {
      window.gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted" });
      window.gtag("config", GA_ID);
    }
  }, []);

  useEffect(() => {
    if (!visible || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll(FOCUSABLE);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const onKeyDown = (event) => {
      if (event.key !== "Tab" || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  const accept = () => {
    localStorage.setItem(LS_KEY, "granted");
    if (window.gtag) {
      window.gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted" });
      window.gtag("config", GA_ID);
      window.gtag("event", "consent_accept", { source: "banner" });
    }
    setVisible(false);
  };

  const deny = () => {
    localStorage.setItem(LS_KEY, "denied");
    if (window.gtag) {
      window.gtag("consent", "update", { ad_storage: "denied", analytics_storage: "denied" });
      window.gtag("event", "consent_deny", { source: "banner" });
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] px-4 pb-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="consent-title" aria-describedby="consent-desc" className="mx-auto max-w-3xl rounded-card bg-surface p-5 shadow-spa-hover sm:p-6">
        <h3 id="consent-title" className="mb-2 text-sm font-bold text-milk">{t("consent.title")}</h3>
        <p id="consent-desc" className="text-sm leading-relaxed text-stone">{t("consent.description")}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={accept} size="sm">{t("consent.accept")}</Button>
          <Button onClick={deny} variant="secondary" size="sm">{t("consent.deny")}</Button>
          <a href="/polityka-prywatnosci.html" className="text-sm text-stone underline underline-offset-4 transition hover:text-gold sm:ml-auto" rel="noopener">
            {t("consent.privacy")}
          </a>
        </div>
      </div>
    </div>
  );
}
