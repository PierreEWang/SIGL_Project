// sigl_frontend/src/services/Api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instance Axios principale
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Récupère une valeur en priorisant la session, puis le localStorage.
 */
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

/**
 * Enregistre les tokens dans le même storage que celui qui contenait le refresh token.
 */
function storeTokensFromRefresh(accessToken, newRefreshToken) {
  if (typeof window === 'undefined') return;

  try {
    const sessionRefresh = window.sessionStorage.getItem('refreshToken');
    const localRefresh = window.localStorage.getItem('refreshToken');

    let target = window.localStorage;

    if (sessionRefresh && !localRefresh) {
      target = window.sessionStorage;
    } else if (sessionRefresh && localRefresh) {
      if (sessionRefresh === newRefreshToken) {
        target = window.sessionStorage;
      } else if (localRefresh === newRefreshToken) {
        target = window.localStorage;
      }
    }

    target.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      target.setItem('refreshToken', newRefreshToken);
    }
  } catch {
    // ignore
  }
}

/**
 * Supprime tokens + user de tous les storages.
 */
function clearAuthEverywhere() {
  if (typeof window === 'undefined') return;

  try {
    [window.localStorage, window.sessionStorage].forEach((store) => {
      if (!store) return;
      store.removeItem('accessToken');
      store.removeItem('refreshToken');
      store.removeItem('user');
    });
  } catch {
    // ignore
  }
}

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = getFromAnyStorage('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs et refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getFromAnyStorage('refreshToken');

        if (refreshToken) {
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data?.data || {};

          if (!accessToken) {
            throw new Error('Réponse refresh invalide');
          }

          storeTokensFromRefresh(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearAuthEverywhere();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;