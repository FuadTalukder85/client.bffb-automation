import api from "@/lib/api";

export const storageService = {
  toMultipartFormData(files = [], fieldName = "files") {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(fieldName, file);
    });
    return formData;
  },

  async uploadFiles(endpoint, files = [], fieldName = "files", config = {}) {
    const formData = this.toMultipartFormData(files, fieldName);
    const response = await api.post(endpoint, formData, {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...(config.headers || {}),
      },
    });
    return response.data;
  },
};
