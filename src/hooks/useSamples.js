import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { sampleAPI } from "@/services/sampleService";
import { shelfLifeAPI } from "@/services/shelfLifeService";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook to fetch all samples with pagination and filters
 * Calls server route: GET /samples
 * Accepted filters: searchTerm, projectId, packagingStatus, HODStatus, page, limit
 */
export function useSamples(filters = {}) {
  const {
    searchTerm = "",
    projectId,
    packagingStatus,
    HODStatus,
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (projectId) params.projectId = projectId;
  if (packagingStatus && packagingStatus !== "all") params.packagingStatus = packagingStatus;
  if (HODStatus && HODStatus !== "all") params.HODStatus = HODStatus;

  return useQuery({
    queryKey: queryKeys.samples.list(params),
    queryFn: ({ signal }) => sampleAPI.getSamples(params, { signal }),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || [],
        pagination: result.pagination || {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0,
        },
      };
    },
  });
}

/**
 * Hook to fetch a single sample by ID
 * Calls server route: GET /samples/:id
 */
export function useSample(id, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.samples.detail(id),
    queryFn: ({ signal }) => sampleAPI.getSampleById(id, { signal }),
    enabled: enabled && Boolean(id),
    select: (responseData) => {
      return responseData?.data || responseData || null;
    },
  });
}

/**
 * Hook to fetch samples by project ID
 * Calls server route: GET /samples/project/:projectId
 */
export function useSamplesByProject(projectId, filters = {}) {
  const {
    searchTerm = "",
    packagingStatus,
    HODStatus,
    isActive,
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (packagingStatus && packagingStatus !== "all") params.packagingStatus = packagingStatus;
  if (HODStatus !== undefined && HODStatus !== "all") params.HODStatus = HODStatus;
  if (isActive !== undefined && isActive !== "all") params.isActive = String(isActive);

  return useQuery({
    queryKey: queryKeys.samples.byProject(projectId, params),
    queryFn: ({ signal }) => sampleAPI.getSamplesByProject(projectId, params, { signal }),
    enabled: enabled && Boolean(projectId),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || [],
        pagination: result.pagination || {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0,
        },
      };
    },
  });
}

/**
 * Hook to fetch projects for sample preparation with filter
 * Calls server route: GET /samples/projects-for-sample-preparation
 * Accepted filters: searchTerm, status, isActive, isFeasible, filter, page, limit
 */
export function useProjectsForSamplePreparation(filters = {}) {
  const {
    searchTerm = "",
    status = "all",
    isActive = "all",
    isFeasible = "all",
    filter = "sample-preparation",
    statusFilter = "running",
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (status && status !== "all") params.status = status;
  if (isActive !== undefined && isActive !== "all") params.isActive = String(isActive);
  if (isFeasible !== undefined && isFeasible !== "all") params.isFeasible = String(isFeasible);
  if (filter && filter !== "sample-preparation") params.filter = filter;
  if (statusFilter && statusFilter !== "running") params.statusFilter = statusFilter;

  return useQuery({
    queryKey: queryKeys.samples.projectsForSamplePreparation(params),
    queryFn: ({ signal }) =>
      sampleAPI.getProjectsForSamplePreparation(params, { signal }),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || [];

      // Normalize projects so UI components can read latest sample info
      const normalized = Array.isArray(items)
        ? items.map((proj) => {
          const latest = proj.latestSample || null;

          // Calculate status days from statusChangedAt timestamps
          const calculateDays = (timestamp) => {
            if (!timestamp) return null;
            return Math.floor((new Date() - new Date(timestamp)) / (1000 * 60 * 60 * 24));
          };

          return {
            ...proj,
            latestSampleId: latest?.id || null,
            latestSampleRecipeId: latest?.recipeId || null,
            latestSampleRecipeCode: latest?.recipeCode || null,
            latestSampleRecipeName: latest?.recipeName || null,
            latestSamplePackagingStatus: latest?.packagingStatus || null,
            latestSampleHODStatus: latest?.HODStatus || null,
            latestSampleCreatedAt: latest?.createdAt || null,

            // Override nested status objects to include calculated days
            productDevelopment: proj.productDevelopment ? {
              ...proj.productDevelopment,
              statusDays: calculateDays(proj.statusChangedAt?.productDevelopmentStatus)
            } : null,
            applicationLab: proj.applicationLab ? {
              ...proj.applicationLab,
              statusDays: calculateDays(proj.statusChangedAt?.applicationLabStatus)
            } : null,
            sensoryLab: proj.sensoryLab ? {
              ...proj.sensoryLab,
              statusDays: calculateDays(proj.statusChangedAt?.sensoryLabStatus)
            } : null,
            businessDevelopment: proj.businessDevelopment ? {
              ...proj.businessDevelopment,
              statusDays: calculateDays(proj.statusChangedAt?.businessDevelopmentStatus)
            } : null,
            masterProject: proj.masterProject ? {
              ...proj.masterProject,
              statusDays: calculateDays(proj.statusChangedAt?.masterProjectStatus)
            } : null,
          };
        })
        : [];

      return {
        data: normalized,
        pagination: result.pagination || {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0,
        },
      };
    },
  });
}

/**
 * Hook to fetch projects for application lab records with additional fields
 * Calls server route: GET /samples/project-for-application-lab-records
 * Accepted filters: searchTerm, status, isActive, isFeasible, page, limit
 */
export function useProjectsForApplicationLabRecords(filters = {}) {
  const {
    searchTerm = "",
    status = "all",
    isActive = "all",
    isFeasible = "all",
    statusFilter = "running",
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (status && status !== "all") params.status = status;
  if (isActive !== undefined && isActive !== "all") params.isActive = String(isActive);
  if (isFeasible !== undefined && isFeasible !== "all") params.isFeasible = String(isFeasible);
  if (statusFilter && statusFilter !== "running") params.statusFilter = statusFilter;

  return useQuery({
    queryKey: queryKeys.samples.projectsForApplicationLabRecords(params),
    queryFn: ({ signal }) =>
      api.get('/samples/project-for-application-lab-records', { params, signal }).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || [];

      // Normalize projects so UI components can read the additional fields
      const normalized = Array.isArray(items)
        ? items.map((proj) => {
          const latest = proj.latestSample || null;
          return {
            // Keep raw project for downstream navigation/details without overriding normalized display fields.
            ...proj,
            // Flatten masterProject fields
            id: proj._id,
            projectCode: proj.masterProject?.code || null,
            projectName: proj.masterProject?.title || null,
            raisedDate: proj.masterProject?.raisedDate ? new Date(proj.masterProject.raisedDate).toLocaleDateString('en-GB') : null,
            purpose: proj.purpose || proj.masterProject?.purpose || null,
            purposeName: proj.purposeDetails || proj.masterProject?.purposeDetails || null, // Using purposeDetails as purposeName
            objective: proj.objective || proj.masterProject?.objective || null,
            objectiveDetails: proj.objectiveDetails || proj.masterProject?.objectiveDetails || null,
            category: proj.category?.name || proj.applicationLab?.category?.name || null,
            subcategory: proj.subcategory?.name || proj.applicationLab?.subcategory?.name || null,
            subSubcategory: proj.subSubcategory?.name || proj.applicationLab?.subSubcategory?.name || null,
            tags: proj.tags?.map(tag => tag.name) || proj.applicationLab?.tags?.map(tag => tag.name) || [],

            // Status fields - these might need to be calculated or come from statusChanges
            pdStatus: proj.productDevelopment?.status || null,
            pdDays: proj.statusChangedAt?.productDevelopmentStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.productDevelopmentStatus)) / (1000 * 60 * 60 * 24)) : null,
            adStatus: proj.applicationLab?.developmentStatus || null,
            adDays: proj.statusChangedAt?.applicationLabStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.applicationLabStatus)) / (1000 * 60 * 60 * 24)) : null,
            sensoryStatus: proj.sensoryLab?.status || null,
            sensoryDays: proj.statusChangedAt?.sensoryLabStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.sensoryLabStatus)) / (1000 * 60 * 60 * 24)) : null,
            bdStatus: proj.businessDevelopment?.status || null,
            bdDays: proj.statusChangedAt?.businessDevelopmentStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.businessDevelopmentStatus)) / (1000 * 60 * 60 * 24)) : null,
            projectStatus: proj.masterProject?.status || null,
            projectDays: proj.statusChangedAt?.masterProjectStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.masterProjectStatus)) / (1000 * 60 * 60 * 24)) : null,
            hodStatus: latest ? (latest.HODStatus ? "Approved" : "Pending") : null,
            hodDays: latest?.createdAt ? Math.floor((new Date() - new Date(latest.createdAt)) / (1000 * 60 * 60 * 24)) : null,
            latestSampleId: latest?.id || null,
            latestSampleRecipeId: latest?.recipeId || null,
            latestSampleRecipeCode: latest?.recipeCode || null,
            latestSampleRecipeName: latest?.recipeName || null,
            latestSamplePackagingStatus: latest?.packagingStatus || null,
            latestSampleHODStatus: latest?.HODStatus || null,
            latestSampleCreatedAt: latest?.createdAt || null,
          };
        })
        : [];

      return {
        data: normalized,
        pagination: result.pagination || {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0,
        },
      };
    },
  });
}

/**
 * Hook to fetch projects for shelf-life test records
 * Calls server route: GET /shelf-life-testing/test-records/projects
 */
export function useProjectsForShelfLifeTestRecords(filters = {}) {
  const {
    searchTerm = "",
    status = "all",
    isActive = "all",
    isFeasible = "all",
    statusFilter = "running",
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (status && status !== "all") params.status = status;
  if (isActive !== undefined && isActive !== "all") params.isActive = String(isActive);
  if (isFeasible !== undefined && isFeasible !== "all") params.isFeasible = String(isFeasible);
  if (statusFilter && statusFilter !== "running") params.statusFilter = statusFilter;

  return useQuery({
    queryKey: queryKeys.samples.projectsForShelfLifeTestRecords(params),
    queryFn: ({ signal }) =>
      api.get('/shelf-life-testing/test-records/projects', { params, signal }).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || [];

      const normalized = Array.isArray(items)
        ? items.map((proj) => {
          const latest = proj.latestSample || null;
          return {
            // Keep raw project for downstream navigation/details without overriding normalized display fields.
            ...proj,
            id: proj._id,
            projectCode: proj.masterProject?.code || null,
            projectName: proj.masterProject?.title || null,
            raisedDate: proj.masterProject?.raisedDate ? new Date(proj.masterProject.raisedDate).toLocaleDateString('en-GB') : null,
            purpose: proj.purpose || proj.masterProject?.purpose || null,
            purposeName: proj.purposeDetails || proj.masterProject?.purposeDetails || null,
            objective: proj.objective || proj.masterProject?.objective || null,
            objectiveDetails: proj.objectiveDetails || proj.masterProject?.objectiveDetails || null,
            category: proj.category?.name || proj.applicationLab?.category?.name || null,
            subcategory: proj.subcategory?.name || proj.applicationLab?.subcategory?.name || null,
            subSubcategory: proj.subSubcategory?.name || proj.applicationLab?.subSubcategory?.name || null,
            tags: proj.tags?.map((tag) => tag.name) || proj.applicationLab?.tags?.map((tag) => tag.name) || [],
            pdStatus: proj.productDevelopment?.status || null,
            pdDays: proj.statusChangedAt?.productDevelopmentStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.productDevelopmentStatus)) / (1000 * 60 * 60 * 24)) : null,
            adStatus: proj.applicationLab?.developmentStatus || null,
            adDays: proj.statusChangedAt?.applicationLabStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.applicationLabStatus)) / (1000 * 60 * 60 * 24)) : null,
            sensoryStatus: proj.sensoryLab?.status || null,
            sensoryDays: proj.statusChangedAt?.sensoryLabStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.sensoryLabStatus)) / (1000 * 60 * 60 * 24)) : null,
            bdStatus: proj.businessDevelopment?.status || null,
            bdDays: proj.statusChangedAt?.businessDevelopmentStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.businessDevelopmentStatus)) / (1000 * 60 * 60 * 24)) : null,
            projectStatus: proj.masterProject?.status || null,
            projectDays: proj.statusChangedAt?.masterProjectStatus ? Math.floor((new Date() - new Date(proj.statusChangedAt.masterProjectStatus)) / (1000 * 60 * 60 * 24)) : null,
            hodStatus: latest ? (latest.HODStatus ? "Approved" : "Pending") : null,
            hodDays: latest?.createdAt ? Math.floor((new Date() - new Date(latest.createdAt)) / (1000 * 60 * 60 * 24)) : null,
            latestSampleId: latest?.id || null,
            latestSampleRecipeId: latest?.recipeId || null,
            latestSampleRecipeCode: latest?.recipeCode || null,
            latestSampleRecipeName: latest?.recipeName || null,
            latestSamplePackagingStatus: latest?.packagingStatus || null,
            latestSampleHODStatus: latest?.HODStatus || null,
            latestSampleCreatedAt: latest?.createdAt || null,
          };
        })
        : [];

      return {
        data: normalized,
        pagination: result.pagination || {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0,
        },
      };
    },
  });
}

/**
 * Hook to fetch samples for shelf-life records by project
 * Calls server route: GET /shelf-life-testing/test-records/projects/:projectId/samples
 */
export function useShelfLifeSamplesByProject(projectId, filters = {}) {
  const {
    searchTerm = "",
    packagingStatus,
    HODStatus,
    isActive,
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (packagingStatus && packagingStatus !== "all") params.packagingStatus = packagingStatus;
  if (HODStatus !== undefined && HODStatus !== "all") params.HODStatus = HODStatus;
  if (isActive !== undefined && isActive !== "all") params.isActive = String(isActive);

  return useQuery({
    queryKey: queryKeys.samples.shelfLifeSamplesByProject(projectId, params),
    queryFn: ({ signal }) =>
      api.get(`/shelf-life-testing/test-records/projects/${projectId}/samples`, { params, signal }).then((res) => res.data),
    enabled: enabled && Boolean(projectId),
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      return {
        data: result.data || result.items || [],
        pagination: result.pagination || {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0,
        },
      };
    },
  });
}

// ----------------------------------------------------------------
// monitoring history hook
// ----------------------------------------------------------------
export function useMonitoringHistory(filters = {}) {
  const {
    searchTerm = "",
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
    start,
    end,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (start) params.start = start;
  if (end) params.end = end;

  return useQuery({
    queryKey: queryKeys.samples.monitoringHistory(params),
    queryFn: ({ signal }) =>
      shelfLifeAPI.getMonitoringHistory(params, { signal }),
    enabled,
    placeholderData: keepPreviousData,
    select: (response) => {
      const result = response?.data || response || {};
      return {
        data: result.data || [],
        pagination: result.pagination || {
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0,
        },
      };
    },
  });
}

// ----------------------------------------------------------------
// shelf-life testing hooks
// ----------------------------------------------------------------

export function useShelfLifeTestingBySample(sampleId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: queryKeys.samples.shelfLifeTestingBySample(sampleId),
    queryFn: ({ signal }) =>
      shelfLifeAPI.getBySample(sampleId, { signal }),
    enabled: enabled && Boolean(sampleId),
    select: (response) => response?.data || response || null,
  });
}

export function useUpsertShelfLifeTesting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sampleId, data }) => shelfLifeAPI.upsertBySample(sampleId, data),
    onSuccess: (resp, vars) => {
      if (vars.sampleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.samples.shelfLifeTestingBySample(vars.sampleId) });
      }
      toast.success(getSuccessMessage(resp, "Shelf life testing updated"));
    },
  });
}

export function useCreateTestRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => shelfLifeAPI.createRecord(data),
    onSuccess: (resp, vars) => {
      if (vars.sampleId) {
        // optionally invalidate by sample if we have mapping, else rely on getBySample
        queryClient.invalidateQueries({ queryKey: queryKeys.samples.shelfLifeTestingBySample(vars.sampleId) });
      }
      toast.success(getSuccessMessage(resp, "Test record created successfully"));
    },
  });
}

export function useUpdateTestRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => shelfLifeAPI.updateRecord(id, data),
    onSuccess: (resp, vars) => {
      if (vars.sampleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.samples.shelfLifeTestingBySample(vars.sampleId) });
      } else {
        // fallback: invalidate all shelf-life testing queries
        queryClient.invalidateQueries({ queryKey: queryKeys.samples.shelfLifeTestingBySample() });
      }
      toast.success(getSuccessMessage(resp, "Test record updated successfully"));
    },
  });
}

export function useDeleteTestRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars) => shelfLifeAPI.deleteRecord(vars.id),
    onSuccess: (resp, vars) => {
      if (vars.sampleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.samples.shelfLifeTestingBySample(vars.sampleId) });
      }
      toast.success(getSuccessMessage(resp, "Test record deleted successfully"));
    },
  });
}

export function useRestoreTestRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars) => shelfLifeAPI.restoreRecord(vars.id),
    onSuccess: (resp, vars) => {
      if (vars.sampleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.samples.shelfLifeTestingBySample(vars.sampleId) });
      }
      toast.success(getSuccessMessage(resp, "Test record restored successfully"));
    },
  });
}

export function useUploadTestRecordAttachments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }) => shelfLifeAPI.uploadRecordAttachments(id, files),
    onSuccess: (resp, vars) => {
      if (vars.sampleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.samples.shelfLifeTestingBySample(vars.sampleId) });
      }
      toast.success(getSuccessMessage(resp, "Attachments uploaded successfully"));
    },
  });
}

export function useDeleteTestRecordAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attachmentId }) =>
      shelfLifeAPI.deleteRecordAttachment(id, attachmentId),
    onSuccess: (resp, vars) => {
      if (vars.sampleId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.samples.shelfLifeTestingBySample(vars.sampleId) });
      }
      toast.success(getSuccessMessage(resp, "Attachment deleted successfully"));
    },
  });
}

/**
 * Hook to create a new sample
 * POST /samples
 */
export function useCreateSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sampleData) => sampleAPI.createSample(sampleData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.samples.all });
      toast.success(getSuccessMessage(response, "Sample created successfully"));
    },
  });
}

/**
 * Hook to update a sample
 * PATCH /samples/:id
 */
export function useUpdateSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => sampleAPI.updateSample(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.samples.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.samples.all });
      toast.success(getSuccessMessage(response, "Sample updated successfully"));
    },
  });
}

/**
 * Hook to delete a sample (soft delete)
 * DELETE /samples/:id
 */
export function useDeleteSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => sampleAPI.deleteSample(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.samples.all });
      toast.success(getSuccessMessage(response, "Sample deleted successfully"));
    },
  });
}

/**
 * Hook to restore an archived sample
 * PATCH /samples/:id/restore
 */
export function useRestoreSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => sampleAPI.restoreSample(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.samples.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.samples.all });
      toast.success(getSuccessMessage(response, "Sample restored successfully"));
    },
  });
}
