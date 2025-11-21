import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const authService = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'inscription' };
    }
  },

  // Connexion
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { data } = response.data;

      // Stocker les tokens et infos utilisateur
      if (data.tokens) {
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Toujours nettoyer le localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  },

  // Changer le mot de passe
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du changement de mot de passe' };
    }
  },

  // Demander réinitialisation du mot de passe
  requestPasswordReset: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/request-reset`, {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la demande de réinitialisation' };
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la réinitialisation' };
    }
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Récupérer le profil utilisateur
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  },

  // Mettre à jour le profil
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      
      // Mettre à jour le localStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du profil' };
    }
  },
};

export default authService;
