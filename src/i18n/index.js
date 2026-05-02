import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../locales/en/translation.json';
import hiTranslation from '../locales/hi/translation.json';
import teTranslation from '../locales/te/translation.json';
import taTranslation from '../locales/ta/translation.json';
import orTranslation from '../locales/or/translation.json';

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  te: { translation: teTranslation },
  ta: { translation: taTranslation },
  or: { translation: orTranslation }
};

// Try to get saved language from localStorage (Zustand persist)
const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem('matdan-mitra-storage');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.state?.language || 'en';
    }
  } catch (e) {
    console.error('Error loading initial language:', e);
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
