import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

/**
 * Pure helper function to prepare API params for categories
 */
const prepareCategoryParams = ({
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
 * Hook for fetching categories using TanStack Query
 */
export function useCategories(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit, enabled = true, ...rest } = filters;
  const apiParams = prepareCategoryParams({ ...rest, page, limit });

  return useQuery({
    queryKey: queryKeys.categories.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/categories", { params: apiParams, signal }).then((res) => res.data),
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

/**
 * Pure helper function to prepare API params for subcategories
 */
const prepareSubcategoryParams = ({
  category = "",
  categoryId = "",
  searchTerm = "",
  isActive = "all",
  page,
  limit,
  sortBy = "",
  sortOrder = "",
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();
  const resolvedCategory = category || categoryId;

  if (resolvedCategory) {
    params.category = resolvedCategory;
  }

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
 * Hook for fetching subcategories using TanStack Query
 */
export function useSubcategories(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit, enabled = true, ...rest } = filters;
  const apiParams = prepareSubcategoryParams({ ...rest, page, limit });

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

/**
 * Pure helper function to prepare API params for sub-subcategories
 */
const prepareSubSubcategoryParams = ({
  category = "",
  categoryId = "",
  subCategory = "",
  subCategoryId = "",
  searchTerm = "",
  isActive = "all",
  page,
  limit,
  sortBy = "",
  sortOrder = "",
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();
  const resolvedCategory = category || categoryId;
  const resolvedSubCategory = subCategory || subCategoryId;

  if (resolvedCategory) {
    params.category = resolvedCategory;
  }

  if (resolvedSubCategory) {
    params.subCategory = resolvedSubCategory;
  }

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
 * Pure helper function to prepare API params for application tags
 */
const prepareTagParams = ({
  subCategory = "",
  subCategoryId = "",
  searchTerm = "",
  isActive = "all",
  page,
  limit,
  sortBy = "",
  sortOrder = "",
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();
  const resolvedSubCategory = subCategory || subCategoryId;

  if (resolvedSubCategory) {
    params.subCategory = resolvedSubCategory;
  }

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
 * Hook for fetching sub-subcategories using TanStack Query
 */
export function useSubSubcategories(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit, enabled = true, ...rest } = filters;
  const apiParams = prepareSubSubcategoryParams({ ...rest, page, limit });

  return useQuery({
    queryKey: queryKeys.subsubcategories.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/subsubcategories", { params: apiParams, signal }).then((res) => res.data),
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

/**
 * Hook for fetching application tags using TanStack Query
 */
export function useTags(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit, enabled = true, ...rest } = filters;
  const apiParams = prepareTagParams({ ...rest, page, limit });

  return useQuery({
    queryKey: queryKeys.applicationTags.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/application-tags", { params: apiParams, signal }).then((res) => res.data),
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

/**
 * Hook for fetching a single category using TanStack Query
 */
export function useCategory(id) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: ({ signal }) =>
      api.get(`/categories/${id}`, { signal }).then((res) => res.data),
    enabled: !!id,
    select: (responseData) => responseData?.data || responseData,
  });
}

/**
 * Hook for fetching a single subcategory using TanStack Query
 */
export function useSubcategory(id) {
  return useQuery({
    queryKey: queryKeys.subcategories.detail(id),
    queryFn: ({ signal }) =>
      api.get(`/subcategories/${id}`, { signal }).then((res) => res.data),
    enabled: !!id,
    select: (responseData) => responseData?.data || responseData,
  });
}