import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

// Map frontend status to backend status
const STATUS_MAP = {
  not_started: "not_started",
  in_progress: "in_progress",
  completed: "completed",
  rework: "rework",
  approved: "approved",
  paused: "paused",
  cancelled: "cancelled",
};

/**
 * Pure helper function to prepare API params
 */
const prepareProjectParams = ({ searchTerm = "", status = "all", page, limit, isActive = "true" }) => {
  const params = { page, limit, isActive };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  // Map frontend status to backend status if provided
  if (status && status !== "all") {
    const mappedStatus = STATUS_MAP[status] || status.toLowerCase().replace(" ", "_");
    params.status = mappedStatus;
  }

  return params;
};

/**
 * Specialized hook for fetching projects using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (project name or description)
 * @param {string} filters.status - Status filter
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useProjects(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareProjectParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.projects.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/projects", { params: apiParams, signal }).then((res) => res.data),
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
 * Hook for fetching a single project by ID
 */
export function useProject(projectId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: async ({ signal }) => {
      const response = await api.get(`/projects/${projectId}`, { signal });
      return response.data;
    },
    enabled: enabled && !!projectId,
    select: (response) => response?.data || response,
  });
}

