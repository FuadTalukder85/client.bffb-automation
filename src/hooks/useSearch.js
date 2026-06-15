import { useInvitations } from "./useInvitations";

/**
 * @deprecated Use useInvitations instead. This hook is kept for backward compatibility.
 * Wrapper around useInvitations that maintains the old API (searchResults, isSearching, searchError)
 * @param {Object} params
 * @param {string} params.searchTerm - Debounced search text
 * @param {string} params.statusFilter - UI friendly filter (all|pending|...)
 * @param {number} params.page - Current page (1-indexed)
 * @param {number} params.limit - Page size
 * @returns {Object} Search state and helpers (backward compatible API)
 */
export function useSearch({
  searchTerm = "",
  statusFilter = "all",
  page = 1,
  limit = 10,
} = {}) {
  const { data, isLoading, error, refetch } = useInvitations({
    searchTerm,
    statusFilter,
    page,
    limit,
  });

  // Map to old API for backward compatibility
  return {
    searchResults: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10 },
    isSearching: isLoading,
    searchError: error,
    refetch,
  };
}

// Re-export useInvitations for new code
export { useInvitations } from "./useInvitations";
