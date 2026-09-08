import api from "@/lib/api";

export const categoryService = {
    // Category
    getCategories: async (params, config = {}) => {
        const response = await api.get("/categories", { ...config, params });
        return response.data;
    },
    getCategory: async (id, config = {}) => {
        const response = await api.get(`/categories/${id}`, config);
        return response.data;
    },
    createCategory: async (data) => {
        const response = await api.post("/categories", data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await api.patch(`/categories/${id}`, data);
        return response.data;
    },
    archiveCategory: async (id) => {
        const response = await api.patch(`/categories/${id}/archive`);
        return response.data;
    },
    restoreCategory: async (id) => {
        const response = await api.patch(`/categories/${id}/restore`);
        return response.data;
    },
    getCategoryMembers: async (id) => {
        const response = await api.get(`/categories/${id}/members`);
        return response.data;
    },
    updateCategoryMembers: async (id, members) => {
        const response = await api.put(`/categories/${id}/members`, { members });
        return response.data;
    },

    // SubCategory
    getSubCategories: async (params, config = {}) => {
        const response = await api.get("/subcategories", { ...config, params });
        return response.data;
    },
    getSubCategory: async (id, config = {}) => {
        const response = await api.get(`/subcategories/${id}`, config);
        return response.data;
    },
    createSubCategory: async (data) => {
        const response = await api.post("/subcategories", data);
        return response.data;
    },
    updateSubCategory: async (id, data) => {
        const response = await api.patch(`/subcategories/${id}`, data);
        return response.data;
    },
    archiveSubCategory: async (id) => {
        const response = await api.patch(`/subcategories/${id}/archive`);
        return response.data;
    },
    restoreSubCategory: async (id) => {
        const response = await api.patch(`/subcategories/${id}/restore`);
        return response.data;
    },

    // SubSubCategory
    getSubSubCategories: async (params, config = {}) => {
        const response = await api.get("/subsubcategories", { ...config, params });
        return response.data;
    },
    getSubSubCategory: async (id, config = {}) => {
        const response = await api.get(`/subsubcategories/${id}`, config);
        return response.data;
    },
    createSubSubCategory: async (data) => {
        const response = await api.post("/subsubcategories", data);
        return response.data;
    },
    updateSubSubCategory: async (id, data) => {
        const response = await api.patch(`/subsubcategories/${id}`, data);
        return response.data;
    },
    archiveSubSubCategory: async (id) => {
        const response = await api.patch(`/subsubcategories/${id}/archive`);
        return response.data;
    },
    restoreSubSubCategory: async (id) => {
        const response = await api.patch(`/subsubcategories/${id}/restore`);
        return response.data;
    },

    // ApplicationTag
    getTags: async (params) => {
        const response = await api.get("/application-tags", { params });
        return response.data;
    },
    getTag: async (id) => {
        const response = await api.get(`/application-tags/${id}`);
        return response.data;
    },
    createTag: async (data) => {
        const response = await api.post("/application-tags", data);
        return response.data;
    },
    updateTag: async (id, data) => {
        const response = await api.patch(`/application-tags/${id}`, data);
        return response.data;
    },
    archiveTag: async (id) => {
        const response = await api.patch(`/application-tags/${id}/archive`);
        return response.data;
    },
    restoreTag: async (id) => {
        const response = await api.patch(`/application-tags/${id}/restore`);
        return response.data;
    },

    // Export & Import
    exportCategories: async (params) => {
        const response = await api.get("/categories/export", {
            params,
            responseType: "blob",
        });
        return response;
    },
    uploadCategories: async (file, params) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/categories/import", formData, {
            params,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    exportSubCategories: async (params) => {
        const response = await api.get("/subcategories/export", {
            params,
            responseType: "blob",
        });
        return response;
    },
    uploadSubCategories: async (file, params) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/subcategories/import", formData, {
            params,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    exportSubSubCategories: async (params) => {
        const response = await api.get("/subsubcategories/export", {
            params,
            responseType: "blob",
        });
        return response;
    },
    uploadSubSubCategories: async (file, params) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/subsubcategories/import", formData, {
            params,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    exportTags: async (params) => {
        const response = await api.get("/application-tags/export", {
            params,
            responseType: "blob",
        });
        return response;
    },
    uploadTags: async (file, params) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/application-tags/import", formData, {
            params,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
};
