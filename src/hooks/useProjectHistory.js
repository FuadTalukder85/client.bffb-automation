import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook to fetch project field change history
 * @param {string} projectId - The project ID
 * @param {Object} options - Query options
 * @param {string[]} options.fieldPaths - Array of field paths to filter by specific fields
 * @param {string} options.view - View context (master-project, product-development, etc.)
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @returns {Object} TanStack Query result
 */
export function useProjectHistory(projectId, options = {}) {
    const { fieldPaths, view, page = 1, limit = 20 } = options;

    return useQuery({
        queryKey: queryKeys.projectHistory.list(projectId, { fieldPaths, view, page, limit }),
        queryFn: async ({ signal }) => {
            let url = `/audit/Project/${projectId}`;

            const params = { page, limit };
            if (view) {
                params.view = view;
            }

            // If fieldPaths are provided, add them as comma-separated query param
            if (fieldPaths && Array.isArray(fieldPaths) && fieldPaths.length > 0) {
                params.fieldPaths = fieldPaths.join(',');
            }

            const response = await api.get(url, { params, signal });

            return response.data;
        },
        enabled: !!projectId,
        select: (responseData) => {
            if (!responseData?.data) {
                return {
                    data: [],
                    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
                };
            }

            // The API returns { data: records, pagination: {...} }
            const { data: records, pagination } = responseData.data;
            return {
                data: records || [],
                pagination: pagination || { total: 0, page: 1, limit: 20, totalPages: 0 },
            };
        },
    });
}