import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const STATUS_MAP = {
  "Not Started": "pending",
  "In Progress": "in_progress",
  Completed: "completed",
  Cancelled: "cancelled",
  Transferred: "transferred",
};

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

/**
 * Pure helper function to prepare API params for project tasks
 */
const prepareProjectTaskParams = ({
  searchTerm = "",
  status = "all",
  projectId,
  teamId,
  assignedTo,
  page,
  limit,
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  // Map frontend status to backend status
  if (status && status !== "all") {
    const mappedStatus = STATUS_MAP[status] || status.toLowerCase().replace(" ", "_");
    params.status = mappedStatus;
  }

  if (projectId) params.projectId = projectId;
  if (teamId) params.teamId = teamId;
  if (assignedTo) params.assignedTo = assignedTo;

  return params;
};

/**
 * Specialized hook for fetching project tasks using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term
 * @param {string} filters.status - Status filter
 * @param {string} filters.projectId - Filter by project ID
 * @param {string} filters.teamId - Filter by team ID
 * @param {string} filters.assignedTo - Filter by assigned user ID
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useProjectTasks(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareProjectTaskParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.projectTasks.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/project-tasks", { params: apiParams, signal }).then((res) => res.data),
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
 * Pure helper function to prepare params for project-specific task queries
 */
const prepareProjectTasksByProjectParams = ({
  searchTerm = "",
  status,
  isActive,
  page,
  limit,
}) => {
  const params = { page, limit };

  if (searchTerm.trim()) {
    params.search = searchTerm.trim();
  }
  if (status && status !== "all") {
    const mappedStatus = STATUS_MAP[status] || status.toLowerCase().replace(" ", "_");
    params.status = mappedStatus;
  }
  // Add isActive filter for active/archived filtering
  if (isActive === true) {
    params.isActive = "true";
  } else if (isActive === false) {
    params.isActive = "false";
  } else {
    params.isActive = "all"; // Explicitly request all tasks
  }

  return params;
};

/**
 * Hook to fetch tasks by project ID
 * @param {string} projectId - Project ID
 * @param {Object} options
 * @param {string} options.searchTerm - Search term
 * @param {string} options.status - Status filter
 * @param {boolean|undefined} options.isActive - Active/Archived filter
 * @param {number} options.page - Current page
 * @param {number} options.limit - Page size
 */
export function useProjectTasksByProject(projectId, options = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = options;
  const apiParams = prepareProjectTasksByProjectParams({ ...options, page, limit });

  return useQuery({
    queryKey: queryKeys.projectTasks.byProject(projectId, apiParams),
    queryFn: ({ signal }) =>
      api.get(`/project-tasks/project/${projectId}`, { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    enabled: !!projectId,
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
 * Hook to fetch task statistics for a project
 * @param {string} projectId - Project ID
 */
export function useProjectStats(projectId) {
  return useQuery({
    queryKey: [...queryKeys.projectTasks.all, "stats", projectId],
    queryFn: ({ signal }) =>
      api.get(`/project-tasks/project/${projectId}/stats`, { signal }).then((res) => res.data),
    enabled: !!projectId,
    select: (responseData) => responseData?.data || responseData || {},
  });
}
