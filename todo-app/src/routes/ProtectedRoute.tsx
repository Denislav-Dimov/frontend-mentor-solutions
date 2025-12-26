import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!currentUser || !currentUser.emailVerified) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
