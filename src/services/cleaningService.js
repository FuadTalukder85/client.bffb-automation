import api from "@/lib/api";
import { getDaysInMonth } from "date-fns";

const normalizeCleanlinessItem = (item = {}) => ({
    ...item,
    name: item.cleaningItemName ?? item.name,
});

const toCleaningItemPayload = (payload = {}) => {
    const { name, cleaningItemName, ...rest } = payload;
    return {
        ...rest,
        cleaningItemName: cleaningItemName ?? name,
    };
};

export const cleaningService = {
    getCleanlinessItems: async (params = {}) => {
        const {
            searchTerm = "",
            isActive = "true",
            page = 1,
            limit = 10,
            sortBy = "",
            sortOrder = "",
        } = params;

        const response = await api.get("/cleaning/cleaning-items", {
            params: {
                search: searchTerm,
                isActive,
                page,
                limit,
                ...(sortBy ? { sortBy } : {}),
                ...(sortOrder ? { sortOrder } : {}),
            },
        });

        const payload = response.data?.data || { data: [], pagination: {} };

        return {
            data: (payload.data || []).map(normalizeCleanlinessItem),
            pagination: payload.pagination,
        };
    },

    getCleanlinessItem: async (id) => {
        const response = await api.get(`/cleaning/cleaning-items/${id}`);
        return { data: normalizeCleanlinessItem(response.data?.data) };
    },

    createCleanlinessItem: async (payload) => {
        const response = await api.post("/cleaning/cleaning-items", toCleaningItemPayload(payload));
        return { data: normalizeCleanlinessItem(response.data?.data) };
    },

    updateCleanlinessItem: async (id, payload) => {
        const response = await api.patch(`/cleaning/cleaning-items/${id}`, toCleaningItemPayload(payload));
        return { data: normalizeCleanlinessItem(response.data?.data) };
    },

    archiveCleanlinessItem: async (id) => {
        const response = await api.patch(`/cleaning/cleaning-items/${id}/archive`);
        return { data: normalizeCleanlinessItem(response.data?.data) };
    },

    restoreCleanlinessItem: async (id) => {
        const response = await api.patch(`/cleaning/cleaning-items/${id}/restore`);
        return { data: normalizeCleanlinessItem(response.data?.data) };
    },

    restoreCleaningMonthItem: async (monthItemId) => {
        const response = await api.patch(`/cleaning/status/month-items/${monthItemId}/restore`);
        return { data: response.data?.data };
    },

    // --- Cleaning Status Methods ---
    getCleaningStatus: async (params = {}) => {
        const {
            searchTerm = "",
            year = 2026,
            month = 1,
            page = 1,
            limit = 10,
            isActive = "all",
        } = params;

        const response = await api.get("/cleaning/status", {
            params: {
                search: searchTerm,
                year,
                month,
                page,
                limit,
                ...(isActive !== "all" ? { isActive } : {}),
            },
        });

        const payload = response.data?.data || {
            data: [],
            pagination: { totalItems: 0, totalPages: 1, currentPage: Number(page), itemsPerPage: Number(limit) },
            meta: {
                year: Number(year),
                month: Number(month),
                daysInMonth: getDaysInMonth(new Date(Number(year), Number(month) - 1)),
            },
        };

        const statusMap = {
            complete: "cleaned",
            incomplete: "failed",
            other: "pending",
        };

        return {
            data: (payload.data || []).map((item) => {
                const mappedDayStatuses = {};
                Object.entries(item.dayStatuses || {}).forEach(([day, value]) => {
                    mappedDayStatuses[day] = {
                        ...value,
                        status: statusMap[value.status] || "none",
                    };
                });

                return {
                    ...item,
                    dayStatuses: mappedDayStatuses,
                };
            }),
            pagination: payload.pagination,
            meta: payload.meta,
        };
    },

    getAvailableCleaningStatusItems: async (params = {}) => {
        const { year, month, searchTerm = "" } = params;
        const response = await api.get("/cleaning/status/available-items", {
            params: {
                year,
                month,
                search: searchTerm,
            },
        });

        // API returns the list directly; ensure we return an array.
        return response.data?.data ?? response.data ?? [];
    },

    addItemToCleaningMonth: async (payload) => {
        const response = await api.post("/cleaning/status/month-items", payload);
        return { data: response.data?.data };
    },

    removeItemFromCleaningMonth: async (monthItemId) => {
        const response = await api.delete(`/cleaning/status/month-items/${monthItemId}`);
        return { data: response.data?.data };
    },

    updateMonthItem: async (monthItemId, cleaningItemId) => {
        const response = await api.patch(`/cleaning/status/month-items/${monthItemId}`, {
            cleaningItemId,
        });
        return { data: response.data?.data };
    },

    updateCleaningStatus: async (payload) => {
        const statusMap = {
            cleaned: "complete",
            failed: "incomplete",
            pending: "other",
        };

        const requestPayload = {
            ...payload,
            status: statusMap[payload.status] || payload.status,
        };

        const response = await api.post("/cleaning/status/entries", requestPayload);
        return { data: response.data?.data };
    },

    // Export cleaning items (for download functionality)
    exportCleanlinessItems: async (params) => {
        const response = await api.get("/cleaning/export", {
            params,
            responseType: "blob",
        });
        return response;
    },
};
