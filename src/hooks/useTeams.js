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
const prepareTeamParams = ({ searchTerm = "", statusFilter = "active", page, limit }) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  // Map statusFilter to isActive boolean
  if (statusFilter !== "all" && STATUS_PARAM_MAP[statusFilter] !== undefined) {
    params.isActive = STATUS_PARAM_MAP[statusFilter];
  }

  return params;
};

/**
 * Specialized hook for fetching teams using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (team name or description)
 * @param {string} filters.statusFilter - Status filter (all|active|archived)
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useTeams(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareTeamParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.teams.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/teams", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      // Normalize response: Backend returns { data: { data: [...], pagination: {...} }, message: "..." }
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || [],
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

