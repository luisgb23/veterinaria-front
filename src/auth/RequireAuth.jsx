import { Center, Loader } from '@mantine/core';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/** Protege las rutas internas: sin sesión redirige al login. Con adminOnly, exige rol admin. */
export function RequireAuth({ adminOnly = false }) {
  const { user, verificando, isAdmin } = useAuth();
  const location = useLocation();

  if (verificando) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
