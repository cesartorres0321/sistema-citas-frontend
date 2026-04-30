import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

import DashboardAlumnoPage from '@/pages/alumno/DashboardAlumnoPage'
import BuscarProfesoresPage from '@/pages/alumno/BuscarProfesoresPage'
import AgendarCitaPage from '@/pages/alumno/AgendarCitaPage'

import DashboardProfesorPage from '@/pages/profesor/DashboardProfesorPage'
import EstadisticasPage from '@/pages/profesor/EstadisticasPage'
import DisponibilidadPage from '@/pages/profesor/DisponibilidadPage'

import DashboardAdminPage from '@/pages/admin/DashboardAdminPage'
import GestionProfesoresPage from '@/pages/admin/GestionProfesoresPage'
import GestionAlumnosPage from '@/pages/admin/GestionAlumnosPage'

import PerfilPage from '@/pages/PerfilPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Alumno */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute allowedRoles={['alumno']} />}>
            <Route path="/alumno" element={<DashboardAlumnoPage />} />
            <Route path="/alumno/profesores" element={<BuscarProfesoresPage />} />
            <Route path="/alumno/agendar/:profesorId" element={<AgendarCitaPage />} />
            <Route path="/alumno/perfil" element={<PerfilPage />} />
          </Route>
        </Route>

        {/* Profesor */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute allowedRoles={['profesor']} />}>
            <Route path="/profesor" element={<DashboardProfesorPage />} />
            <Route path="/profesor/estadisticas" element={<EstadisticasPage />} />
            <Route path="/profesor/disponibilidad" element={<DisponibilidadPage />} />
            <Route path="/profesor/perfil" element={<PerfilPage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardAdminPage />} />
            <Route path="/admin/profesores" element={<GestionProfesoresPage />} />
            <Route path="/admin/alumnos" element={<GestionAlumnosPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
