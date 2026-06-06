import React from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './contexts/authContext';
import Footer from '@/components/ui/Footer';
import LangRouter from '@/components/routing/LangRouter';

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
import Testing2 from './pages/Testing2';
import ToolPage from './pages/ToolPage';
import BgRemover from './pages/effects/BgRemover';
import WatermarkRemover from './pages/effects/WatermarkRemover';
import PhotoColorize from './pages/effects/PhotoColorize';
import ClothesSwap from './pages/effects/ClothesSwap';
import VideoWatermarkRemover from './pages/effects/VideoWatermarkRemover';
import VideoBgReplace from './pages/effects/VideoBgReplace';
import VocalIsolator from './pages/effects/VocalIsolator';
import Portrait from './pages/effects/Portrait';
import Upscaler from './pages/effects/Upscaler';
import Primer from './pages/Primer';
import AdminEffects from './pages/AdminEffects';
import AdminEffectEditor from './pages/AdminEffectEditor';
import History from './pages/History';
import Billing from './pages/Billing';
import NotFound from './components/ui/NotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import { SUPPORTED_LANGS } from '@/i18n/index';

// Redirect / to preferred or browser lang
const LangRedirect = ({ to = '/home' }) => {
  const saved    = localStorage.getItem('preferredLang');
  const browser  = navigator.language?.slice(0, 2);
  const detected = SUPPORTED_LANGS.includes(saved) ? saved
    : SUPPORTED_LANGS.includes(browser) ? browser : 'en';
  return <Navigate to={`/${detected}${to}`} replace />;
};

function AppShell() {
  const { userLoggedIn, loading } = useAuth();
  const location = useLocation();
  const { lang }  = useParams();

  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const AdminRoute = ({ children }) => {
    const role = localStorage.getItem('userRole');
    if (!userLoggedIn) return <Navigate to={`/${lang}/login`} replace />;
    if (role !== 'admin') return <Navigate to={`/${lang}/home`} replace />;
    return children;
  };

  const hideFooter = /\/(login|register)$/.test(location.pathname)
    || location.pathname.includes('/admin');

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen">
      {userLoggedIn && <Header isDark={isDark} toggleTheme={toggleTheme} />}
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Admin (no i18n needed in admin) */}
            <Route path="admin/users"              element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="admin/blog"               element={<AdminRoute><AdminBlog /></AdminRoute>} />
            <Route path="admin/blog/new"           element={<AdminRoute><AdminBlogEditor /></AdminRoute>} />
            <Route path="admin/blog/:id/edit"      element={<AdminRoute><AdminBlogEditor /></AdminRoute>} />
            <Route path="admin/effects"            element={<AdminRoute><AdminEffects /></AdminRoute>} />
            <Route path="admin/effects/new"        element={<AdminRoute><AdminEffectEditor /></AdminRoute>} />
            <Route path="admin/effects/:id/edit"   element={<AdminRoute><AdminEffectEditor /></AdminRoute>} />

            {/* Protected */}
            <Route path="home"    element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="plan"    element={<ProtectedRoute><Plan /></ProtectedRoute>} />
            <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />

            {/* Public */}
            <Route path="blog"          element={<Blog />} />
            <Route path="blog/:slug"    element={<BlogPost />} />
            <Route path="explore"       element={<Explore />} />
            <Route path="testing"       element={<Testing />} />
            <Route path="testing-2"     element={<Testing2 />} />
            <Route path="primer"        element={<Primer />} />
            <Route path="terms"         element={<Terms />} />
            <Route path="privacy"       element={<Privacy />} />
            <Route path="cookies"       element={<Cookies />} />

            <Route path="tools/portrait"               element={<Portrait />} />
            <Route path="tools/bg-remover"             element={<BgRemover />} />
            <Route path="tools/upscaler"               element={<Upscaler />} />
            <Route path="tools/ps2-filter"             element={<Testing />} />
            <Route path="tools/watermark-remover"      element={<WatermarkRemover />} />
            <Route path="watermark-remover"             element={<WatermarkRemover />} />
            <Route path="tools/photo-colorize"         element={<PhotoColorize />} />
            <Route path="tools/clothes-swap"           element={<ClothesSwap />} />
            <Route path="tools/watermark-remover-video" element={<VideoWatermarkRemover />} />
            <Route path="tools/video-bg-replace" element={<VideoBgReplace />} />
            <Route path="tools/vocal-isolator"   element={<VocalIsolator />} />
            <Route path="tools/:effectPath"            element={<ToolPage />} />

            <Route index element={<Navigate to={`/${lang}/home`} replace />} />
            <Route path="*" element={userLoggedIn ? <NotFound /> : <Navigate to={`/${lang}/login`} replace />} />
          </Routes>
        </div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Routes>
        {/* /:lang prefix — all app routes live here */}
        <Route path="/:lang" element={<LangRouter />}>
          <Route path="*" element={<AppShell />} />
        </Route>

        {/* Redirect / and unknown paths to detected lang */}
        <Route path="/" element={<LangRedirect />} />
        <Route path="*" element={<LangRedirect />} />
      </Routes>
    </HelmetProvider>
  );
}

export default App;
