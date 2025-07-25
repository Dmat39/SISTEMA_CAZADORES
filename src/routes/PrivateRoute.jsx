
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const { authorized, role } = useSelector((state) => state.auth);

  if (!authorized) return <Navigate to="/login" />;
  
  // Función para verificar si el rol tiene acceso
  const hasAccess = () => {
    if (!requiredRole) return true;
    
    // Permitir que CAZADOR acceda a rutas de OPERATOR
    if (requiredRole === 'operator' && (role === 'operator' || role === 'cazador')) {
      return true;
    }
    
    // Para otros roles, verificación exacta
    return role === requiredRole;
  };

  if (!hasAccess()) return <Navigate to="/unauthorized" />;

  return children;
};

export default PrivateRoute;
