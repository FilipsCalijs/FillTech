import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './authContext';
import AuthModal from '@/components/auth/AuthModal';

const AuthModalContext = createContext(null);

export const AuthModalProvider = ({ children }) => {
  const { userLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login');

  // Opens the auth modal in the given mode ('login' | 'register').
  const openAuthModal = useCallback((initialMode = 'login') => {
    setMode(initialMode);
    setIsOpen(true);
  }, []);

  // Returns true if the user is logged in, otherwise opens the auth modal and returns false.
  const requireAuth = useCallback(() => {
    if (userLoggedIn) return true;
    openAuthModal('login');
    return false;
  }, [userLoggedIn, openAuthModal]);

  return (
    <AuthModalContext.Provider value={{ requireAuth, openAuthModal }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        mode={mode}
        onModeChange={setMode}
        onClose={() => setIsOpen(false)}
        onSuccess={() => setIsOpen(false)}
      />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
