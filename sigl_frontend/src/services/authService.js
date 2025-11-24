// sigl_frontend/src/services/authService.js
import axios from 'axios';
import api from './Api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// --- Helpers stockage ------------------------------------------------------

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
  rememberMe: 'rememberMe',
};

function getFromAnyStorage(key) {
  if (typeof window === 'undefined') return null;

  try {
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue !== null && sessionValue !== undefined) {
      return sessionValue;
    }
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function clearAuthInAllStorages() {
  if (typeof window === 'undefined') return;

  try {
    [window.localStorage, window.sessionStorage].forEach((store) => {
      if (!store) return;
      store.removeItem(STORAGE_KEYS.accessToken);
      store.removeItem(STORAGE_KEYS.refreshToken);
      store.removeItem(STORAGE_KEYS.user);
    });
  } catch {
    // ignore
  }
}

/**
 * Sauvegarde les infos d'auth (tokens + user) soit en localStorage (rememberMe = true),
 * soit en sessionStorage (rememberMe = false).
 */
function saveAuthState({ tokens, user, rememberMe }) {
  if (typeof window === 'undefined') return;
  if (!tokens?.accessToken || !user) return;

  try {
    clearAuthInAllStorages();

    const target = rememberMe ? window.localStorage : window.sessionStorage;

    target.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    if (tokens.refreshToken) {
      target.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    }
    target.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    target.setItem(STORAGE_KEYS.rememberMe, rememberMe ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * Devine si l’utilisateur avait choisi "Se souvenir de moi".
 */
function inferRememberMe() {
  if (typeof window === 'undefined') return false;

  try {
    const remembered = window.localStorage.getItem(STORAGE_KEYS.rememberMe);
    if (remembered === 'true') return true;
    if (remembered === 'false') return false;

    const hasLocalAccess = !!window.localStorage.getItem(STORAGE_KEYS.accessToken);
    const hasSessionAccess = !!window.sessionStorage.getItem(STORAGE_KEYS.accessToken);

    if (hasLocalAccess && !hasSessionAccess) return true;
    if (!hasLocalAccess && hasSessionAccess) return false;

    return false;
  } catch {
    return false;
  }
}

// --- Service ---------------------------------------------------------------

const authService = {
  // --- INSCRIPTION ---------------------------------------------------------
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Erreur lors de l'inscription" };
    }
  },

  // --- LOGIN + MFA --------------------------------------------------------

  /**
   * Étape 1 : login
   * - si MFA non requis : stocke tokens + user (session ou local selon rememberMe)
   * - si MFA requis : ne stocke rien, renvoie juste la payload
   */
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const resData = response.data;

      if (resData.mfaRequired) {
        return resData;
      }

      const { data } = resData;

      if (data?.tokens && data?.user) {
        saveAuthState({
          tokens: data.tokens,
          user: data.user,
          rememberMe,
        });
      }

      return resData;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la connexion' };
    }
  },

  /**
   * Étape 2 : vérification du code MFA
   */
  verifyMfaCode: async (userId, code, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_URL}/auth/mfa/verify`, {
        userId,
        code: String(code).trim(),
      });

      const resData = response.data;
      const { data } = resData;

      if (data?.tokens && data?.user) {
        saveAuthState({
          tokens: data.tokens,
          user: data.user,
          rememberMe,
        });
      }

      return resData;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la vérification MFA' };
    }
  },

  // --- DÉCONNEXION ---------------------------------------------------------

  logout: async () => {
    try {
      const token = getFromAnyStorage(STORAGE_KEYS.accessToken);
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
      console.error('Erreur lors du logout :', error);
    } finally {
      clearAuthInAllStorages();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  },

  // --- MOT DE PASSE --------------------------------------------------------

  requestPasswordReset: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/request-reset`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la demande de réinitialisation' };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la réinitialisation du mot de passe' };
    }
  },

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

  // --- ACCÈS / USER EN MÉMOIRE --------------------------------------------

  getAccessToken: () => {
    return getFromAnyStorage(STORAGE_KEYS.accessToken);
  },

  getRefreshToken: () => {
    return getFromAnyStorage(STORAGE_KEYS.refreshToken);
  },

  getCurrentUser: () => {
    const userStr = getFromAnyStorage(STORAGE_KEYS.user);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setCurrentUser: (user) => {
    if (typeof window === 'undefined') return;

    try {
      const rememberMe = inferRememberMe();
      const target = rememberMe ? window.localStorage : window.sessionStorage;

      if (user) {
        const serialized = JSON.stringify(user);
        target.setItem(STORAGE_KEYS.user, serialized);
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.user);
        window.sessionStorage.removeItem(STORAGE_KEYS.user);
      }
    } catch {
      // ignore
    }
  },

  isAuthenticated: () => {
    return !!authService.getAccessToken();
  },

  // --- PROFIL --------------------------------------------------------------

  getMe: async () => {
    const current = authService.getCurrentUser();

    if (!current?.id) {
      return null;
    }

    try {
      const response = await api.get(`/users/${current.id}`);
      return response.data?.user ?? response.data?.data?.user ?? null;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  },

  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  },

  requestRoleChange: async (userId, requestedRole, reason) => {
    const response = await api.post('/roles/change-request', {
      userId,
      requestedRole,
      reason,
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const current = authService.getCurrentUser();

    if (!current?.id) {
      throw { message: 'Utilisateur non connecté' };
    }

    try {
      const response = await api.put(`/users/${current.id}`, profileData);
      const updatedUser =
        response.data?.user ?? response.data?.data?.user ?? null;

      if (updatedUser) {
        const merged = {
          ...current,
          ...updatedUser,
        };

        authService.setCurrentUser(merged);
      }

      return updatedUser;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du profil' };
    }
  },

  inferRememberMe,
};

export default authService;