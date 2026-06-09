import { useEffect, useRef, useState } from "react";
import { useTranslation, LANGUAGES } from "../i18n/LanguageProvider";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectLang = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("lang.switcher")}
        className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-graphite/60 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-champagne transition hover:border-white/15"
      >
        <img src={current.icon} alt="" className="h-3.5 w-3.5 rounded-sm" aria-hidden="true" />
        <span>{current.label}</span>
        <svg
          className={`h-3 w-3 text-muted transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("lang.switcher")}
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[88px] overflow-hidden rounded-xl border border-white/[0.08] bg-graphite/95 py-1 shadow-xl backdrop-blur-md"
        >
          {LANGUAGES.map(({ code, label, icon }) => {
            const active = lang === code;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => selectLang(code)}
                  className={[
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider transition",
                    active ? "bg-champagne/10 text-champagne" : "text-stone hover:bg-white/[0.04] hover:text-milk",
                  ].join(" ")}
                >
                  <img src={icon} alt="" className="h-3.5 w-3.5 rounded-sm" aria-hidden="true" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
