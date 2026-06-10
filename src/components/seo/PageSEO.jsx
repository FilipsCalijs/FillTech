import { Helmet } from 'react-helmet-async';
import { useLang } from '@/contexts/LangContext';
import { SUPPORTED_LANGS } from '@/i18n/index';

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'https://visaulio.com';

const PageSEO = ({ title, description, path = '' }) => {
  const lang = useLang();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title} - FillTech</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${BASE_URL}/${lang}${cleanPath}`} />

      {SUPPORTED_LANGS.map(l => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={`${BASE_URL}/${l}${cleanPath}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/en${cleanPath}`} />
    </Helmet>
  );
};

export default PageSEO;
