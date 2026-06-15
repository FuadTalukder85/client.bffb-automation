import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const CATEGORY_PARAM_MAP = {
  invites: "user_invitations",
  roles: "role_assignments",
  permissions: "roles_and_permissions",
  all: "all",
};

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

/**
 * Pure helper function to prepare API params for access history
 */
const prepareAccessHistoryParams = ({
  searchTerm = "",
  categoryFilter = "invites",
  page,
  limit,
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  // Add search param if search term provided
  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  // Add category filter
  if (categoryFilter) {
    params.category = CATEGORY_PARAM_MAP[categoryFilter] || categoryFilter;
  }

  return params;
};

/**
 * Specialized hook for fetching access history using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (managedBy name, etc)
 * @param {string} filters.categoryFilter - Category filter (invites|roles|permissions)
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useAccessHistory(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareAccessHistoryParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.accessHistory.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/access-history", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      // The backend returns { history, total, page, limit, totalPages }
      if (!responseData?.data) {
        return { data: [], pagination: DEFAULT_PAGINATION };
      }

      const { history, total, page, limit, totalPages } = responseData.data;
      return {
        data: history || [],
        pagination: { total, page, limit, totalPages },
      };
    },
  });
}

