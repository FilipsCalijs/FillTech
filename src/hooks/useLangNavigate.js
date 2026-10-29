import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';

const useLangNavigate = () => {
  const navigate = useNavigate();
  const lang     = useLang();

  return (path, options) => {
    const prefixed = path.startsWith('/') ? `/${lang}${path}` : path;
    navigate(prefixed, options);
  };
};

export default useLangNavigate;
