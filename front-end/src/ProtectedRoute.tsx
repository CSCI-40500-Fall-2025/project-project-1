import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait for auth to load before making redirect decisions
  if (loading) {
    return null; // or a loading spinner
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
