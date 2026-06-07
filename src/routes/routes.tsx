import { BrowserRouter, Routes, Route } from "react-router-dom";import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/Login";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import PrivateRoute from "./routes/PrivateRoute";
import DashboardAdmin from "../pages/Admin/Dashboard_admin";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Ruta protegida */}
        <Route path="/dashboard/admin" element={<PrivateRoute><DashboardAdmin /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
