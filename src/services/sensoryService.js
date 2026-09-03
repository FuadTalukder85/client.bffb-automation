import api from "@/lib/api";

export const sensoryAPI = {
  // Get projects for sensory form
  getProjectsForSensoryForm: async (params = {}, config = {}) => {
    const response = await api.get('/sensory-evaluations/projects-for-sensory-form', { ...config, params });
    return response.data;
  },

  // Get projects for sensory top sheet
  getProjectsForSensoryTopSheet: async (params = {}, config = {}) => {
    const response = await api.get('/sensory-evaluations/projects-for-sensory-top-sheet', { ...config, params });
    return response.data;
  },

  // Get samples by project
  getSamplesByProject: async (projectId, params = {}, config = {}) => {
    const response = await api.get(`/sensory-evaluations/samples/${projectId}`, { ...config, params });
    return response.data;
  },

  // Get sensory form by sample ID and panelist ID
  getSensoryFormBySample: async (sampleId, panelistId = null, config = {}) => {
    const params = panelistId ? { panelistId } : {};
    const response = await api.get(`/sensory-evaluations/sensory-form/${sampleId}`, { ...config, params });
    return response.data;
  },

  // Get aggregated sensory forms for a sample
  getSensoryFormAggregated: async (sampleId, config = {}) => {
    const response = await api.get(`/sensory-evaluations/sensory-form/${sampleId}/aggregated`, config);
    return response.data;
  },

  // Create or update sensory form
  createSensoryForm: async (formData) => {
    const response = await api.post('/sensory-evaluations/sensory-form', formData);
    return response.data;
  },

  // Update sensory form
  updateSensoryForm: async (id, formData) => {
    const response = await api.patch(`/sensory-evaluations/sensory-form/${id}`, formData);
    return response.data;
  },

  // Get all sensory forms
  getSensoryForms: async (params = {}, config = {}) => {
    const response = await api.get('/sensory-evaluations/sensory-form', { ...config, params });
    return response.data;
  },

  // Get sensory top sheet by sample ID (with aggregated sensory forms)
  getSensoryTopSheetBySample: async (sampleId, config = {}) => {
    const response = await api.get(`/sensory-evaluations/sensory-top-sheet/${sampleId}`, config);
    return response.data;
  },

  // Create or update sensory top sheet
  createSensoryTopSheet: async (formData) => {
    const response = await api.post('/sensory-evaluations/sensory-top-sheet', formData);
    return response.data;
  },

  // Update sensory top sheet
  updateSensoryTopSheet: async (id, formData) => {
    const response = await api.patch(`/sensory-evaluations/sensory-top-sheet/${id}`, formData);
    return response.data;
  },

  // Get all sensory top sheets
  getSensoryTopSheets: async (params = {}, config = {}) => {
    const response = await api.get('/sensory-evaluations/sensory-top-sheet', { ...config, params });
    return response.data;
  },

  // Get sample details for sensory form (project info + recipe info)
  getSampleDetailsForSensoryForm: async (sampleId, config = {}) => {
    const response = await api.get(`/sensory-evaluations/sample/${sampleId}/details`, config);
    return response.data;
  },

  // Get sensory feedback for a recipe
  getRecipeSensoryFeedback: async (recipeId, config = {}) => {
    const response = await api.get(`/sensory-evaluations/recipe/${recipeId}/feedback`, config);
    return response.data;
  },
};
