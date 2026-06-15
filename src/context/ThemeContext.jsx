// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuthStore } from "../store/useAuthStore";

// 1. Create the context
const ThemeContext = createContext();

// 2. Create the provider
export function ThemeProvider({ children }) {
  // Get theme from auth store
  const authTheme = useAuthStore((state) => state.theme);

  // 3. Manage theme state - sync with auth store
  const [theme, setTheme] = useState(() => {
    // Priority: auth store > localStorage > system > default
    if (authTheme) {
      return authTheme;
    }
    if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  // Sync with auth store theme when it changes
  useEffect(() => {
    if (authTheme && authTheme !== theme) {
      setTheme(authTheme);
    }
  }, [authTheme]);

  // 4. Update <html> tag when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // 5. Provide the state and setter to children
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 6. Create a custom hook for easy access
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
