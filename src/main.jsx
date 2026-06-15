import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { router } from "./router.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerServiceWorker } from "./utils/push-notifications";

// Register service worker
registerServiceWorker();

// Initialize QueryClient with safe defaults and global error handling
const queryClient = new QueryClient();

// Configure global mutation error handling
let lastMutationErrorToast = { message: "", status: null, at: 0 };
queryClient.getMutationCache().config.onError = (error, _variables, _context, mutation) => {
  if (mutation?.options?.meta?.skipGlobalErrorToast) {
    return;
  }

  // Handle generic errors from axios/fetch
  let errorMessage = "An unexpected error occurred";

  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") {
      errorMessage = data;
    } else if (data.message) {
      errorMessage = data.message;
    } else if (data.error) {
      errorMessage = data.error;
    } else if (data.errors && Array.isArray(data.errors)) {
      errorMessage = data.errors[0];
    } else if (typeof data === "object") {
      // If it's an object but no known keys, take the first string value or stringify
      const values = Object.values(data);
      const firstString = values.find(v => typeof v === 'string');
      errorMessage = firstString || JSON.stringify(data);
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }

  const status = error?.response?.status || null;
  const now = Date.now();
  const message = String(errorMessage);
  const isDuplicate =
    lastMutationErrorToast.message === message &&
    lastMutationErrorToast.status === status &&
    now - lastMutationErrorToast.at < 800;

  if (isDuplicate) {
    return;
  }

  lastMutationErrorToast = { message, status, at: now };

  toast.error(message, {
    duration: 1000,
  });
};

queryClient.setDefaultOptions({
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
             <Toaster
              position="top-right"
              expand={false}
              richColors
              toastOptions={{
              className: 'p-2! lg:p-2.5! xl:p-3.5! 2xl:p-4! 3xl:p-5! max-w-[384px] lg:max-w-[204px] xl:max-w-[273px] 2xl:max-w-[307px] 3xl:max-w-[384px] text-xs! lg:text-[6.5px]! xl:text-[8.5px]! 2xl:text-[9.5px]! 3xl:text-xs!',
                  }}
              />
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
