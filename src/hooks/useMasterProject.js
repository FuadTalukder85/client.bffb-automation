import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

// Map frontend status to backend status
const STATUS_MAP = {
  not_started: "Not Started",
  in_progress: "In Progress",
  approved: "Approved",
  rework: "Rework",
  completed: "Completed",
};

/**
 * Pure helper function to prepare API params
 */
export const prepareMasterProjectParams = ({
  searchTerm = "",
  status = "all",
  isActive = "true",
  isFeasible = "all",
  category = "",
  subcategory = "",
  subSubcategory = "",
  createdBy = "",
  purpose = "",
  dateFrom = "",
  dateTo = "",
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

  // Map frontend status to backend status if provided
  if (status && status !== "all") {
    const mappedStatus = STATUS_MAP[status] || status;
    params.status = mappedStatus;
  }

  // Handle isActive filter
  if (isActive !== undefined && isActive !== "all") {
    params.isActive = isActive === "true";
  } else if (isActive === "all") {
    params.isActive = "all";
  }

  // Handle isFeasible filter (common.isFeasible)
  if (isFeasible !== undefined && isFeasible !== "all") {
    params.isFeasible = isFeasible === "true";
  } else if (isFeasible === "all") {
    params.isFeasible = "all";
  }

  // Common list filters
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;
  if (subSubcategory) params.subSubcategory = subSubcategory;
  if (createdBy) params.createdBy = createdBy;
  if (purpose) params.purpose = purpose;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  // Sorting
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  return params;
};

/**
 * Specialized hook for fetching master projects using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (project code, title, or brief)
 * @param {string} filters.status - Status filter
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @param {string} filters.sortBy - Sort field
 * @param {string} filters.sortOrder - Sort direction (asc/desc)
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useMasterProjects(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareMasterProjectParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.masterProjects.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/projects/master-projects", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
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

/**
 * Hook for fetching product development projects
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term
 * @param {string} filters.status - Status filter
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result
 */
export function useProductDevelopmentProjects(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareMasterProjectParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.productDevelopmentProjects.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/projects/product-development", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
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

/**
 * Hook for fetching application lab projects
 * @param {Object} filters
 * @returns {Object} TanStack Query result
 */
export function useApplicationLabProjects(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareMasterProjectParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.applicationLabProjects.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/projects/application-lab", { params: apiParams, signal }).then((res) => res.data),
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
 * Hook for fetching sensory lab projects
 * @param {Object} filters
 * @returns {Object} TanStack Query result
 */
export function useSensoryLabProjects(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareMasterProjectParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.sensoryLabProjects.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/projects/sensory-lab", { params: apiParams, signal }).then((res) => res.data),
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
 * Hook for fetching a single project by ID with custom view endpoint
 * @param {string} projectId - Project ID
 * @param {Object} options - Hook options
 * @param {string} options.view - 'master-project', 'product-development', etc. (default is generic /projects/:id)
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch }
 */
export function useMasterProject(projectId, options = {}) {
  const { view, enabled = true } = options;
  const endpoint = view
    ? `/projects/${view}/${projectId}`
    : `/projects/${projectId}`;

  return useQuery({
    queryKey: view
      ? [...queryKeys.projects.detail(projectId), view]
      : queryKeys.projects.detail(projectId),
    queryFn: ({ signal }) =>
      api.get(endpoint, { signal }).then((res) => {
        return res.data;
      }),
    enabled: enabled && !!projectId,
  });
}

/**
 * Convenience hook for fetching product development project details
 * @param {string} projectId - Project ID
 * @returns {Object} TanStack Query result
 */
export function useProductDevelopmentProjectDetails(projectId) {
  return useMasterProject(projectId, { view: 'product-development' });
}

/**
 * Convenience hook for fetching application lab project details
 * @param {string} projectId - Project ID
 * @returns {Object} TanStack Query result
 */
export function useApplicationLabProjectDetails(projectId, options = {}) {
  return useMasterProject(projectId, { view: 'application-lab', ...options });
}

/**
 * Convenience hook for fetching sensory lab project details
 * @param {string} projectId - Project ID
 * @returns {Object} TanStack Query result
 */
export function useSensoryLabProjectDetails(projectId) {
  return useMasterProject(projectId, { view: 'sensory-lab' });
}

/**
 * Hook for fetching master project schedule projects
 * @param {Object} filters
 * @returns {Object} TanStack Query result
 */
export function useMasterProjectSchedule(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareMasterProjectParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.masterProjectSchedule.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/projects/master-project-schedule", { params: apiParams, signal }).then((res) => res.data),
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
