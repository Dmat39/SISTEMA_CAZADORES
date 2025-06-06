// src/Router.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import DashboardPage from '../pages/dashboard';
import LoginPage from '../pages/Login';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';
import PrivateRoute from '../routes/PrivateRoute';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
    
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Página 404 personalizada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
