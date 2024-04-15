import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './lang-en.yml';
import id from './lang-id.yml';

i18n.use(initReactI18next).init({
  fallbackLng: ['en', 'id'],
  resources: { en, id },
  interpolation: {
    escapeValue: false,
  },
  debug: true,
});

export default i18n;
