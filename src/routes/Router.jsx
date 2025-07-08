// src/Router.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// LAYOUTS
import DashboardLayoutAdmin from "../layouts/DashboardLayoutAdmin";
import DashboardLayoutSupervisor from "../layouts/DashboardLayoutSupervisor";
import DashboardLayoutOperador from "../layouts/DashboardLayoutOperador";

// PAGES LOGIN
import LoginPage from "../pages/Login";
// NO AUTORIZADO PAGE
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
// PAGES ADMIN
import DashboardAdmin from "../pages/Admin/Dashboard";
import SupervisorsAdmin from "../pages/Admin/Supervisors";
// PAGES SUPERVISOR
import DashboardSupervisor from "../pages/Supervisors/Dashboard";
import OperatorsAdmin from "../pages/Supervisors/Operators";
import ReportesSupervisor from "../pages/Supervisors/Reportes";
// PAGES OPERADOR
import DashboardOperador from "../pages/Operador/Dashboard";
import IncidenciaOperador from "../pages/Operador/Incidencia";
import IncidenciaDetalle from "../pages/Operador/Detalle";
import ConfigurationProfile from "../pages/Operador/Configuration";
import SupervisorProfile from "../pages/Supervisors/Configuration";
import IncidenciaSupervisor from "../pages/Supervisors/Incidencia"
import IncidenciaDetalleSupervisor from "../pages/Supervisors/Detalle"

import PrivateRoute from "../routes/PrivateRoute";
import Incidence from "../pages/Supervisors/Incidence";
import PublicRouter from "./PublicRoute";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas Públicas */}
        <Route path="/login" element={<PublicRouter element={<LoginPage />} />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas protegidas - ADMIN */}
        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute requiredRole="admin">
              <DashboardLayoutAdmin />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="supervisor" element={<SupervisorsAdmin />} />
          <Route path="operadores" element={<OperatorsAdmin />} />
          <Route path="incidencia" element={<Incidence />} />
          <Route path="incidencia/detalle" element={<IncidenciaDetalle />} />
        </Route>

        {/* Rutas protegidas - SUPERVISOR */}
        <Route
          path="/dashboard/supervisors"
          element={
            <PrivateRoute requiredRole="supervisor">
              <DashboardLayoutSupervisor />
            </PrivateRoute>
          }
        >
          <Route path="operadores" element={<OperatorsAdmin />} />
          <Route path="incidencia" element={<Incidence />} />
          <Route path="incidencia/detalle" element={<IncidenciaDetalle />} />
          <Route path="incidencia/configuracion" element={<SupervisorProfile />} />
        </Route>

        {/* Rutas protegidas - OPERADOR */}
        <Route
          path="/dashboard/operador"
          element={
            <PrivateRoute requiredRole="operator">
              <DashboardLayoutOperador />
            </PrivateRoute>
          }
        >
          <Route path="incidencia" element={<IncidenciaOperador />} />
          <Route path="incidencia/detalle" element={<IncidenciaDetalle />} />
          <Route path="incidencia/configuracion" element={<ConfigurationProfile />} />
        </Route>

        {/* Página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
