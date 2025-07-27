import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const PublicRouter = ({ element }) => {
  const location = useLocation();
  const { authorized, role } = useSelector((state) => state.auth);

  // Determina la URL a redirigir si ya está autorizado
  const getRedirectPath = () => {
    // Normalizar rol para comparación case-insensitive
    const normalizedRole = role?.toLowerCase();
    
    switch (normalizedRole) {
      case 'admin':
        return '/dashboard/admin/incidencia';
      case 'supervisor':
        return '/dashboard/supervisors/incidencia';
      case 'operator':
      case 'cazador':
        return '/dashboard/operador/incidencia';
      case 'operador':
      default:
        return '/dashboard/operador/incidencia';
    }
  };

  return authorized ? <Navigate to={getRedirectPath()} /> : element;
};

export default PublicRouter;
