import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const modules = import.meta.glob("./locale/*.json", { eager: true });
const resources = {};

for (const [path, module] of Object.entries(modules)) {
  const lang = path.replace("./locale/", "").replace(".json", "");
  const data = module.default || module;
  resources[lang] = {
    translation: data,
  };
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
