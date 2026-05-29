import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { SUPPORTED_LANGS } from '@/i18n/index';

const PublicRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  const { lang } = useParams();
  const validLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';

  if (loading) return null;
  if (userLoggedIn) return <Navigate to={`/${validLang}/home`} replace />;
  return children;
};

export default PublicRoute;
