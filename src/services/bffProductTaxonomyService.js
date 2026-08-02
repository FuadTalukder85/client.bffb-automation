import api from "@/lib/api";

export const bffProductTaxonomyService = {
  getKinds: async (config = {}) => {
    const response = await api.get("/bff-product-taxonomy/kinds", config);
    return response.data;
  },

  getItems: async (kind, params, config = {}) => {
    const response = await api.get(`/bff-product-taxonomy/${kind}`, { ...config, params });
    return response.data;
  },

  getItem: async (kind, id, config = {}) => {
    const response = await api.get(`/bff-product-taxonomy/${kind}/${id}`, config);
    return response.data;
  },

  createItem: async (kind, data) => {
    const response = await api.post(`/bff-product-taxonomy/${kind}`, data);
    return response.data;
  },

  updateItem: async (kind, id, data) => {
    const response = await api.patch(`/bff-product-taxonomy/${kind}/${id}`, data);
    return response.data;
  },

  archiveItem: async (kind, id) => {
    const response = await api.patch(`/bff-product-taxonomy/${kind}/${id}/archive`);
    return response.data;
  },

  restoreItem: async (kind, id) => {
    const response = await api.patch(`/bff-product-taxonomy/${kind}/${id}/restore`);
    return response.data;
  },
};
