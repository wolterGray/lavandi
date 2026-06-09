import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./locales/en.json";
import pl from "./locales/pl.json";
import uk from "./locales/uk.json";
import servicesBase from "../data/services.json";

const STORAGE_KEY = "nuar_lang";
export const LANGUAGES = [
  { code: "en", label: "EN", icon: "/lang-icon/en.svg" },
  { code: "pl", label: "PL", icon: "/lang-icon/pl.svg" },
  { code: "uk", label: "UA", icon: "/lang-icon/ua.svg" },
];

const messages = { en, pl, uk };

const LanguageContext = createContext(null);

function getNested(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function interpolate(str, vars = {}) {
  if (typeof str !== "string") return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`
  );
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((l) => l.code === saved) ? saved : "en";
  });

  const setLang = useCallback((code) => {
    if (!messages[code]) return;
    localStorage.setItem(STORAGE_KEY, code);
    setLangState(code);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "uk" ? "uk" : lang;
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const value = getNested(messages[lang], key) ?? getNested(messages.en, key);
      if (typeof value === "string") return interpolate(value, vars);
      return value;
    },
    [lang]
  );

  const localizedServices = useMemo(
    () =>
      servicesBase.map((service) => ({
        ...service,
        title: t(`servicesItems.${service.slug}.title`),
        desc: t(`servicesItems.${service.slug}.desc`),
        seoTitle: t(`servicesItems.${service.slug}.seoTitle`),
        seoDescription: t(`servicesItems.${service.slug}.seoDescription`),
      })),
    [t]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, localizedServices }),
    [lang, setLang, t, localizedServices]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}

export function getLocalizedService(slug, lang = "en") {
  const base = servicesBase.find((s) => s.slug === slug);
  if (!base) return null;
  const msg = messages[lang] ?? messages.en;
  const item = msg.servicesItems?.[slug];
  return {
    ...base,
    title: item?.title ?? base.title,
    desc: item?.desc ?? base.desc,
    seoTitle: item?.seoTitle ?? base.seoTitle,
    seoDescription: item?.seoDescription ?? base.seoDescription,
  };
}
