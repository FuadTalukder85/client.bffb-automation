import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new packaging type
 */
export function useCreatePackagingType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/packaging-types", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packagingTypes.all });
      toast.success(getSuccessMessage(response, "Packaging type created successfully"));
    },
  });
}

/**
 * Hook for updating a packaging type
 */
export function useUpdatePackagingType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/packaging-types/${id}`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packagingTypes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.packagingTypes.detail(id) });
      toast.success(getSuccessMessage(response, "Packaging type updated successfully"));
    },
  });
}

/**
 * Hook for archiving a packaging type
 */
export function useArchivePackagingType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/packaging-types/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packagingTypes.all });
      toast.success(getSuccessMessage(response, "Packaging type archived successfully"));
    },
  });
}

/**
 * Hook for restoring an archived packaging type
 */
export function useRestorePackagingType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/packaging-types/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packagingTypes.all });
      toast.success(getSuccessMessage(response, "Packaging type restored successfully"));
    },
  });
}