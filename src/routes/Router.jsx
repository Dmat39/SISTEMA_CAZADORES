// src/Router.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Publicas */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas Protegidas - Admin */}
        <Route element={<DashboardLayoutAdmin />}>
          <Route path="/dashboard/admin" element={<PrivateRoute requiredRole="admin">  <DashboardAdmin /></PrivateRoute>} />
          <Route path="/dashboard/admin/supervisor" element={<PrivateRoute requiredRole="admin"><SupervisorsAdmin /></PrivateRoute>} />
          <Route path="/dashboard/admin/operadores" element={<PrivateRoute requiredRole="admin"><OperatorsAdmin /></PrivateRoute>} />
          <Route path="/dashboard/admin/incidencia" element={<PrivateRoute requiredRole="admin"><Incidence /></PrivateRoute>} />
          <Route path="/dashboard/admin/incidencia/detalle" element={<PrivateRoute requiredRole="admin"><IncidenciaDetalle /></PrivateRoute>} />
        </Route>

        {/* Rutas Protegidas - Supervisor */}
        <Route element={<DashboardLayoutSupervisor />}>
          {/* <Route path="/dashboard/supervisors" element={<PrivateRoute requiredRole="supervisor"><DashboardSupervisor /></PrivateRoute>} /> */}
          <Route path="/dashboard/supervisors/operadores" element={<PrivateRoute requiredRole="supervisor"><OperatorsAdmin /></PrivateRoute>} />
          <Route path="/dashboard/supervisors/incidencia" element={<PrivateRoute requiredRole="supervisor"> <Incidence /></PrivateRoute>} />
          <Route path="/dashboard/supervisors/incidencia/detalle" element={<PrivateRoute requiredRole="supervisor"><IncidenciaDetalle /></PrivateRoute>} />
          <Route path="/dashboard/supervisors/incidencia/configuracion" element={<PrivateRoute requiredRole="supervisor"><SupervisorProfile /></PrivateRoute>} />
        </Route>

        {/* Rutas Protegidas - Operador */}
        <Route element={<DashboardLayoutOperador />}>
          {/* <Route path="/dashboard/operador" element={<PrivateRoute requiredRole="operator"><DashboardOperador /></PrivateRoute>} /> */}
          <Route path="/dashboard/operador/incidencia" element={<PrivateRoute requiredRole="operator"><IncidenciaOperador /></PrivateRoute>} />
          <Route path="/dashboard/operador/incidencia/detalle" element={<PrivateRoute requiredRole="operator"><IncidenciaDetalle /></PrivateRoute>} />
          <Route path="/dashboard/operador/incidencia/configuracion" element={<PrivateRoute requiredRole="operator"><ConfigurationProfile /></PrivateRoute>} />
        </Route>

        {/* Página 404 personalizada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
