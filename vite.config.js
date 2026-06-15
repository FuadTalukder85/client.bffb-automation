import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot', 'lucide-react', 'react-icons', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-devtools', '@tanstack/react-table'],
          'vendor-motion': ['framer-motion'],
          'vendor-utils': ['date-fns', 'zod', 'zustand', 'axios'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers'],
          'vendor-excel': ['xlsx'],
        },
      },
    },
  },
});