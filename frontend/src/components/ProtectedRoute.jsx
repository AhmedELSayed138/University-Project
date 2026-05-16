import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="center-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;

  return <Outlet />;
}
