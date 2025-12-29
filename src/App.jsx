import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/authContext";

import Login from "@/components/auth/login/Login";
import Register from "./components/auth/register/Register";
import Home from "./components/home/Home";
import Header from "./components/header/Header";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import ImageToImage from "@/pages/ImageToImage";
import VoiceGeneration from "./pages/VoiceGeneration";  
import NotFound from "./components/ui/NotFound"; 

function App() {
  const { userLoggedIn, loading } = useAuth();

  if (loading) return null;

  return (
    <>
      {/* Рендерим Header только если пользователь вошел в систему */}
      {userLoggedIn && <Header />} 
      
      <main className="w-full h-screen flex flex-col">
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/i2i" element={<ProtectedRoute><ImageToImage /></ProtectedRoute>} />
          <Route path="/t2v" element={<ProtectedRoute><VoiceGeneration /></ProtectedRoute>} />  
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Панель управления</div>
            </ProtectedRoute>
          } />

          <Route path="*" element={
            userLoggedIn 
              ? <NotFound />
              : <Navigate to="/login" replace />
          } />
        </Routes>
      </main>
    </>
  );
}

export default App;