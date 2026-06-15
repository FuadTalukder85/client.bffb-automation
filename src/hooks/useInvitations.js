import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const STATUS_PARAM_MAP = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  expired: "EXPIRED",
  rejected: "REVOKED",
};

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

/**
 * Pure helper function to prepare API params
 */
const prepareInvitationParams = ({ searchTerm = "", statusFilter = "all", page, limit }) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  // Add email search param if search term provided
  if (trimmedTerm.length > 0) {
    params.email = trimmedTerm;
  }

  // Add status filter if not "all"
  if (statusFilter && statusFilter !== "all") {
    params.status = STATUS_PARAM_MAP[statusFilter] || statusFilter.toUpperCase();
  }

  return params;
};

/**
 * Specialized hook for fetching employee invitations using TanStack Query
 * @param {Object} filters
 * @param {string} filters.searchTerm - Search term (email) to filter invitations
 * @param {string} filters.statusFilter - Status filter (all|pending|accepted|expired|rejected)
 * @param {number} filters.page - Current page (1-indexed)
 * @param {number} filters.limit - Page size
 * @returns {Object} TanStack Query result with { data, isLoading, error, refetch, isPlaceholderData }
 */
export function useInvitations(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareInvitationParams({ ...filters, page, limit });

  return useQuery({
    queryKey: queryKeys.invitations.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/invitations", { params: apiParams, signal }).then((res) => res.data),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      // Normalize response structure
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || result || [],
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

