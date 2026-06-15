import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

/**
 * Pure helper function to prepare API params for subcategories
 */
const prepareSubCategoryParams = ({
  searchTerm = "",
  category = "",
  page,
  limit,
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  if (category && category !== "all") {
    params.category = category;
  }

  return params;
};

/**
 * Hook for fetching subcategories using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term
 * @param {string} filters.category - Category ID filter
 * @param {number} filters.page - Current page
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useSubCategories(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit, enabled = true, ...rest } = filters;
  const apiParams = prepareSubCategoryParams({ ...rest, page, limit });

  return useQuery({
    queryKey: queryKeys.subcategories.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/subcategories", { params: apiParams, signal }).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || [],
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}