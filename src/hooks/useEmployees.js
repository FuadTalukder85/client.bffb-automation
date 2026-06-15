import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const STATUS_PARAM_MAP = {
  active: true,
  archived: false,
};

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

/**
 * Pure helper function to prepare API params
 */
const prepareUserParams = ({ searchTerm = "", statusFilter = "all", page, limit }) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  if (statusFilter === "blocked") {
    params.isBlocked = true;
    params.isActive = STATUS_PARAM_MAP.active;
  } else if (statusFilter !== "all") {
    params.isBlocked = false;
    params.isActive = STATUS_PARAM_MAP[statusFilter];
  }

  return params;
};

/**
 * Specialized hook for fetching employees using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (name or email)
 * @param {string} filters.statusFilter - Status filter (all|active|archived)
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useEmployees(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareUserParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.users.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/user", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData, // Keeps table data visible during page switch
    select: (responseData) => {
      // Normalize response structure
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || [],
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

