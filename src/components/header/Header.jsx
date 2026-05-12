import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth'
import { Button } from "@/components/ui/Button"

const API = 'http://localhost:5200';

const Header = ({ isDark, toggleTheme }) => {
  const { userLoggedIn, currentUser } = useAuth();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const placeholderAvatar = '/vite.svg';

  const [open,    setOpen]    = useState(false);
  const [balance, setBalance] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch balance when logged in
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    doSignOut().then(() => {
      localStorage.removeItem('userRole');
      setOpen(false);
      navigate('/login');
    });
  };

  return (
    <nav className='bg-background text-foreground flex items-center w-full h-12 top-0 left-0 z-20 border-b border-border px-4 gap-x-4 mb-4'>
      <Link className='text-sm font-bold text-primary hover:underline' to='/explore'>Explore</Link>
      <Link className='text-sm font-bold text-primary hover:underline' to='/blog'>Blog</Link>
      <Link className='text-sm font-bold text-primary hover:underline' to='/testing'>Game Filter</Link>
      <Link className='text-sm font-bold text-primary hover:underline' to='/testing-2'>Voice</Link>
      <Link className='text-sm font-bold text-primary hover:underline' to='/tools/clothes-swap'>Clothes</Link>
      <Link className='text-sm font-bold text-primary hover:underline' to='/plan'>Plan</Link>

      {userLoggedIn && userRole === 'admin' && (
        <Link
          className='text-sm font-bold text-destructive border border-destructive px-2 rounded hover:bg-destructive/10'
          to='/admin/users'
        >
          Admin
        </Link>
      )}

      <div className='flex-1' />

      <Button onClick={toggleTheme} variant="outline" size="sm">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </Button>

      {userLoggedIn && currentUser ? (
        <>
          {/* Balance + top-up button */}
          <div className='flex items-center gap-1.5'>
            <Link
              to='/billing'
              className='text-sm font-mono font-semibold text-foreground hover:text-primary transition-colors'
            >
              {balance === null ? '...' : `$${parseFloat(balance).toFixed(2)}`}
            </Link>
            <Link
              to='/billing'
              title="Add funds"
              className='w-5 h-5 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/60 transition-all'
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </Link>
          </div>

          {/* Avatar dropdown */}
          <div ref={dropdownRef} className='relative ml-1'>
            <button
              onClick={() => setOpen(v => !v)}
              className='flex items-center gap-1.5 rounded-full focus:outline-none'
            >
              <img
                src={currentUser.photoURL || placeholderAvatar}
                alt="Profile"
                className='w-8 h-8 rounded-full border border-border object-cover'
                onError={(e) => { e.target.src = placeholderAvatar }}
              />
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {open && (
              <div className='absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg py-1 z-50'>
                <div className='px-4 py-3 border-b border-border'>
                  <p className='text-[10px] text-muted-foreground mb-0.5'>Logged in as</p>
                  <p className='text-sm font-medium text-foreground truncate'>
                    {currentUser.displayName || currentUser.email}
                  </p>
                </div>

                <div className='py-1'>
                  <Link to='/history' onClick={() => setOpen(false)}
                    className='flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors'>
                    History
                  </Link>
                  <Link to='/billing' onClick={() => setOpen(false)}
                    className='flex items-center justify-between gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors'>
                    <span>Billing</span>
                    <span className='text-xs font-mono text-muted-foreground'>
                      {balance === null ? '' : `$${parseFloat(balance).toFixed(2)}`}
                    </span>
                  </Link>
                  <Link to='/plan' onClick={() => setOpen(false)}
                    className='flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors'>
                    Plan
                  </Link>
                </div>

                <div className='border-t border-border pt-1'>
                  <button
                    onClick={handleSignOut}
                    className='w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors'
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className='flex gap-x-4'>
          <Link className='text-sm text-primary underline' to='/login'>Login</Link>
          <Link className='text-sm text-primary underline' to='/register'>Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
