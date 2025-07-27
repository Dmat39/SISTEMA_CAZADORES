
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const { authorized, role } = useSelector((state) => state.auth);

  if (!authorized) return <Navigate to="/login" />;
  
  // Función para verificar si el rol tiene acceso
  const hasAccess = () => {
    if (!requiredRole) return true;
    
    // Normalizar roles a minúsculas para comparación case-insensitive
    const normalizedRole = role?.toLowerCase();
    const normalizedRequiredRole = requiredRole?.toLowerCase();
    
    // Permitir que CAZADOR acceda a rutas de OPERATOR
    if (normalizedRequiredRole === 'operator' && (normalizedRole === 'operator' || normalizedRole === 'cazador')) {
      return true;
    }
    
    // Para otros roles, verificación exacta (case-insensitive)
    return normalizedRole === normalizedRequiredRole;
  };

  if (!hasAccess()) return <Navigate to="/unauthorized" />;

  return children;
};

export default PrivateRoute;
