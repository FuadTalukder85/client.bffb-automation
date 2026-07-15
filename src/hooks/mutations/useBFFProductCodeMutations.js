import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { bffProductCodeService } from "@/services/bffProductCodeService";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new BFF product code
 */
export function useCreateBFFProductCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/bff-product-codes", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductCodes.all });
      toast.success(getSuccessMessage(response, "BFF product code created successfully"));
    },
  });
}

/**
 * Hook for updating a BFF product code
 */
export function useUpdateBFFProductCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/bff-product-codes/${id}`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductCodes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductCodes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      toast.success(getSuccessMessage(response, "BFF product code updated successfully"));
    },
  });
}

/**
 * Hook for archiving a BFF product code
 */
export function useArchiveBFFProductCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/bff-product-codes/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductCodes.all });
      toast.success(getSuccessMessage(response, "BFF product code archived successfully"));
    },
  });
}

/**
 * Hook for restoring a BFF product code
 */
export function useRestoreBFFProductCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/bff-product-codes/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductCodes.all });
      toast.success(getSuccessMessage(response, "BFF product code restored successfully"));
    },
  });
}

/**
 * Hook for deleting a BFF product code
 */
export function useDeleteBFFProductCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/bff-product-codes/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductCodes.all });
      toast.success(getSuccessMessage(response, "BFF product code deleted permanently"));
    },
  });
}

/**
 * Hook for bulk importing BFF product codes
 */
export function useImportBFFProductCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, params }) => {
      const formData = new FormData();
      formData.append("file", file);
      return api
        .post("/bff-product-codes/import", formData, {
          params,
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductCodes.all });
      toast.success(getSuccessMessage(response, "BFF product codes imported successfully"));
    },
  });
}

/**
 * Hook for syncing all recipe ingredient prices with current BFF product costs
 */
export function useSyncRecipePrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bffProductCodeService.syncRecipePrices(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductCodes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      toast.success(getSuccessMessage(response, "Recipe prices synced successfully"));
    },
  });
}
