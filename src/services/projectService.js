import api from "@/lib/api";

export const projectService = {
    getProjects: async (params, config = {}) => {
        const response = await api.get("/projects", { ...config, params });
        return response.data;
    },

    getMainDashboard: async (config = {}) => {
        const response = await api.get("/main-dashboard", config);
        return response.data;
    },

    getProject: async (id, config = {}) => {
        const response = await api.get(`/projects/${id}`, config);
        return response.data;
    },

    createProject: async (data) => {
        const response = await api.post("/projects", data);
        return response.data;
    },

    createProjectWithMembers: async (data) => {
        const response = await api.post("/projects/with-members", data);
        return response.data;
    },

    updateProject: async (id, data) => {
        const response = await api.patch(`/projects/${id}`, data);
        return response.data;
    },

    archiveProject: async (id) => {
        const response = await api.patch(`/projects/${id}/archive`);
        return response.data;
    },

    restoreProject: async (id) => {
        const response = await api.patch(`/projects/${id}/restore`);
        return response.data;
    },

    exportMainDashboardPdf: async (params) => {
        const response = await api.get("/main-dashboard/export-pdf", {
            params,
            responseType: "blob",
        });
        return response;
    },

    exportMainDashboardBlankTemplatePdf: async () => {
        const response = await api.get("/main-dashboard/export-blank-template", {
            responseType: "blob",
        });
        return response;
    },

    exportApplicationFormulaTemplatePdf: async () => {
        const response = await api.get("/main-dashboard/export-application-formula-template", {
            responseType: "blob",
        });
        return response;
    },

    exportProjects: async (params = {}) => {
        const response = await api.get("/projects/export", {
            params,
            responseType: "blob",
        });
        return response;
    },

    importProjects: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/projects/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    deleteProject: async (id) => {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    },

    updateProjectStatus: async (id, status) => {
        const response = await api.patch(`/projects/${id}/status`, { status });
        return response.data;
    },
};
