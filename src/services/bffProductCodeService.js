import api from "@/lib/api";

export const bffProductCodeService = {
    // Get all product codes with optional filters
    getProductCodes: async (params, config = {}) => {
        const response = await api.get("/bff-product-codes", { ...config, params });
        return response.data;
    },

    // Get single product code by ID
    getProductCode: async (id, config = {}) => {
        const response = await api.get(`/bff-product-codes/${id}`, config);
        return response.data;
    },

    // Create new product code
    createProductCode: async (data) => {
        const response = await api.post("/bff-product-codes", data);
        return response.data;
    },

    // Update product code
    updateProductCode: async (id, data) => {
        const response = await api.patch(`/bff-product-codes/${id}`, data);
        return response.data;
    },

    // Archive product code (soft delete)
    archiveProductCode: async (id) => {
        const response = await api.patch(`/bff-product-codes/${id}/archive`);
        return response.data;
    },

    // Restore archived product code
    restoreProductCode: async (id) => {
        const response = await api.patch(`/bff-product-codes/${id}/restore`);
        return response.data;
    },

    // Get product codes by segment
    getProductCodesBySegment: async (segment, params, config = {}) => {
        const response = await api.get(`/bff-product-codes/segment/${segment}`, { ...config, params });
        return response.data;
    },

    // Export product codes (for download functionality)
    exportProductCodes: async (params) => {
        const response = await api.get("/bff-product-codes/export", {
            params,
            responseType: "blob",
        });
        return response;
    },

    // Upload Excel/CSV to bulk import product codes
    uploadProductCodes: async (file, params) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/bff-product-codes/import", formData, {
            params,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Get recipes using a specific product code
    getRecipesUsingProduct: async (id) => {
        const response = await api.get(`/bff-product-codes/${id}/recipes`);
        return response.data;
    },

    // Sync all recipe ingredient prices with current BFF product costs
    syncRecipePrices: async () => {
        const response = await api.post("/bff-product-codes/sync-prices");
        return response.data;
    },
};
