// src/Router.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPage from "../pages/dashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/Login";
import SupervisorPage from "../pages/Supervisors";
import ReportPage from "../pages/Report";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import PrivateRoute from "../routes/PrivateRoute";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Publicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas Protegidas */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/supervisors" element={<SupervisorPage />} />
          <Route path="/dashboard/report" element={<ReportPage />} />
        </Route>

        {/* Página 404 personalizada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
