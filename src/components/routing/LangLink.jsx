import { Link } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';

const LangLink = ({ to, ...props }) => {
  const lang = useLang();
  const prefixed = typeof to === 'string' && to.startsWith('/')
    ? `/${lang}${to}`
    : to;
  return <Link to={prefixed} {...props} />;
};

export default LangLink;
