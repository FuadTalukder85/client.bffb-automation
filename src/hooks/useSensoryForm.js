import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { sensoryAPI } from "@/services/sensoryService";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export function useProjectsForSensoryForm(filters = {}) {
  const {
    searchTerm = "",
    status = "all",
    isActive = "all",
    isFeasible = "all",
    statusFilter = "running",
    category = "",
    subcategory = "",
    subSubcategory = "",
    createdBy = "",
    purpose = "",
    dateFrom = "",
    dateTo = "",
    sortBy = "",
    sortOrder = "",
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
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;
  if (subSubcategory) params.subSubcategory = subSubcategory;
  if (createdBy) params.createdBy = createdBy;
  if (purpose) params.purpose = purpose;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  return useQuery({
    queryKey: queryKeys.sensory.projectsForSensoryForm(params),
    queryFn: ({ signal }) => sensoryAPI.getProjectsForSensoryForm(params, { signal }),
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

export function useProjectsForSensoryTopSheet(filters = {}) {
  const {
    searchTerm = "",
    status = "all",
    isActive = "all",
    isFeasible = "all",
    statusFilter = "running",
    category = "",
    subcategory = "",
    subSubcategory = "",
    createdBy = "",
    purpose = "",
    dateFrom = "",
    dateTo = "",
    sortBy = "",
    sortOrder = "",
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
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;
  if (subSubcategory) params.subSubcategory = subSubcategory;
  if (createdBy) params.createdBy = createdBy;
  if (purpose) params.purpose = purpose;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  return useQuery({
    queryKey: queryKeys.sensory.projectsForSensoryTopSheet(params),
    queryFn: ({ signal }) => sensoryAPI.getProjectsForSensoryTopSheet(params, { signal }),
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

export function useSensorySamplesByProject(projectId, filters = {}) {
  const {
    searchTerm = "",
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;

  return useQuery({
    queryKey: queryKeys.sensory.samplesByProject(projectId, params),
    queryFn: ({ signal }) => sensoryAPI.getSamplesByProject(projectId, params, { signal }),
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

export function useSensoryFormBySample(sampleId, panelistId = null, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.sensory.formBySample(sampleId, panelistId),
    queryFn: async ({ signal }) => {
      try {
        return await sensoryAPI.getSensoryFormBySample(sampleId, panelistId, { signal });
      } catch (error) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: enabled && Boolean(sampleId),
    retry: false,
    select: (responseData) => {
      return responseData?.data || responseData || null;
    },
  });
}

export function useSensoryFormSampleDetails(sampleId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.sensory.sampleDetails(sampleId),
    queryFn: ({ signal }) => sensoryAPI.getSampleDetailsForSensoryForm(sampleId, { signal }),
    enabled: enabled && Boolean(sampleId),
    select: (responseData) => {
      return responseData?.data || responseData || null;
    },
  });
}

export function useSensoryFormAggregated(sampleId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.sensory.formAggregated(sampleId),
    queryFn: ({ signal }) => sensoryAPI.getSensoryFormAggregated(sampleId, { signal }),
    enabled: enabled && Boolean(sampleId),
    select: (responseData) => {
      return responseData?.data || responseData || null;
    },
  });
}

export function useCreateSensoryForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => sensoryAPI.createSensoryForm(formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sensory.all });
      toast.success(getSuccessMessage(response, "Sensory form created successfully"));
    },
  });
}

export function useUpdateSensoryForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => sensoryAPI.updateSensoryForm(id, data),
    onSuccess: (response, { id, data }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sensory.formBySample(
          data?.sampleID,
          data?.panelistID || null
        ),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensory.all });
      toast.success(getSuccessMessage(response, "Sensory form updated successfully"));
    },
  });
}

export function useSensoryTopSheetBySample(sampleId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.sensory.topSheetBySample(sampleId),
    queryFn: ({ signal }) => sensoryAPI.getSensoryTopSheetBySample(sampleId, { signal }),
    enabled: enabled && Boolean(sampleId),
    select: (responseData) => {
      return responseData?.data || responseData || null;
    },
  });
}

export function useCreateSensoryTopSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => sensoryAPI.createSensoryTopSheet(formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sensory.all });
      toast.success(getSuccessMessage(response, "Sensory top sheet created successfully"));
    },
  });
}

export function useUpdateSensoryTopSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => sensoryAPI.updateSensoryTopSheet(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sensory.topSheetBySample(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensory.all });
      toast.success(getSuccessMessage(response, "Sensory top sheet updated successfully"));
    },
  });
}

export function useRecipeSensoryFeedback(recipeId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['sensory', 'recipeFeedback', recipeId],
    queryFn: async ({ signal }) => {
      try {
        const responseData = await sensoryAPI.getRecipeSensoryFeedback(recipeId, { signal });
        return responseData?.data || responseData || null;
      } catch (err) {
        return null;
      }
    },
    enabled: enabled && Boolean(recipeId),
  });
}
