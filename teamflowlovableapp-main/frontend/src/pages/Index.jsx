import { Navigate } from "react-router-dom";
import { useAuth, dashboardPathFor } from "@/context/auth";

const Index = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }
  return <Navigate to={user ? dashboardPathFor(user.role) : "/login"} replace />;
};

export default Index;

