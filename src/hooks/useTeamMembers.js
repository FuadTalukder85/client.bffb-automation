import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook for fetching team members using TanStack Query
 * @param {string} teamId - The team ID to fetch members for
 * @param {Object} options - Additional query options
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch }
 */
export function useTeamMembers(teamId, options = {}) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId),
    queryFn: ({ signal }) =>
      api.get(`/teams/${teamId}/members`, { signal }).then((res) => res.data),
    enabled: !!teamId, // Only run query if teamId is provided
    select: (responseData) => {
      // Normalize response: Backend returns { data: { data: [...], pagination: {...} }, message: "..." }
      const result = responseData?.data || responseData || {};
      return result.data || result.items || [];
    },
    ...options,
  });
}