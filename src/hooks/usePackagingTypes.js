import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

// Map frontend status to backend isActive
const STATUS_MAP = {
  active: "true",
  archived: "false",
  all: "all",
};

/**
 * Pure helper function to prepare API params
 */
const preparePackagingTypeParams = ({ searchTerm = "", status = "active", page, limit }) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  // Map frontend status to backend isActive
  if (status && status !== "all") {
    params.isActive = STATUS_MAP[status];
  }

  return params;
};

/**
 * Transform server packaging type to client format
 */
const transformPackagingType = (item) => ({
  id: item._id,
  name: item.title, // Server uses 'title', client uses 'name'
  status: item.isActive ? 'Active' : 'Archived',
  isActive: item.isActive,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Specialized hook for fetching packaging types using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (name/title)
 * @param {string} filters.status - Status filter (active|archived|all)
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function usePackagingTypes(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = preparePackagingTypeParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.packagingTypes.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/packaging-types", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      // Normalize response structure
      const result = responseData?.data || responseData || {};
      return {
        data: (result.data || result.items || []).map(transformPackagingType),
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

/**
 * Hook for fetching a single packaging type by ID
 */
export function usePackagingType(packagingTypeId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.packagingTypes.detail(packagingTypeId),
    queryFn: async ({ signal }) => {
      const response = await api.get(`/packaging-types/${packagingTypeId}`, { signal });
      return response.data;
    },
    enabled: enabled && !!packagingTypeId,
    select: (response) => {
      const data = response?.data || response;
      return data ? transformPackagingType(data) : null;
    },
  });
}