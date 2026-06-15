import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook for fetching users with optional filters
 * @param {Object} options
 * @param {boolean} options.activeOnly - Only fetch active users
 * @param {string} options.search - Search term
 * @returns {Object} Query result with users array
 */
export function useUsers({ activeOnly = false, search = "" } = {}) {
  return useQuery({
    queryKey: queryKeys.users.list({ isActive: activeOnly, search, limit: 100 }),
    queryFn: ({ signal }) =>
      api.get("/user", {
        params: { isActive: activeOnly || undefined, search: search || undefined, limit: 100 },
        signal,
      }).then((res) => res.data),
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      return result.data || result.items || [];
    },
  });
}

/**
 * Hook for fetching a single user by ID with proper caching
 * @param {string} userId - The user ID to fetch
 * @returns {Object} Query result with user data
 */
export function useUser(userId) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: ({ signal }) =>
      api.get(`/user/${userId}`, {
        signal,
      }).then((res) => res.data),
    select: (responseData) => {
      // Handle the nested response format: { data: { user: {...}, role: "..." } }
      const userData = responseData?.data?.user;
      const role = responseData?.data?.role;
      
      if (userData && role) {
        // Merge user data with role
        return {
          ...userData,
          role: role
        };
      }
      
      // Fallback for unexpected response format
      return userData || responseData?.data || responseData;
    },
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
  });
}
