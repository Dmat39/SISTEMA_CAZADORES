import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/Login";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import PrivateRoute from "./routes/PrivateRoute";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Ruta protegida */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
