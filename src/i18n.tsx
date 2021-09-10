import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, es } from './assets/i18n';

const resources = {
  en,
  es
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    keySeparator: '.',
    interpolation: {
      escapeValue: false // react already safes from xss, TODO: strategy to eliminate repo use of DangerouslySetInnerHTML
    }
  });

  export default i18n;