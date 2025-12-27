import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext"; 

const ProtectedRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!userLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;