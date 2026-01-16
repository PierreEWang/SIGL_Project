import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Composant qui redirige vers le bon dashboard selon le rôle de l'utilisateur
 */
const DashboardRedirect = () => {
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser) {
    // Pas connecté, rediriger vers la page d'accueil
    return <Navigate to="/" replace />;
  }

  const role = currentUser.role?.toUpperCase();

  // Rôles tuteur : MA, TP, PROF, CA, RC
  const tutorRoles = ['MA', 'TP', 'PROF', 'CA', 'RC'];
  
  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  
  if (tutorRoles.includes(role)) {
    return <Navigate to="/tuteur-dashboard" replace />;
  }
  
  // Par défaut (APPRENTI ou autre), afficher le StudentDashboard
  // On importe et affiche directement pour éviter une boucle de redirection
  return <Navigate to="/student-dashboard" replace />;
};

export default DashboardRedirect;
