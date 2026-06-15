import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "@/lib/api";

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

// Default transform function (stable reference)
const defaultTransformResponse = (responseData) => {
  return responseData?.data || responseData || {};
};

/**
 * @deprecated This hook is deprecated. Use TanStack Query hooks instead.
 * 
 * Migration guide:
 * - For fetching data: Use domain-specific hooks (useEmployees, useTeams, etc.)
 * - For mutations: Use hooks from '@/hooks/mutations' (useUserMutations, useTeamMutations, etc.)
 * - All hooks now use TanStack Query with automatic caching and cache invalidation
 * 
 * Example migration:
 * ```
 * // Before:
 * const { data, isLoading, refetch } = useFetch('/employees', { params });
 * 
 * // After:
 * const { data: employeesData, isLoading } = useEmployees(params);
 * // refetch is no longer needed - cache invalidation handles updates automatically
 * ```
 * 
 * @param {string} endpoint - API endpoint (e.g., '/invitations', '/roles', '/users')
 * @param {Object} options - Configuration options
 * @param {Object} options.params - Query parameters to send with the request
 * @param {boolean} options.enabled - Whether to fetch immediately (default: true)
 * @param {Function} options.transformResponse - Transform function for API response (default: extracts data.data or data)
 * @returns {Object} { data, pagination, isLoading, error, refetch }
 */
export function useFetch(
  endpoint,
  {
    params = {},
    enabled = true,
    transformResponse = defaultTransformResponse,
  } = {}
) {
  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize params to prevent unnecessary re-renders
  const paramsString = useMemo(() => JSON.stringify(params), [params]);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // Memoize transformResponse to prevent unnecessary re-renders
  const transformRef = useRef(transformResponse);
  transformRef.current = transformResponse;

  const fetchData = useCallback(
    async (signal) => {
      if (!enabled || !endpoint) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(endpoint, { 
          params: paramsRef.current, 
          signal 
        });
        const payload = transformRef.current(response.data);

        // Handle paginated responses
        if (payload.items !== undefined) {
          setData(payload.items);
          setPagination(payload.pagination || DEFAULT_PAGINATION);
        } else if (Array.isArray(payload)) {
          setData(payload);
          setPagination(DEFAULT_PAGINATION);
        } else {
          setData(payload);
          setPagination(payload.pagination || DEFAULT_PAGINATION);
        }
      } catch (err) {
        if (signal?.aborted) {
          return;
        }
        console.error(`Fetch ${endpoint} failed:`, err);
        setData(null);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load data"
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [endpoint, enabled, paramsString]
  );

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchData, enabled]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
  }, [fetchData]);

  return {
    data,
    pagination,
    isLoading,
    error,
    refetch,
  };
}

