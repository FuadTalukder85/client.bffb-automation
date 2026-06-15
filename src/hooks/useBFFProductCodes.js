import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

// Product segments enum (matching backend)
export const PRODUCT_SEGMENTS = {
  FLAVOURS: "flavours",
  COLOURS: "colours",
  INGREDIENTS: "ingredients",
  SEASONINGS: "seasonings",
};

// Product types enum (matching backend)
export const PRODUCT_TYPES = {
  SOLID: "solid",
  LIQUID: "liquid",
};

/**
 * Pure helper function to prepare API params for BFF product codes
 */
const prepareProductCodeParams = ({
  searchTerm = "",
  segment = "all",
  type = "all",
  isActive = "all",
  page,
  limit,
  sortBy = "",
  sortOrder = "",
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  if (segment !== "all") {
    params.segment = segment;
  }

  if (type !== "all") {
    params.type = type;
  }

  if (isActive !== "all") {
    params.isActive = isActive;
  }

  if (sortBy) {
    params.sortBy = sortBy;
    params.sortOrder = sortOrder;
  }

  return params;
};

/**
 * Hook for fetching BFF product codes using TanStack Query
 */
export function useBFFProductCodes(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareProductCodeParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.bffProductCodes.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/bff-product-codes", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const normalizedData = (result.data || result.items || []).map((item) => ({
        ...item,
        displayProductCode:
          item.displayProductCode || item.commercializedProductCode || item.productCode || "",
      }));
      return {
        data: normalizedData,
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

/**
 * Pure helper for segment-specific params
 */
const prepareSegmentParams = ({
  searchTerm = "",
  isActive = "all",
  page,
  limit,
  sortBy = "",
  sortOrder = "",
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  if (isActive !== "all") {
    params.isActive = isActive;
  }

  if (sortBy) {
    params.sortBy = sortBy;
    params.sortOrder = sortOrder;
  }

  return params;
};

/**
 * Hook for fetching BFF product codes by segment using TanStack Query
 */
export function useBFFProductCodesBySegment({ segment, ...filters } = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareSegmentParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.bffProductCodes.bySegment(segment, apiParams),
    queryFn: ({ signal }) =>
      api.get(`/bff-product-codes/segment/${segment}`, { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    enabled: !!segment,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const normalizedData = (result.data || result.items || []).map((item) => ({
        ...item,
        displayProductCode:
          item.displayProductCode || item.commercializedProductCode || item.productCode || "",
      }));
      return {
        data: normalizedData,
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}
