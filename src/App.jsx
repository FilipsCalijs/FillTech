import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './contexts/authContext';

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

            {/* Protected */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />

            {/* Public */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/testing" element={<Testing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/tools/:effectPath" element={<ToolPage />} />

            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={userLoggedIn ? <NotFound /> : <Navigate to="/login" replace />} />
          </Routes>
        </div>
      </main>
    </HelmetProvider>
  );
}

export default App;
