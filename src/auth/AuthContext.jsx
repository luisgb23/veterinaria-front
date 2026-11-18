import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tokenStore } from '../api/client';
import { authApi } from '../api/resources';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(() => (tokenStore.access ? tokenStore.getUser() : null));
  // Si hay una sesión guardada, se confirma con /auth/me antes de mostrar la app
  const [verificando, setVerificando] = useState(() => Boolean(tokenStore.access));

  useEffect(() => {
    if (!tokenStore.access) {
      return;
    }

    authApi
      .me()
      .then((me) => {
        setUser(me);
        tokenStore.setUser(me);
      })
      .catch(() => {
        // Un 401 ya lo resuelve el interceptor (evento auth:logout).
        // Si la API no responde, se mantiene la sesión guardada.
      })
      .finally(() => setVerificando(false));
  }, []);

  // El cliente HTTP avisa cuando la sesión venció y no se pudo renovar
  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [queryClient]);

  const login = useCallback(async (usuario, password) => {
    const result = await authApi.login(usuario, password);
    tokenStore.set(result.tokens);
    tokenStore.setUser(result.user);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.refresh;
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Aunque falle la API, la sesión local se cierra igual
    }
    tokenStore.clear();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, verificando, isAdmin: user?.rol === 'admin', login, logout }),
    [user, verificando, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
