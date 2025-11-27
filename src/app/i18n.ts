import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import tr from "../locales/tr.json";
import en from "../locales/en.json";

const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: tr,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "tr", // default language
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

