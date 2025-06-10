// src/Router.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// LAYOUTS
import DashboardLayoutAdmin from "../layouts/DashboardLayoutAdmin";
import DashboardLayoutSupervisor from "../layouts/DashboardLayoutSupervisor";
import DashboardLayoutOperador from "../layouts/DashboardLayoutOperador";
// LOGIN
import LoginPage from "../pages/Login";
// NO AUTORIZADO PAGE
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
// ADMIN PAGE
import DashboardAdmin from "../pages/Admin/Dashboard";
import SupervisorsAdmin from "../pages/Admin/Supervisors";
// SUPERVISOR PAGE
import DashboardSupervisor from "../pages/Supervisors/Dashboard";
import OperadoresPage from "../pages/Supervisors/Operadores";
import ReportesSupervisor from "../pages/Supervisors/Reportes";
// OPERADOR PAGE
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
          <Route path="/dashboard" element={<DashboardAdmin />} />
          <Route path="/dashboard/supervisors" element={<SupervisorsAdmin />} />
        </Route>

        {/* Rutas Protegidas - Supervisor */}
        <Route element={<DashboardLayoutSupervisor />}>
          <Route path="/dashboard/supervisors" element={<DashboardSupervisor />} />
          <Route path="/dashboard/supervisors/operadores" element={<OperadoresPage />} />
          <Route path="/dashboard/supervisors/reportes" element={<ReportesSupervisor />} />
        </Route>

        {/* Rutas Protegidas - Operador */}
        <Route element={<DashboardLayoutOperador />}>
          <Route path="/dashboard/operador" element={<DashboardOperador />} />
          <Route path="/dashboard/operador/incidencias" element={<IncidenciaOperador />} />
          <Route path="/dashboard/operador/incidencias/detalle" element={<IncidenciaDetalle />} />
        </Route>

        {/* Página 404 personalizada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
