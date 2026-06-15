import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const STATUS_MAP = {
  pending: "pending",
  "in-progress": "in_progress",
  completed: "completed",
  cancelled: "cancelled",
};

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

/**
 * Pure helper function to prepare API params for internal tasks
 */
const prepareInternalTaskParams = ({
  searchTerm = "",
  status = "all",
  isActive = "all",
  assignee,
  teamId,
  isRecurring,
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
    const mappedStatus = STATUS_MAP[status] || status;
    params.status = mappedStatus;
  }

  if (assignee) params.assignee = assignee;
  if (teamId) params.teamId = teamId;
  if (isRecurring !== undefined) params.isRecurring = isRecurring;
  if (isActive && isActive !== "all") params.isActive = isActive;

  return params;
};

/**
 * Specialized hook for fetching internal tasks using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (title or description)
 * @param {string} filters.status - Status filter
 * @param {string} filters.isActive - Active status filter ("all", "active", "archived")
 * @param {string} filters.assignee - Filter by assignee ID
 * @param {string} filters.teamId - Filter by team ID
 * @param {boolean} filters.isRecurring - Filter by recurring
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useInternalTasks(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareInternalTaskParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.internalTasks.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/internal-tasks", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || [],
        pagination: result.pagination || {
          ...DEFAULT_PAGINATION,
          total: result.total || 0,
          totalPages: Math.ceil((result.total || 0) / (result.limit || DEFAULT_PAGINATION.limit)),
        },
      };
    },
  });
}

/**
 * Pure helper for user-specific task params
 */
const prepareUserTaskParams = ({ searchTerm = "", status = "all", page, limit }) => {
  const params = { page, limit };

  if (searchTerm.trim()) {
    params.search = searchTerm.trim();
  }
  if (status && status !== "all") {
    const mappedStatus = STATUS_MAP[status] || status;
    params.status = mappedStatus;
  }

  return params;
};

/**
 * Hook to fetch internal tasks by user
 * @param {string} userId - User ID
 * @param {Object} options
 * @param {string} options.searchTerm - Search term
 * @param {string} options.status - Status filter
 * @param {number} options.page - Current page
 * @param {number} options.limit - Page size
 */
export function useInternalTasksByUser(userId, options = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = options;
  const apiParams = prepareUserTaskParams({ ...options, page, limit });

  return useQuery({
    queryKey: queryKeys.internalTasks.byUser(userId, apiParams),
    queryFn: ({ signal }) =>
      api.get(`/internal-tasks/user/${userId}`, { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    enabled: !!userId,
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
 * Hook to fetch internal tasks by team
 * @param {string} teamId - Team ID
 * @param {Object} options
 * @param {string} options.searchTerm - Search term
 * @param {string} options.status - Status filter
 * @param {number} options.page - Current page
 * @param {number} options.limit - Page size
 */
export function useInternalTasksByTeam(teamId, options = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = options;
  const apiParams = prepareUserTaskParams({ ...options, page, limit });

  return useQuery({
    queryKey: queryKeys.internalTasks.byTeam(teamId, apiParams),
    queryFn: ({ signal }) =>
      api.get(`/internal-tasks/team/${teamId}`, { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    enabled: !!teamId,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || [],
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}