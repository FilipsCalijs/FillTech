import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import { Button } from '@/components/ui/Button';
import { SUPPORTED_LANGS } from '@/i18n/index';
import { useLang } from '@/contexts/LangContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { API_URL as API } from '@/config/api';

const LANG_LABELS = { en: 'EN', ru: 'RU', lv: 'LV', de: 'DE', pt: 'PT', es: 'ES', ja: '日本語', hi: 'हिंदी', ko: '한국어', zh: '中文' };

// Lang-aware link helper inside header
const NavLink = ({ to, children, className }) => {
  const lang = useLang();
  return (
    <Link to={`/${lang}${to}`} className={className}>
      {children}
    </Link>
  );
};

const Header = ({ isDark, toggleTheme }) => {
  const { t }                          = useTranslation('common');
  const { userLoggedIn, currentUser }  = useAuth();
  const navigate                       = useNavigate();
  const lang                           = useLang();
  const userRole                       = localStorage.getItem('userRole');
  const placeholderAvatar              = '/vite.svg';
  const { openAuthModal }              = useAuthModal();

  const [open,       setOpen]       = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [balance,    setBalance]    = useState(null);
  const dropdownRef  = useRef(null);
  const langMenuRef  = useRef(null);

  useEffect(() => {
    const uid = localStorage.getItem('userUID');
    if (!userLoggedIn || !uid) return;
    fetch(`${API}/api/billing`, { headers: { 'x-user-uid': uid } })
      .then(r => r.json())
      .then(d => setBalance(d.balance ?? 0))
      .catch(() => {});
  }, [userLoggedIn]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current  && !dropdownRef.current.contains(e.target))  setOpen(false);
      if (langMenuRef.current  && !langMenuRef.current.contains(e.target))   setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    doSignOut().then(() => {
      localStorage.removeItem('userRole');
      setOpen(false);
      navigate(`/${lang}/tools`);
    });
  };

  // Switch lang but keep current path
  const switchLang = (newLang) => {
    const currentPath = window.location.pathname;
    const withoutLang = currentPath.replace(/^\/[a-z]{2}/, '');
    navigate(`/${newLang}${withoutLang || '/home'}`);
    setLangOpen(false);
  };

  const linkCls = 'text-[15px] font-medium tracking-normal text-primary hover:underline';

  return (
    <nav className='bg-background text-foreground flex items-center w-full top-0 left-0 z-20 py-5 px-[50px] gap-x-5 mb-4'>
      {/* Logo */}
      <NavLink to='/home' className='mr-10 shrink-0'>
        <img
          src={isDark ? '/logo/logo-dark.png' : '/logo/logo-light.png'}
          alt="Visaulio"
          className='h-8 w-auto'
        />
      </NavLink>

      <NavLink to='/tools' className={linkCls}>{t('nav.tools')}</NavLink>
      <NavLink to='/blog'  className={linkCls}>{t('nav.blog')}</NavLink>

      {userLoggedIn && userRole === 'admin' && (
        <NavLink to='/admin/users'
          className='text-sm font-bold text-destructive border border-destructive px-2 rounded hover:bg-destructive/10'>
          {t('nav.admin')}
        </NavLink>
      )}

      <div className='flex-1' />

      {/* Language switcher */}
      <div ref={langMenuRef} className='relative'>
        <button
          onClick={() => setLangOpen(v => !v)}
          className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs font-bold text-foreground hover:border-foreground/40 transition-all'
        >
          <Globe size={14} />
          {LANG_LABELS[lang] ?? lang.toUpperCase()}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform ${langOpen ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        {langOpen && (
          <div className='absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 z-50 min-w-[80px]'>
            {SUPPORTED_LANGS.map(l => (
              <button key={l} onClick={() => switchLang(l)}
                className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors
                  ${l === lang ? 'text-primary' : 'text-foreground hover:bg-muted'}`}>
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button onClick={toggleTheme} variant="outline" size="sm" aria-label={isDark ? t('theme.light') : t('theme.dark')}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </Button>

      {userLoggedIn && currentUser ? (
        <>
          {/* Combined avatar + balance pill */}
          <div ref={dropdownRef} className='relative'>
            <button
              onClick={() => setOpen(v => !v)}
              className='flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border bg-card hover:border-foreground/40 transition-all focus:outline-none'
            >
              <img
                src={currentUser.photoURL || placeholderAvatar}
                alt="Profile"
                className='w-7 h-7 rounded-full object-cover shrink-0'
                onError={(e) => { e.target.src = placeholderAvatar; }}
              />
              <span className='text-sm font-mono font-semibold text-foreground'>
                {balance === null ? '...' : `$${parseFloat(balance).toFixed(2)}`}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {open && (
              <div className='absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg py-1 z-50'>
                <div className='px-4 py-3 border-b border-border'>
                  <p className='text-[10px] text-muted-foreground mb-0.5'>{t('nav.loggedInAs')}</p>
                  <p className='text-sm font-medium text-foreground truncate'>
                    {currentUser.displayName || currentUser.email}
                  </p>
                </div>
                <div className='py-1'>
                  <NavLink to='/history' onClick={() => setOpen(false)}
                    className='flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors'>
                    {t('nav.history')}
                  </NavLink>
                  <NavLink to='/billing' onClick={() => setOpen(false)}
                    className='flex items-center justify-between gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors'>
                    <span>{t('nav.billing')}</span>
                    <span className='text-xs font-mono text-muted-foreground'>
                      {balance !== null && `$${parseFloat(balance).toFixed(2)}`}
                    </span>
                  </NavLink>
                </div>
                <div className='border-t border-border pt-1'>
                  <button onClick={handleSignOut}
                    className='w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors'>
                    {t('nav.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className='flex gap-x-4'>
          <button onClick={() => openAuthModal('login')}    className='text-sm text-primary underline'>{t('nav.login')}</button>
          <button onClick={() => openAuthModal('register')} className='text-sm text-primary underline'>{t('nav.register')}</button>
        </div>
      )}
    </nav>
  );
};

export default Header;
