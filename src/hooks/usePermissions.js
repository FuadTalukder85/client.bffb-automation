import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 100 }; // Higher limit for permissions selection

/**
 * Pure helper function to prepare API params
 */
const preparePermissionParams = ({ page, limit, search, isActive }) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (isActive !== undefined) params.isActive = isActive;
  return params;
};

/**
 * Specialized hook for fetching permissions using TanStack Query
 * @param {Object} filters
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @param {string} filters.search - Search term (optional)
 * @param {boolean} filters.isActive - Filter by active status (optional)
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function usePermissions(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = preparePermissionParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.permissions.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/permissions", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      // Normalize response: permissions are typically returned as an array
      const result = responseData?.data || responseData || [];
      return {
        data: Array.isArray(result) ? result : result.data || result.items || [],
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

