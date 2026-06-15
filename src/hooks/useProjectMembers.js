import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook for fetching project members
 * @param {string} projectId - The project ID
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch }
 */
export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: queryKeys.projectMembers.list(projectId),
    queryFn: () => api.get(`/project-members/${projectId}/members`).then((res) => res.data),
    enabled: !!projectId,
    select: (responseData) => {
      const data = responseData?.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}