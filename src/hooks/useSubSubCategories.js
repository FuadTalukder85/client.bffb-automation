import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

/**
 * Pure helper function to prepare API params for subsubcategories
 */
const prepareSubSubCategoryParams = ({
  searchTerm = "",
  category = "",
  subCategory = "",
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

  if (subCategory && subCategory !== "all") {
    params.subCategory = subCategory;
  }

  return params;
};

/**
 * Hook for fetching subsubcategories using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term
 * @param {string} filters.category - Category ID filter
 * @param {string} filters.subCategory - SubCategory ID filter
 * @param {number} filters.page - Current page
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useSubSubCategories(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareSubSubCategoryParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.subsubcategories.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/subsubcategories", { params: apiParams, signal }).then((res) => res.data),
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