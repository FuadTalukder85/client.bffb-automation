import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook for fetching current user's permissions using TanStack Query
 * @returns {Object} TanStack Query result with { permissions, loading (isLoading), error }
 */
export function useUserPermissions() {
  const query = useQuery({
    queryKey: queryKeys.auth.permissions(),
    queryFn: ({ signal }) =>
      api.get("/auth/me/permissions", { signal }).then((res) => res.data),
    select: (responseData) => {
      const permissions = responseData?.data?.permissions || responseData?.permissions || [];
      // Extract permission keys from objects if needed
      return permissions.map(perm => typeof perm === 'string' ? perm : perm.key).filter(Boolean);
    },
  });

  // Return with backwards compatible naming
  return {
    permissions: query.data || [],
    loading: query.isLoading,
    error: query.error,
  };
}