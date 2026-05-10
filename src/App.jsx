import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './contexts/authContext';
import Footer from '@/components/ui/Footer';

import Login from '@/components/auth/login/Login';
import Register from './components/auth/register/Register';
import Home from '@/components/home/Home';
import Header from './components/header/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import AdminUsers from './pages/AdminUsers';
import AdminBlog from './pages/AdminBlog';
import AdminBlogEditor from './pages/AdminBlogEditor';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Plan from './components/plan/Plan';
import Explore from './pages/Explore';
import Testing from './pages/Testing';
import ToolPage from './pages/ToolPage';
import BgRemover from './pages/effects/BgRemover';
import Portrait from './pages/effects/Portrait';
import Primer from './pages/Primer';
import AdminEffects from './pages/AdminEffects';
import AdminEffectEditor from './pages/AdminEffectEditor';
import History from './pages/History';
import React from 'react';
import NotFound from './components/ui/NotFound';

function App() {
  const { userLoggedIn, loading } = useAuth();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const AdminRoute = ({ children }) => {
    const userRole = localStorage.getItem('userRole');
    if (!userLoggedIn) return <Navigate to="/login" replace />;
    if (userRole !== 'admin') return <Navigate to="/home" replace />;
    return children;
  };

  const location = useLocation();
  const hideFooter = /^\/(login|register)/.test(location.pathname) || location.pathname.startsWith('/admin');

  if (loading) return null;

  return (
    <HelmetProvider>
      {userLoggedIn && <Header isDark={isDark} toggleTheme={toggleTheme} />}
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Admin */}
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
            <Route path="/admin/blog/new" element={<AdminRoute><AdminBlogEditor /></AdminRoute>} />
            <Route path="/admin/blog/:id/edit" element={<AdminRoute><AdminBlogEditor /></AdminRoute>} />
            <Route path="/admin/effects" element={<AdminRoute><AdminEffects /></AdminRoute>} />
            <Route path="/admin/effects/new" element={<AdminRoute><AdminEffectEditor /></AdminRoute>} />
            <Route path="/admin/effects/:id/edit" element={<AdminRoute><AdminEffectEditor /></AdminRoute>} />

            {/* Protected */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

            {/* Public */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/testing" element={<Testing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/tools/portrait" element={<Portrait />} />
            <Route path="/tools/bg-remover" element={<BgRemover />} />
            <Route path="/tools/watermark-remover" element={<Testing />} />
            <Route path="/tools/:effectPath" element={<ToolPage />} />
            <Route path="/primer" element={<Primer />} />

            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={userLoggedIn ? <NotFound /> : <Navigate to="/login" replace />} />
          </Routes>
        </div>
      </main>
      {!hideFooter && <Footer />}
    </HelmetProvider>
  );
}

export default App;
