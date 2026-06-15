import api from "@/lib/api"; // use shared API instance
import { storageService } from "@/services/storageService";

export const shelfLifeAPI = {
  getBySample: (sampleId, config = {}) =>
    api.get(`/shelf-life-testing/samples/${sampleId}`, config).then((res) => res.data),
  upsertBySample: (sampleId, body, config = {}) =>
    api.post(`/shelf-life-testing/samples/${sampleId}`, body, config).then((res) => res.data),
  getRecordsBySample: (sampleId, config = {}) =>
    api.get(`/shelf-life-testing/samples/${sampleId}/records`, config).then((res) => res.data),
  createRecord: (body, config = {}) =>
    api.post(`/shelf-life-testing/records`, body, config).then((res) => res.data),
  updateRecord: (id, body, config = {}) =>
    api.patch(`/shelf-life-testing/records/${id}`, body, config).then((res) => res.data),
  deleteRecord: (id, config = {}) =>
    api.delete(`/shelf-life-testing/records/${id}`, config).then((res) => res.data),
  restoreRecord: (id, config = {}) =>
    api.patch(`/shelf-life-testing/records/${id}/restore`, {}, config).then((res) => res.data),
  uploadRecordAttachments: (id, files, config = {}) =>
    storageService.uploadFiles(`/shelf-life-testing/records/${id}/attachments`, files, "files", config),
  deleteRecordAttachment: (id, attachmentId, config = {}) =>
    api.delete(`/shelf-life-testing/records/${id}/attachments/${attachmentId}`, config).then((res) => res.data),
  getMonitoringHistory: (params = {}, config = {}) =>
    api.get(`/shelf-life-testing/monitoring-history`, { params, ...config }).then((res) => res.data),
  exportMonitoringHistory: (params = {}, config = {}) =>
    api.get(`/shelf-life-testing/monitoring-history/export`, {
      params,
      responseType: "blob",
      ...config,
    }),
};
