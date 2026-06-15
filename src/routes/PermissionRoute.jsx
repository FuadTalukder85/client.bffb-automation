import { Navigate } from "react-router";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { hasPermission } from "@/lib/utils";

export function PermissionRoute({ requiredPermission, redirectTo = "/dashboard", children }) {
  const { permissions, loading } = useUserPermissions();

  if (loading) {
    return null;
  }

  if (!hasPermission(permissions, requiredPermission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
