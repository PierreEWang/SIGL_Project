import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedAdminRoute = ({ children }) => {
  const user = authService.getCurrentUser();

  // Si pas de user ou pas ADMIN, rediriger vers dashboard
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
