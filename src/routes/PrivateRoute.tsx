import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { authorized, role } = useSelector((state: any) => state.auth);

  if (!authorized) return <Navigate to="/login" />;
  if (requiredRole && role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
