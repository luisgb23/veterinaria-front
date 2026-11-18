import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import InicioPage from './pages/InicioPage';
import PropietariosPage from './pages/PropietariosPage';
import PropietarioDetallePage from './pages/PropietarioDetallePage';
import MascotasPage from './pages/MascotasPage';
import MascotaDetallePage from './pages/MascotaDetallePage';
import ConsultasPage from './pages/ConsultasPage';
import ConsultaDetallePage from './pages/ConsultaDetallePage';
import VacunasPage from './pages/VacunasPage';
import CuotasPage from './pages/CuotasPage';
import EspeciesPage from './pages/EspeciesPage';
import UsuariosPage from './pages/UsuariosPage';
import NoEncontradoPage from './pages/NoEncontradoPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<InicioPage />} />
          <Route path="propietarios" element={<PropietariosPage />} />
          <Route path="propietarios/:id" element={<PropietarioDetallePage />} />
          <Route path="mascotas" element={<MascotasPage />} />
          <Route path="mascotas/:id" element={<MascotaDetallePage />} />
          <Route path="consultas" element={<ConsultasPage />} />
          <Route path="consultas/:id" element={<ConsultaDetallePage />} />
          <Route path="vacunas" element={<VacunasPage />} />
          <Route path="cuotas" element={<CuotasPage />} />
          <Route path="especies" element={<EspeciesPage />} />

          <Route element={<RequireAuth adminOnly />}>
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>

          <Route path="*" element={<NoEncontradoPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
