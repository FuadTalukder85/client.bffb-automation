import api from "@/lib/api";

// Sample API functions
export const sampleAPI = {
  // Get all samples with pagination and filters
  getSamples: async (params = {}, config = {}) => {
    const response = await api.get('/samples', { ...config, params });
    return response.data;
  },

  // Get sample by ID
  getSampleById: async (id, config = {}) => {
    const response = await api.get(`/samples/${id}`, config);
    return response.data;
  },

  // Create new sample
  createSample: async (sampleData) => {
    const response = await api.post('/samples', sampleData);
    return response.data;
  },

  // Update sample
  updateSample: async (id, sampleData) => {
    const response = await api.patch(`/samples/${id}`, sampleData);
    return response.data;
  },

  // Delete sample (soft delete)
  deleteSample: async (id) => {
    const response = await api.delete(`/samples/${id}`);
    return response.data;
  },

  // Restore archived sample
  restoreSample: async (id) => {
    const response = await api.patch(`/samples/${id}/restore`);
    return response.data;
  },

  // Get samples by project
  getSamplesByProject: async (projectId, params = {}, config = {}) => {
    const response = await api.get(`/samples/project/${projectId}`, { ...config, params });
    return response.data;
  },

  // Get projects for sample preparation with filter
  // Server route: GET /samples/projects-for-sample-preparation
  getProjectsForSamplePreparation: async (params = {}, config = {}) => {
    const response = await api.get('/samples/projects-for-sample-preparation', { ...config, params });
    return response.data;
  },
};
