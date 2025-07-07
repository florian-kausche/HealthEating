import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationTW from './locales/tw/translation.json'; // Twi translations
// To add more languages:
// 1. Create a folder like src/locales/ga/translation.json (for Ga)
// 2. Import it: import translationGA from './locales/ga/translation.json';
// 3. Add it to the resources object below.

const resources = {
  en: {
    translation: translationEN,
  },
  tw: {
    translation: translationTW,
  },
  // ga: { // Example for Ga
  //   translation: translationGA,
  // },
};

i18n
  .use(LanguageDetector) // Detect user language (from browser settings, localStorage, etc.)
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Use English if detected language or selected language is not available
    debug: process.env.NODE_ENV === 'development', // Enable debug output in console during development

    interpolation: {
      escapeValue: false, // React already protects from XSS attacks
    },

    detection: {
      // Order and from where user language should be detected
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      // Keys or params to lookup language from
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',

      caches: ['localStorage', 'cookie'], // Where to cache the detected language
      // cookieMinutes: 10, // Expiry for cookie, example
      // cookieDomain: 'myDomain' // cookie domain
    },

    // react-i18next specific options
    react: {
      useSuspense: true, // Recommended for new projects: loads translations before rendering
      // wait: true, // If useSuspense is false, this can be true to wait for translations
    }
  });

export default i18n;
