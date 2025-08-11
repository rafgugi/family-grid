import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.yml';
import id from './id.yml';

i18n.use(initReactI18next).init({
  fallbackLng: ['en', 'id'],
  resources: { en, id },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
