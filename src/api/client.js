import axios from 'axios';

/**
 * Cliente HTTP de la API.
 *
 * - Agrega el access token en cada petición.
 * - Si una petición da 401 (token vencido), canjea el refresh token en /auth/refresh,
 *   guarda el par nuevo y reintenta la petición original sin que el usuario lo note.
 * - Si el refresh también falla, borra la sesión y avisa con el evento "auth:logout".
 */

export const API_URL = import.meta.env.VITE_API_URL || '/api';

const KEYS = {
  access: 'vet_access_token',
  refresh: 'vet_refresh_token',
  user: 'vet_user',
};

export const tokenStore = {
  get access() {
    return localStorage.getItem(KEYS.access);
  },
  get refresh() {
    return localStorage.getItem(KEYS.refresh);
  },
  set(tokens) {
    localStorage.setItem(KEYS.access, tokens.access_token);
    localStorage.setItem(KEYS.refresh, tokens.refresh_token);
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.user));
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem(KEYS.user, JSON.stringify(user));
  },
  clear() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  },
};

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si varias peticiones dan 401 a la vez, se hace un solo refresh y todas esperan ese mismo.
// (Un refresh token sirve una sola vez: dos refresh simultáneos cerrarían la sesión.)
let refreshEnCurso = null;

async function renovarTokens() {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) {
    throw new Error('Sin refresh token');
  }

  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
  tokenStore.set(data.data);

  return data.data.access_token;
}

function cerrarSesionLocal() {
  tokenStore.clear();
  window.dispatchEvent(new Event('auth:logout'));
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const esRutaDeAuth = /\/auth\/(login|refresh|logout)$/.test(original?.url ?? '');

    if (status === 401 && original && !original._reintento && !esRutaDeAuth && tokenStore.refresh) {
      original._reintento = true;

      try {
        refreshEnCurso = refreshEnCurso ?? renovarTokens().finally(() => {
          refreshEnCurso = null;
        });
        const token = await refreshEnCurso;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        cerrarSesionLocal();
        return Promise.reject(error);
      }
    }

    if (status === 401 && !esRutaDeAuth) {
      cerrarSesionLocal();
    }

    return Promise.reject(error);
  },
);

/** Atajos que devuelven el cuerpo de la respuesta: { success, message, data, meta }. */
export const http = {
  get: (url, params) => api.get(url, { params }).then((r) => r.data),
  post: (url, body) => api.post(url, body).then((r) => r.data),
  put: (url, body) => api.put(url, body).then((r) => r.data),
  delete: (url) => api.delete(url).then((r) => r.data),
  blob: (url, params) => api.get(url, { params, responseType: 'blob' }).then((r) => r.data),
};
