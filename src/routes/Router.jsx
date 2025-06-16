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

import PrivateRoute from "../routes/PrivateRoute";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Publicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas Protegidas - Admin */}
        <Route element={<DashboardLayoutAdmin />}>
          <Route path="/dashboard/admin" element={<PrivateRoute requiredRole="admin">  <DashboardAdmin /></PrivateRoute>} />
          <Route path="/dashboard/admin/supervisor" element={<PrivateRoute requiredRole="admin"><SupervisorsAdmin /></PrivateRoute>} />
        </Route>

        {/* Rutas Protegidas - Supervisor */}
        <Route element={<DashboardLayoutSupervisor />}>
          <Route path="/dashboard/supervisors" element={<PrivateRoute requiredRole="supervisor"><DashboardSupervisor /></PrivateRoute>} />
          <Route path="/dashboard/supervisors/operadores" element={<PrivateRoute requiredRole="supervisor"><OperatorsAdmin /></PrivateRoute>} />
          <Route path="/dashboard/supervisors/reportes" element={<PrivateRoute requiredRole="supervisor"> <ReportesSupervisor /></PrivateRoute>} />
        </Route>

        {/* Rutas Protegidas - Operador */}
        <Route element={<DashboardLayoutOperador />}>
          <Route path="/dashboard/operador" element={<PrivateRoute requiredRole="operator"><DashboardOperador /></PrivateRoute>} />
          <Route path="/dashboard/operador/incidencia" element={<PrivateRoute requiredRole="operator"><IncidenciaOperador /></PrivateRoute>} />
          <Route path="/dashboard/operador/incidencia/:code" element={<PrivateRoute requiredRole="operator"><IncidenciaDetalle /></PrivateRoute>} />
        </Route>

        {/* Página 404 personalizada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
