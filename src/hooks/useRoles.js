import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

/**
 * Pure helper function to prepare API params
 */
const prepareRoleParams = ({ page, limit, isActive, search }) => {
  const params = { page, limit };
  if (isActive !== undefined) {
    params.isActive = isActive;
  }
  if (search) {
    params.search = search;
  }
  return params;
};

/**
 * Specialized hook for fetching roles using TanStack Query
 * @param {Object} filters
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @param {boolean} filters.isActive - Filter by active status (optional)
 * @param {string} filters.search - Search term (optional)
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useRoles(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareRoleParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.roles.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/roles", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      // Normalize response structure
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || result || [],
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

