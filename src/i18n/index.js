import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

export const SUPPORTED_LANGS = ['en', 'ru', 'lv', 'de', 'pt', 'es', 'ja', 'hi', 'ko', 'zh'];
export const DEFAULT_LANG    = 'en';

i18n
  .use(LanguageDetector)
  .use(resourcesToBackend((lang, ns) =>
    import(`./locales/${lang}/${ns}.json`)
  ))
  .use(initReactI18next)
  .init({
    fallbackLng:   DEFAULT_LANG,
    supportedLngs: SUPPORTED_LANGS,
    defaultNS:     'common',
    ns:            ['common', 'tools', 'blog', 'history', 'auth', 'home'],
    detection: {
      order:             ['path', 'localStorage', 'navigator'],
      lookupLocalStorage: 'preferredLang',
      lookupFromPathIndex: 0,
    },
    interpolation: { escapeValue: false },
    react:         { useSuspense: true },
  });

export default i18n;
