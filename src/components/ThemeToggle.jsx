import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/useAuthStore";
import api from "../lib/api";
import SunIcon from "@/assets/components/sun.svg?react";
import MoonIcon from "@/assets/components/moon.svg?react";

export function ThemeToggle({className = ""}) {
  const { theme, setTheme } = useTheme();
  const authSetTheme = useAuthStore((state) => state.setTheme);
  const authSetUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";

    try {
      // Call backend API to toggle theme
      const response = await api.post("/auth/me/toggle-theme");
      const { themePreference } = response.data.data;

      // Update local state
      setTheme(themePreference);

      // Update auth store
      authSetTheme(themePreference);

      // Update user object in auth store
      if (user) {
        authSetUser({ ...user, themePreference });
      }
    } catch (error) {
      console.error("Failed to toggle theme:", error);
      // Fallback to local toggle if API fails
      setTheme(newTheme);
      authSetTheme(newTheme);
    }
  };

  return (
    <div 
      onClick={toggleTheme}
      className={`relative flex items-center w-16 overflow-hidden border-0 rounded-full shadow-sm h-7 3xl:w-18 2xl:w-14 xl:w-12 lg:w-10 3xl:h-7 2xl:h-6 xl:h-5 lg:h-5 cursor-pointer ${className}`}
    >
      {/* Sliding background indicator */}
      <div
        className={`absolute top-0 w-1/2 h-full transition-transform duration-200 ${
          theme === "light"
            ? "translate-x-0 bg-[#EEEBF4]"
            : "translate-x-full bg-[#2c213d]"
        }`}
      />

      {/* Sun icon - Light mode (Left side) */}
      <div
        className={`relative z-10 w-1/2 h-full flex items-center justify-center transition-transform duration-200 ${
          theme === "light"
            ? "scale-110"
            : "bg-primary-shade-3 scale-100"
        }`}
      >
        <SunIcon
          className={`3xl:size-4 2xl:size-3.5 xl:size-3 lg:size-2.5 pointer-events-none ${
            theme === "dark" ? "text-white" : "text-[#552e8e]"
          }`}
        />
      </div>

      {/* Moon icon - Dark mode (Right side) */}
      <div
        className={`relative z-10 w-1/2 h-full flex items-center justify-center transition-transform duration-200 ${
          theme === "dark" ? "scale-110" : "scale-100"
        }`}
      >
        <MoonIcon
          className={`3xl:size-4 2xl:size-3.5 xl:size-3 lg:size-2.5 pointer-events-none ${
            theme === "light" ? "text-black" : "text-nav-highlight"
          }`}
        />
      </div>
    </div>
  );
}
