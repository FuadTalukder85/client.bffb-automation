import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new internal task
 */
export function useCreateInternalTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/internal-tasks", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.all });
      toast.success(getSuccessMessage(response, "Internal task created successfully"));
    },
  });
}

/**
 * Hook for updating an internal task
 */
export function useUpdateInternalTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/internal-tasks/${id}`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.detail(id) });
      toast.success(getSuccessMessage(response, "Internal task updated successfully"));
    },
  });
}

/**
 * Hook for archiving an internal task
 */
export function useArchiveInternalTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/internal-tasks/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.all });
      toast.success(getSuccessMessage(response, "Internal task archived successfully"));
    },
  });
}

/**
 * Hook for restoring an internal task
 */
export function useRestoreInternalTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/internal-tasks/${id}`, { isActive: true }).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.all });
      toast.success(getSuccessMessage(response, "Internal task restored successfully"));
    },
  });
}

/**
 * Hook for deleting an internal task
 */
export function useDeleteInternalTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/internal-tasks/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.all });
      toast.success(getSuccessMessage(response, "Internal task deleted permanently"));
    },
  });
}

/**
 * Hook for creating bulk internal tasks (for a team)
 */
export function useCreateBulkInternalTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/internal-tasks/bulk", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.all });
      toast.success(getSuccessMessage(response, "Bulk tasks created successfully"));
    },
  });
}

/**
 * Hook for updating internal task status
 */
export function useUpdateInternalTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/internal-tasks/${id}/status`, { status }).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.internalTasks.detail(id) });
      toast.success(getSuccessMessage(response, "Task status updated"));
    },
  });
}
