import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const PublicRouter = ({ element }) => {
  const location = useLocation();
  const { authorized, role } = useSelector((state) => state.auth);

  // Determina la URL a redirigir si ya está autorizado
  const getRedirectPath = () => {
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'supervisor':
        return '/dashboard/supervisors/incidencia';
      case 'operador':
      default:
        return '/dashboard/operador/incidencia';
    }
  };

  return authorized ? <Navigate to={getRedirectPath()} /> : element;
};

export default PublicRouter;
