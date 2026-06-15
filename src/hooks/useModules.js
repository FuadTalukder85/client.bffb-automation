import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook for fetching all modules
 */
export function useModules({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.modules.list(),
    queryFn: async ({ signal }) => {
      const response = await api.get("/modules", { signal });
      return response.data;
    },
    enabled,
    select: (response) => {
      const data = response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    },
  });
}

/**
 * Hook for fetching submodules for a specific module
 */
export function useSubModules(moduleKey, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.modules.submodules(moduleKey),
    queryFn: async ({ signal }) => {
      const response = await api.get(`/modules/${moduleKey}/submodules`, { signal });
      return response.data;
    },
    enabled: enabled && !!moduleKey,
    select: (response) => {
      const data = response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    },
  });
}
