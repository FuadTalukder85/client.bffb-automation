import api from "@/lib/api";

export const rawMaterialService = {
    // Get all raw materials with optional filters
    getRawMaterials: async (params, config = {}) => {
        const response = await api.get("/raw-materials", { ...config, params });
        return response.data;
    },

    // Get single raw material by ID
    getRawMaterial: async (id, config = {}) => {
        const response = await api.get(`/raw-materials/${id}`, config);
        return response.data;
    },

    // Create new raw material
    createRawMaterial: async (data) => {
        const response = await api.post("/raw-materials", data);
        return response.data;
    },

    // Update raw material
    updateRawMaterial: async (id, data) => {
        const response = await api.patch(`/raw-materials/${id}`, data);
        return response.data;
    },

    // Archive raw material (soft delete)
    archiveRawMaterial: async (id) => {
        const response = await api.patch(`/raw-materials/${id}/archive`);
        return response.data;
    },

    // Restore archived raw material
    restoreRawMaterial: async (id) => {
        const response = await api.patch(`/raw-materials/${id}/restore`);
        return response.data;
    },

    // Export raw materials (for download functionality)
    exportRawMaterials: async (params) => {
        const response = await api.get("/raw-materials/export", {
            params,
            responseType: "blob",
        });
        return response;
    },

    // Upload Excel/CSV to bulk import raw materials
    uploadRawMaterials: async (file, params) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/raw-materials/import", formData, {
            params,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
};