import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";
import { adminRu } from "./adminStrings";

export default function AdminProtected({ children }) {
  const { isAuthenticated, authLoading } = useAdminAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-5 text-sm text-stone">
        {adminRu.common.connectingSupabase}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
