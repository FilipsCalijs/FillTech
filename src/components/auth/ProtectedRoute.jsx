import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { SUPPORTED_LANGS } from '@/i18n/index';

const ProtectedRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  const { lang } = useParams();
  const validLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';

  if (loading) return null;
  if (!userLoggedIn) return <Navigate to={`/${validLang}/login`} replace />;
  return children;
};

export default ProtectedRoute;
