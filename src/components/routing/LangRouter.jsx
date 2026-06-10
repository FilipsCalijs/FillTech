import { useEffect } from 'react';
import { useParams, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, DEFAULT_LANG } from '@/i18n/index';
import { LangContext } from '@/contexts/LangContext';

const LangRouter = () => {
  const { lang } = useParams();
  const location = useLocation();
  const { i18n } = useTranslation();

  const validLang = SUPPORTED_LANGS.includes(lang) ? lang : null;

  useEffect(() => {
    if (validLang && i18n.language !== validLang) {
      i18n.changeLanguage(validLang);
      localStorage.setItem('preferredLang', validLang);
    }
  }, [validLang, i18n]);

  if (!validLang) {
    // Not a language code - keep the original path under the default lang
    // so unknown routes hit the "*" catch-all (NotFound) instead of /home.
    return <Navigate to={`/${DEFAULT_LANG}${location.pathname}`} replace />;
  }

  return (
    <LangContext.Provider value={validLang}>
      <Outlet />
    </LangContext.Provider>
  );
};

export default LangRouter;
