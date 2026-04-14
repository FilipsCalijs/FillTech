import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth'
import {Button} from "@/components/ui/Button"

const Header = ({ isDark, toggleTheme }) => {
  const { userLoggedIn, currentUser } = useAuth();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const placeholderAvatar = '/vite.svg';

  return (
    <nav className='bg-background text-foreground flex items-center w-full h-12 top-0 left-0 z-20 border-b border-border px-4 gap-x-4 mb-4'>
      <Link className='text-sm font-bold text-primary hover:underline' to='/explore'>Explore</Link>
      <Link className='text-sm font-bold text-primary hover:underline' to='/blog'>Blog</Link>
      <Link className='text-sm font-bold text-primary hover:underline' to='/testing'>Test</Link>
      <Link className='text-sm font-bold text-primary hover:underline' to='/plan'>Plan</Link>

      {userLoggedIn && userRole === 'admin' && (
        <>
          <Link
            className='text-sm font-bold text-destructive border border-destructive px-2 rounded hover:bg-destructive/10'
            to='/admin/users'
          >
            Admin
          </Link>
        </>
      )}

      <div className='flex-1'></div>

      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        >
        {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>


      {userLoggedIn && currentUser ? (
        <div className='flex items-center gap-x-3 ml-4'>
          <div className='flex flex-col items-end'>
            <span className='text-[10px] text-muted-foreground leading-none'>Logged in as:</span>
            <span className='text-xs font-medium text-foreground'>{currentUser.email}</span>
          </div>

          <img 
            src={currentUser.photoURL || placeholderAvatar} 
            alt="Profile" 
            className='w-8 h-8 rounded-full border border-border object-cover'
            onError={(e) => { e.target.src = placeholderAvatar }} 
          />

          <Button
            onClick={() => {
                doSignOut().then(() => {
                localStorage.removeItem('userRole');
                navigate('/login');
                });
            }}
            variant="outline"
            size="sm"
            >
            Logout
            </Button>

        </div>
      ) : (
        <div className='flex gap-x-4'>
          <Link className='text-sm text-primary underline' to={'/login'}>Login</Link>
          <Link className='text-sm text-primary underline' to={'/register'}>Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
