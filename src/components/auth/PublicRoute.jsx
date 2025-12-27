import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

const PublicRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();

  // Пока Firebase проверяет, авторизован юзер или нет, ничего не рендерим
  // (можно вставить спиннер)
  if (loading) {
    return null; 
  }

  // Если пользователь УЖЕ залогинен, и он пытается зайти на /login или /register,
  // мы выкидываем его на страницу /home
  if (userLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  // Если юзер НЕ залогинен, разрешаем ему увидеть страницу (children)
  return children;
};

export default PublicRoute;