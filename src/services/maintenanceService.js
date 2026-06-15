import api from "@/lib/api";

const normalizeMaintenanceItem = (item = {}) => ({
    ...item,
    name: item.maintenanceItemName ?? item.name,
});

const toMaintenanceItemPayload = (payload = {}) => {
    const { name, maintenanceItemName, ...rest } = payload;
    return {
        ...rest,
        maintenanceItemName: maintenanceItemName ?? name,
    };
};

export const maintenanceService = {
    getMaintenanceItems: async (params = {}) => {
        const {
            searchTerm = "",
            department = "",
            isActive = "true",
            page = 1,
            limit = 10,
            sortBy = "",
            sortOrder = "",
        } = params;

        const response = await api.get("/maintenance/maintenance-items", {
            params: {
                search: searchTerm,
                department,
                isActive,
                page,
                limit,
                ...(sortBy ? { sortBy } : {}),
                ...(sortOrder ? { sortOrder } : {}),
            },
        });

        const payload = response.data?.data || { data: [], pagination: {} };

        return {
            data: (payload.data || []).map(normalizeMaintenanceItem),
            pagination: payload.pagination,
        };
    },

    getMaintenanceItem: async (id) => {
        const response = await api.get(`/maintenance/maintenance-items/${id}`);
        return { data: normalizeMaintenanceItem(response.data?.data) };
    },

    createMaintenanceItem: async (payload) => {
        const response = await api.post("/maintenance/maintenance-items", toMaintenanceItemPayload(payload));
        return { data: normalizeMaintenanceItem(response.data?.data) };
    },

    updateMaintenanceItem: async (id, payload) => {
        const response = await api.patch(`/maintenance/maintenance-items/${id}`, toMaintenanceItemPayload(payload));
        return { data: normalizeMaintenanceItem(response.data?.data) };
    },

    archiveMaintenanceItem: async (id) => {
        const response = await api.patch(`/maintenance/maintenance-items/${id}/archive`);
        return { data: normalizeMaintenanceItem(response.data?.data) };
    },

    restoreMaintenanceItem: async (id) => {
        const response = await api.patch(`/maintenance/maintenance-items/${id}/restore`);
        return { data: normalizeMaintenanceItem(response.data?.data) };
    },

    exportMaintenanceItems: async (params = {}) => {
        const {
            searchTerm = "",
            department = "",
            isActive = "true",
        } = params;

        const response = await api.get("/maintenance/maintenance-items/export", {
            params: {
                search: searchTerm,
                department,
                isActive,
            },
            responseType: "blob",
        });

        return response.data;
    },

    // Maintenance Schedule/Calendar services
    getMaintenanceScheduleOverview: async (year, params = {}) => {
        const response = await api.get("/maintenance/maintenance-schedules/overview", {
            params: { year, ...params }
        });
        return response.data;
    },

    bulkScheduleMaintenance: async (payload) => {
        const response = await api.post("/maintenance/maintenance-schedules/bulk-schedule", payload);
        return response.data;
    },

    deleteMaintenanceSchedule: async (id) => {
        const response = await api.delete(`/maintenance/maintenance-schedules/active/${id}`);
        return response.data;
    },

    restoreMaintenanceSchedule: async (id) => {
        const response = await api.patch(`/maintenance/maintenance-schedules/active/${id}/restore`);
        return response.data;
    },

    updateOccurrence: async (scheduleId, occurrenceId, payload) => {
        const response = await api.patch(`/maintenance/maintenance-schedules/update-occurrence/${scheduleId}/${occurrenceId}`, payload);
        return response.data;
    }
};

