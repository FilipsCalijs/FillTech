import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useLang } from '@/contexts/LangContext';

// /register is no longer a standalone page - it opens the auth modal (register mode)
// over the public site and redirects back to a browsable page.
const Register = () => {
  const { openAuthModal } = useAuthModal();
  const lang = useLang();

  useEffect(() => {
    openAuthModal('register');
  }, [openAuthModal]);

  return <Navigate to={`/${lang}/tools`} replace />;
};

export default Register;
