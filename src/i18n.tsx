import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './lang-en.yml';

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en },
  interpolation: {
    escapeValue: false,
  },
  debug: true,
});

export default i18n;
