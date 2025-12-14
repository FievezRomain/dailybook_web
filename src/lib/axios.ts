import { SESSION_COOKIE_NAME } from '@/constants/cookies';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-client': 'web',
  },
  timeout: 10000,
});

function getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    return match ? match[1] : null;
}

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use(
  (config) => {
    // On lit le cookie côté client
    const token = getTokenFromCookie();
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (typeof window !== 'undefined' && error.response?.status === 401) {
        console.warn('Token invalide ou expiré, déconnexion automatique');
  
        // Supprimer le cookie côté client
        document.cookie = `${SESSION_COOKIE_NAME}=; Max-Age=0; path=/`;
  
        // Rediriger l'utilisateur vers la page de connexion
        window.location.href = '/login';
      }
  
      return Promise.reject(error);
    }
);
  

export default api;
