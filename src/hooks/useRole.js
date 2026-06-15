import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook for fetching a single role by ID
 */
export function useRole(roleId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.roles.detail(roleId),
    queryFn: async ({ signal }) => {
      const response = await api.get(`/roles/${roleId}`, { signal });
      return response.data;
    },
    enabled: enabled && !!roleId,
    select: (response) => response?.data?.role || response?.role || response?.data,
  });
}

/**
 * Hook for fetching role permissions
 */
export function useRolePermissions(roleId, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...queryKeys.roles.detail(roleId), 'permissions'],
    queryFn: async ({ signal }) => {
      const response = await api.get(`/roles/${roleId}/permissions`, { signal });
      return response.data;
    },
    enabled: enabled && !!roleId,
    select: (response) => response?.data?.permissions || response?.permissions || [],
  });
}
