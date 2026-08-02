import api from "@/lib/api";

export const bffProductSegmentService = {
  getKinds: async (config = {}) => {
    const response = await api.get("/bff-product-segment/kinds", config);
    return response.data;
  },

  getItems: async (kind, params, config = {}) => {
    const response = await api.get(`/bff-product-segment/${kind}`, { ...config, params });
    return response.data;
  },

  getItem: async (kind, id, config = {}) => {
    const response = await api.get(`/bff-product-segment/${kind}/${id}`, config);
    return response.data;
  },

  createItem: async (kind, data) => {
    const response = await api.post(`/bff-product-segment/${kind}`, data);
    return response.data;
  },

  updateItem: async (kind, id, data) => {
    const response = await api.patch(`/bff-product-segment/${kind}/${id}`, data);
    return response.data;
  },

  archiveItem: async (kind, id) => {
    const response = await api.patch(`/bff-product-segment/${kind}/${id}/archive`);
    return response.data;
  },

  restoreItem: async (kind, id) => {
    const response = await api.patch(`/bff-product-segment/${kind}/${id}/restore`);
    return response.data;
  },
};

export const bffProductTaxonomyService = bffProductSegmentService;
