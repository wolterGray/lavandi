import { useEffect, useState } from "react";
import Button from "./Button";
import { useTranslation } from "../i18n/LanguageProvider";
import { BOOKSY_URL } from "../constants/theme";

export default function StickyCta() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/10 bg-surface/95 shadow-spa backdrop-blur-md md:hidden" role="region" aria-label={t("sticky.ariaLabel")}>
      <div className="flex items-center gap-3 px-5 py-3">
        <p className="min-w-0 flex-1 text-xs leading-snug text-stone">{t("sticky.text")}</p>
        <Button href={BOOKSY_URL} size="sm">{t("sticky.cta")}</Button>
      </div>
    </div>
  );
}
