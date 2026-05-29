import { useTranslation } from 'react-i18next';
import { useLang } from '@/contexts/LangContext';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const { t } = useTranslation('common');
  const lang  = useLang();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <p className="mt-2 text-xl font-semibold text-muted-foreground">{t('notFound.title')}</p>
      <p className="text-muted-foreground mt-2 max-w-sm">{t('notFound.desc')}</p>
      <Link
        to={`/${lang}/home`}
        className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition"
      >
        {t('notFound.back')}
      </Link>
    </div>
  );
};

export default NotFound;
