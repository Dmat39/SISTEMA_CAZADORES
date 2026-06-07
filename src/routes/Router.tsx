import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// LAYOUTS
import DashboardLayoutAdmin from "../layouts/DashboardLayoutAdmin";
import DashboardLayoutSupervisor from "../layouts/DashboardLayoutSupervisor";
import DashboardLayoutOperador from "../layouts/DashboardLayoutOperador";

// PAGES LOGIN
import LoginPage from "../pages/Login";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";

// PAGES ADMIN
import DashboardAdmin from "../pages/Admin/Dashboard_admin";
import SupervisorsAdmin from "../pages/Admin/Supervisors";
import CazadoresAdmin from "../pages/Admin/Cazadores";
import Auditoria from "../pages/Admin/Auditoria";

// PAGES SUPERVISOR
import CazadoresSupervisor from "../pages/Supervisors/Cazadores";
import SupervisorProfile from "../pages/Supervisors/Configuration";
import Incidence from "../pages/Supervisors/Incidence";

// PAGES CAZADOR
import IncidenciaOperador from "../pages/Operador/Incidencia";
import IncidenciaDetalle from "../pages/Operador/Detalle";
import ConfigurationProfile from "../pages/Operador/Configuration";

import PrivateRoute from "../routes/PrivateRoute";
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
            <PrivateRoute requiredRole="administrator">
              <DashboardLayoutAdmin />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="supervisor" element={<SupervisorsAdmin />} />
          <Route path="incidencia" element={<Incidence />} />
          <Route path="incidencia/detalle" element={<IncidenciaDetalle />} />
          <Route path="cazadores" element={<CazadoresAdmin />} />
          <Route path="auditoria" element={<Auditoria />} />
        </Route>

        {/* Rutas protegidas - VISUALIZER (mismas vistas que admin pero solo dashboard + incidencias) */}
        <Route
          path="/dashboard/visualizer"
          element={
            <PrivateRoute requiredRole="visualizer">
              <DashboardLayoutAdmin />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
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
          <Route index element={<DashboardAdmin />} />
          <Route path="incidencia" element={<Incidence />} />
          <Route path="incidencia/detalle" element={<IncidenciaDetalle />} />
          <Route path="incidencia/configuracion" element={<SupervisorProfile />} />
          <Route path="cazadores" element={<CazadoresSupervisor />} />
        </Route>

        {/* Rutas protegidas - CAZADOR */}
        <Route
          path="/dashboard/cazador"
          element={
            <PrivateRoute requiredRole="hunter">
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
