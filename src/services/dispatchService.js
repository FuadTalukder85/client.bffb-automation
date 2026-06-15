import api from "@/lib/api";

export const dispatchService = {
  // list with filters
  getDispatches: async (params, config = {}) => {
    const response = await api.get("/dispatch", { ...config, params });
    return response.data;
  },

  getDispatch: async (id, config = {}) => {
    const response = await api.get(`/dispatch/${id}`, config);
    return response.data;
  },

  createDispatch: async (data) => {
    const response = await api.post("/dispatch", data);
    return response.data;
  },

  updateDispatch: async (id, data) => {
    const response = await api.patch(`/dispatch/${id}`, data);
    return response.data;
  },

  archiveDispatch: async (id) => {
    const response = await api.delete(`/dispatch/${id}`);
    return response.data;
  },

  restoreDispatch: async (id) => {
    const response = await api.patch(`/dispatch/${id}/restore`);
    return response.data;
  },
};
