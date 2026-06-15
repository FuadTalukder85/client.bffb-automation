import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Memoized selector for permissions
const EMPTY_PERMISSIONS = [];
export const selectPermissions = (state) => state.user?.permissions ?? EMPTY_PERMISSIONS;

export const useAuthStore = create(
  persist(
    (set) => ({
      // State
      token: null,
      user: null,
      isAuthenticated: false,
      theme: "light",

      // Actions
      login: (accessToken, user) =>
        set({
          token: accessToken,
          user,
          isAuthenticated: true,
          theme: user?.themePreference || "light",
        }),

      setAccessToken: (accessToken) =>
        set({
          token: accessToken,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          theme: "light",
        }),

      // Helper to update user profile
      setUser: (user) => set({ user }),

      // Update theme preference
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "bff-auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Persist token, user, isAuthenticated, and theme
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
    }
  )
);
