import { Navigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useUserContext();
  
  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/app/chat" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
