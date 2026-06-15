import api from "@/lib/api";

export const productionScheduleService = {
    // Get all production schedules with optional filters
    getProductionSchedules: async (params, config = {}) => {
        const response = await api.get("/production-schedules", { ...config, params });
        return response.data;
    },

    // Get production schedules by date
    getProductionSchedulesByDate: async (date, params = {}, config = {}) => {
        const response = await api.get(`/production-schedules/date/${date}`, { 
            ...config, 
            params 
        });
        return response.data;
    },

    // Get production schedules by date range
    getProductionSchedulesByDateRange: async (startDate, endDate, params = {}, config = {}) => {
        const response = await api.get("/production-schedules/date-range", { 
            ...config, 
            params: { ...params, startDate, endDate }
        });
        return response.data;
    },

    // Get production schedules by project
    getProductionSchedulesByProject: async (projectId, params = {}, config = {}) => {
        const response = await api.get(`/production-schedules/project/${projectId}`, { 
            ...config, 
            params 
        });
        return response.data;
    },

    // Get single production schedule by ID
    getProductionSchedule: async (id, config = {}) => {
        const response = await api.get(`/production-schedules/${id}`, config);
        return response.data;
    },

    // Create or update a production schedule (upsert)
    upsertProductionSchedule: async (data) => {
        const response = await api.post("/production-schedules", data);
        return response.data;
    },

    // Update a single time slot
    updateTimeSlot: async (data) => {
        const response = await api.patch("/production-schedules/slot", data);
        return response.data;
    },

    // Remove a single time slot
    removeTimeSlot: async (data) => {
        const response = await api.delete("/production-schedules/slot", { data });
        return response.data;
    },

    // Archive production schedule (soft delete)
    archiveProductionSchedule: async (id) => {
        const response = await api.patch(`/production-schedules/${id}/archive`);
        return response.data;
    },

    // Restore archived production schedule
    restoreProductionSchedule: async (id) => {
        const response = await api.patch(`/production-schedules/${id}/restore`);
        return response.data;
    },

    // Get available time slots for a project on a specific date
    getAvailableTimeSlots: async (projectId, date) => {
        const response = await api.get(`/production-schedules/available-slots/${projectId}/${date}`);
        return response.data;
    },

    // Export production schedules (for download functionality)
    exportProductionSchedules: async (params) => {
        const response = await api.get("/production-schedules/export", {
            params,
            responseType: "blob",
        });
        return response;
    },
};
