import { Navigate, useLocation } from "react-router-dom";
import { useAuth, dashboardPathFor } from "@/context/auth";

export default function ProtectedRoute({ children, allow }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allow.includes(user.role)) return <Navigate to={dashboardPathFor(user.role)} replace />;
  return <>{children}</>;
}

