import { useEffect } from 'react';
import { useParams, Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, DEFAULT_LANG } from '@/i18n/index';
import { LangContext } from '@/contexts/LangContext';

const LangRouter = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  const validLang = SUPPORTED_LANGS.includes(lang) ? lang : null;

  useEffect(() => {
    if (validLang && i18n.language !== validLang) {
      i18n.changeLanguage(validLang);
      localStorage.setItem('preferredLang', validLang);
    }
  }, [validLang, i18n]);

  if (!validLang) {
    return <Navigate to={`/${DEFAULT_LANG}/home`} replace />;
  }

  return (
    <LangContext.Provider value={validLang}>
      <Outlet />
    </LangContext.Provider>
  );
};

export default LangRouter;
