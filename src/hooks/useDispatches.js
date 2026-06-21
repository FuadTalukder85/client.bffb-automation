import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { dispatchService } from "@/services/dispatchService";

const DEFAULT_PAGINATION = { page: 1, limit: 20 };
const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export function useDispatches(filters = {}) {
  const {
    searchTerm = "",
    dispatchType,
    recipeId,
    sampleDeliveryStatus,
    isActive,
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (dispatchType && dispatchType !== "all") params.dispatchType = dispatchType;
  if (recipeId) params.recipeId = recipeId;
  if (sampleDeliveryStatus && sampleDeliveryStatus !== "all") params.sampleDeliveryStatus = sampleDeliveryStatus;
  if (isActive !== undefined) params.isActive = String(isActive);

  return useQuery({
    queryKey: queryKeys.dispatch.list(params),
    queryFn: ({ signal }) => dispatchService.getDispatches(params, { signal }),
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

export function useDispatch(id, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: queryKeys.dispatch.detail(id),
    queryFn: ({ signal }) => dispatchService.getDispatch(id, { signal }),
    enabled: enabled && Boolean(id),
    select: (resp) => resp?.data || resp || null,
  });
}

export function useCreateDispatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dispatchService.createDispatch,
    onSuccess: (response) => {
      qc.invalidateQueries(queryKeys.dispatch.lists());
      toast.success(getSuccessMessage(response, "Dispatch created successfully"));
    },
  });
}

export function useUpdateDispatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => dispatchService.updateDispatch(id, data),
    onSuccess: (response) => {
      qc.invalidateQueries(queryKeys.dispatch.lists());
      toast.success(getSuccessMessage(response, "Dispatch updated successfully"));
    },
  });
}

export function useArchiveDispatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dispatchService.archiveDispatch,
    onSuccess: (response) => {
      qc.invalidateQueries(queryKeys.dispatch.lists());
      toast.success(getSuccessMessage(response, "Dispatch archived successfully"));
    },
  });
}

export function useRestoreDispatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dispatchService.restoreDispatch,
    onSuccess: (response) => {
      qc.invalidateQueries(queryKeys.dispatch.lists());
      toast.success(getSuccessMessage(response, "Dispatch restored successfully"));
    },
  });
}
