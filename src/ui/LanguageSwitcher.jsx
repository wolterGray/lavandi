import { useEffect, useRef, useState } from "react";
import { useTranslation, LANGUAGES } from "../i18n/LanguageProvider";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("lang.switcher")}
        className="flex items-center gap-1.5 rounded-pill border border-border/15 bg-surface px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-milk transition hover:border-gold hover:text-gold"
      >
        <img src={current.icon} alt="" className="h-3.5 w-3.5 rounded-sm" aria-hidden="true" />
        <span>{current.label}</span>
        <svg className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul role="listbox" aria-label={t("lang.switcher")} className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[88px] overflow-hidden rounded-card border border-border/10 bg-surface py-1 shadow-spa">
          {LANGUAGES.map(({ code, label, icon }) => (
            <li key={code} role="option" aria-selected={lang === code}>
              <button
                type="button"
                onClick={() => { setLang(code); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider transition ${lang === code ? "bg-card text-gold" : "text-stone hover:bg-card hover:text-milk"}`}
              >
                <img src={icon} alt="" className="h-3.5 w-3.5 rounded-sm" aria-hidden="true" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
