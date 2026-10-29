import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useLang } from '@/contexts/LangContext';

// /login is no longer a standalone page - it opens the auth modal (login mode)
// over the public site and redirects back to a browsable page.
const Login = () => {
  const { openAuthModal } = useAuthModal();
  const lang = useLang();

  useEffect(() => {
    openAuthModal('login');
  }, [openAuthModal]);

  return <Navigate to={`/${lang}/tools`} replace />;
};

export default Login;
