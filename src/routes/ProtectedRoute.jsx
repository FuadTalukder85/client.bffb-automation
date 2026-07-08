import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import api from "@/lib/api";
import { toast } from "sonner";

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (token) {
      api.get("/auth/me")
        .then((res) => {
          if (res.data?.data) {
            const userData = res.data.data;
            if (userData.scope !== "global" && userData.scope !== "application") {
              toast.error("Forbidden: You do not have access to this application.");
              logout();
            } else {
              setUser(userData);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch latest user profile:", err);
          if (err.response?.status === 403 || err.response?.status === 401) {
            logout();
          }
        });
    }
  }, [token, setUser, logout]);

  // If user is not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Guard against unauthorized scope access immediately if user data is loaded
  if (user && user.scope !== "global" && user.scope !== "application") {
    logout();
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render child routes
  return <Outlet />;
}
