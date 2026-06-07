import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PublicRouter = ({ element }: { element: React.ReactNode }) => {
  const { authorized, role } = useSelector((state: any) => state.auth);

  const getRedirectPath = () => {
    switch (role?.toLowerCase()) {
      case 'administrator': return '/dashboard/admin/incidencia';
      case 'visualizer':    return '/dashboard/visualizer/incidencia';
      case 'supervisor':    return '/dashboard/supervisors/incidencia';
      case 'hunter':        return '/dashboard/cazador/incidencia';
      default:              return '/login';
    }
  };

  return authorized ? <Navigate to={getRedirectPath()} /> : element;
};

export default PublicRouter;
