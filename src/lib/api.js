import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { decodeHtmlEntitiesInData } from "../utils/htmlUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 1. Create the main instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Critical: sends cookies (refreshToken) automatically
});

// 2. Queue Variables
// keeps track of whether we are currently refreshing
let isRefreshing = false;
// holds requests that failed while we were refreshing
let failedQueue = [];

/**
 * Helper to process the queue
 * If we have a new token, resolve all promises.
 * If error, reject all promises.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 3. Request Interceptor (Standard)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Response Interceptor (The Advanced Logic)
api.interceptors.response.use(
  (response) => {
    // Skip HTML-decoding for binary responses (e.g., file downloads)
    const responseType = response.config?.responseType;
    if (responseType === "blob" || responseType === "arraybuffer") {
      return response;
    }

    // Decode HTML entities in response data
    if (response.data) {
      response.data = decodeHtmlEntitiesInData(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401, or we already tried to retry this request, just reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh token for auth endpoints (login, register, refresh itself)
    // These endpoints should fail naturally without triggering token refresh
    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // === SCENARIO 1: Refresh is already in progress ===
    // If multiple requests fail, only the first one triggers the refresh.
    // The rest wait here in the queue.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // When queue processes, update the header and retry
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // === SCENARIO 2: We are the first failure. Start Refresh. ===
    originalRequest._retry = true; // Mark this request as retried
    isRefreshing = true;

    try {
      // Make the refresh call using a clean axios instance to avoid circular interceptors
      // We rely on the 'withCredentials: true' to send the httpOnly cookie
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = response.data.data.accessToken;

      // 1. Update the store
      useAuthStore.getState().setAccessToken(newToken);

      // 2. Process the queue (release all waiting requests)
      processQueue(null, newToken);

      // 3. Retry the original failed request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails (e.g., token expired fully), logout the user
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
