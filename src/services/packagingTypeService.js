import api from "@/lib/api";

export const packagingTypeService = {
    // Get all packaging types with optional filters
    getPackagingTypes: async (params, config = {}) => {
        const response = await api.get("/packaging-types", { ...config, params });
        return response.data;
    },

    // Get single packaging type by ID
    getPackagingType: async (id, config = {}) => {
        const response = await api.get(`/packaging-types/${id}`, config);
        return response.data;
    },

    // Create new packaging type
    createPackagingType: async (data) => {
        const response = await api.post("/packaging-types", data);
        return response.data;
    },

    // Update packaging type
    updatePackagingType: async (id, data) => {
        const response = await api.patch(`/packaging-types/${id}`, data);
        return response.data;
    },

    // Archive packaging type (soft delete)
    archivePackagingType: async (id) => {
        const response = await api.delete(`/packaging-types/${id}`);
        return response.data;
    },

    // Restore archived packaging type
    restorePackagingType: async (id) => {
        const response = await api.patch(`/packaging-types/${id}/restore`);
        return response.data;
    },
};