import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

const invalidateProjectTaskRelatedQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.projectTasks.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.samples.all });
};

/**
 * Hook for creating a new project task
 */
export function useCreateProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/project-tasks", data).then((res) => res.data),
    onSuccess: (response) => {
      invalidateProjectTaskRelatedQueries(queryClient);
      toast.success(getSuccessMessage(response, "Project task created successfully"));
    },
  });
}

/**
 * Hook for creating bulk project tasks
 */
export function useCreateBulkProjectTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/project-tasks/bulk", data).then((res) => res.data),
    onSuccess: (response) => {
      invalidateProjectTaskRelatedQueries(queryClient);
      toast.success(getSuccessMessage(response, "Project tasks created successfully"));
    },
  });
}

/**
 * Hook for updating a project task
 */
export function useUpdateProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/project-tasks/${id}`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      invalidateProjectTaskRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTasks.detail(id) });
      toast.success(getSuccessMessage(response, "Project task updated successfully"));
    },
  });
}

/**
 * Hook for archiving a project task
 */
export function useArchiveProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/project-tasks/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      invalidateProjectTaskRelatedQueries(queryClient);
      toast.success(getSuccessMessage(response, "Project task archived successfully"));
    },
  });
}

/**
 * Hook for restoring a project task
 */
export function useRestoreProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/project-tasks/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      invalidateProjectTaskRelatedQueries(queryClient);
      toast.success(getSuccessMessage(response, "Project task restored successfully"));
    },
  });
}

/**
 * Hook for deleting a project task
 */
export function useDeleteProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/project-tasks/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      invalidateProjectTaskRelatedQueries(queryClient);
      toast.success(getSuccessMessage(response, "Project task deleted permanently"));
    },
  });
}

/**
 * Hook for updating project task status
 */
export function useUpdateProjectTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/project-tasks/${id}/status`, { status }).then((res) => res.data),
    onSuccess: (response, { id }) => {
      invalidateProjectTaskRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.projectTasks.detail(id) });
      toast.success(getSuccessMessage(response, "Task status updated"));
    },
  });
}

/**
 * Hook for assigning a project task to a user
 */
export function useAssignProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedTo }) =>
      api.patch(`/project-tasks/${id}/assign`, { assignedTo }).then((res) => res.data),
    onSuccess: (response) => {
      invalidateProjectTaskRelatedQueries(queryClient);
      toast.success(getSuccessMessage(response, "Task assigned successfully"));
    },
  });
}
