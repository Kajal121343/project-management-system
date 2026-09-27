import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/common/Loader.jsx";
export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, initialized, loading } = useSelector((s) => s.auth);
  if (!initialized || loading) return <Loader text="Checking authentication..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
