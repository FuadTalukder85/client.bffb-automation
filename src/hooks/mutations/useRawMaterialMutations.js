import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new raw material
 */
export function useCreateRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/raw-materials", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rawMaterials.all });
      toast.success(getSuccessMessage(response, "Raw material created successfully"));
    },
  });
}

/**
 * Hook for updating a raw material
 */
export function useUpdateRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/raw-materials/${id}`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rawMaterials.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rawMaterials.detail(id) });
      toast.success(getSuccessMessage(response, "Raw material updated successfully"));
    },
  });
}

/**
 * Hook for archiving a raw material
 */
export function useArchiveRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/raw-materials/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rawMaterials.all });
      toast.success(getSuccessMessage(response, "Raw material archived successfully"));
    },
  });
}

/**
 * Hook for restoring an archived raw material
 */
export function useRestoreRawMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/raw-materials/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rawMaterials.all });
      toast.success(getSuccessMessage(response, "Raw material restored successfully"));
    },
  });
}