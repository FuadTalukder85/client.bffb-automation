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

// Map frontend type to backend type
const TYPE_MAP = {
  solid: "solid",
  liquid: "liquid",
};

/**
 * Pure helper function to prepare API params
 */
const prepareRawMaterialParams = ({ searchTerm = "", status = "active", type = "all", page, limit }) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  // Map frontend status to backend isActive
  if (status) {
    params.isActive = STATUS_MAP[status];
  }

  // Map frontend type to backend type
  if (type && type !== "all") {
    params.type = TYPE_MAP[type];
  }

  return params;
};

/**
 * Format cost from number to display string
 */
const formatCost = (cost) => {
  if (cost === undefined || cost === null) return "0.00";
  return cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Transform server raw material to client format
 */
const transformRawMaterial = (item) => ({
  id: item._id,
  name: item.name,
  type: item.type === 'solid' ? 'Solid' : 'Liquid',
  cost: formatCost(item.cost),
  status: item.isActive ? 'Active' : 'Archived',
  isActive: item.isActive,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Specialized hook for fetching raw materials using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (name)
 * @param {string} filters.status - Status filter (active|archived|all)
 * @param {string} filters.type - Type filter (solid|liquid|all)
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useRawMaterials(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareRawMaterialParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.rawMaterials.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/raw-materials", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      // Normalize response structure
      const result = responseData?.data || responseData || {};
      return {
        data: (result.data || result.items || []).map(transformRawMaterial),
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

/**
 * Hook for fetching a single raw material by ID
 */
export function useRawMaterial(rawMaterialId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.rawMaterials.detail(rawMaterialId),
    queryFn: async ({ signal }) => {
      const response = await api.get(`/raw-materials/${rawMaterialId}`, { signal });
      return response.data;
    },
    enabled: enabled && !!rawMaterialId,
    select: (response) => {
      const data = response?.data || response;
      return data ? transformRawMaterial(data) : null;
    },
  });
}