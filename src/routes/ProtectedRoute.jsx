import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import api from "@/lib/api";

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (token) {
      api.get("/auth/me")
        .then((res) => {
          if (res.data?.data) {
            setUser(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch latest user profile:", err);
        });
    }
  }, [token, setUser]);

  // If user is not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render child routes
  return <Outlet />;
}
