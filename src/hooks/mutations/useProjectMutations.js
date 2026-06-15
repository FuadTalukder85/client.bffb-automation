import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { projectService } from "@/services/projectService";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/projects", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.productDevelopmentProjects.all });
      toast.success(getSuccessMessage(response, "Project created successfully"));
    },
  });
}

/**
 * Hook for updating a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/projects/${id}`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.productDevelopmentProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.productDevelopmentProjects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applicationLabProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.applicationLabProjects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensoryLabProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensoryLabProjects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjectSchedule.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectHistory.all });
      toast.success(getSuccessMessage(response, "Project updated successfully"));
    },
  });
}

/**
 * Hook for archiving a project
 */
export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/projects/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.all });
      queryClient.invalidateQueries({ queryKey: ['masterProjects', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.productDevelopmentProjects.all });
      queryClient.invalidateQueries({ queryKey: ['productDevelopmentProjects', 'list'] });
      toast.success(getSuccessMessage(response, "Project archived successfully"));
    },
  });
}

/**
 * Hook for restoring a p roject
 */
export function useRestoreProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/projects/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.all });
      queryClient.invalidateQueries({ queryKey: ['masterProjects', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.productDevelopmentProjects.all });
      queryClient.invalidateQueries({ queryKey: ['productDevelopmentProjects', 'list'] });
      toast.success(getSuccessMessage(response, "Project restored successfully"));
    },
  });
}

/**
 * Hook for deleting a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.all });
      toast.success(getSuccessMessage(response, "Project deleted successfully"));
    },
  });
}

/**
 * Hook for updating project status
 */
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/projects/${id}/status`, { status }).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.detail(id) });
      toast.success(getSuccessMessage(response, "Project status updated"));
    },
  });
}

const getFilenameFromResponse = (response, fallback) => {
  const disposition = response?.headers?.["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};

export function useExportProjects() {
  return useMutation({
    mutationFn: (filters) => projectService.exportProjects(filters),
    onSuccess: (response) => {
      const blob = response?.data instanceof Blob ? response.data : new Blob([response?.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fallbackFilename = `projects-${new Date().toISOString().split("T")[0]}.xlsx`;

      link.href = url;
      link.setAttribute("download", getFilenameFromResponse(response, fallbackFilename));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Projects exported successfully");
    },
  });
}

export function useImportProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => projectService.importProjects(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.productDevelopmentProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.applicationLabProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensoryLabProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjectSchedule.all });
      toast.success(getSuccessMessage(response, "Projects imported successfully"));
    },
  });
}

/**
 * Hook for initiating a project with action and brief
 */
export function useInitiateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('[useInitiateProject] Calling initiate API:', { id, data });
      return api.post(`/projects/${id}/initiate`, data).then((res) => res.data);
    },
    onSuccess: (response, { id, successMessage }) => {
      console.log('[useInitiateProject] Mutation success, invalidating queries for project:', id);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.productDevelopmentProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.productDevelopmentProjects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applicationLabProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.applicationLabProjects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensoryLabProjects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sensoryLabProjects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.masterProjectSchedule.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectHistory.all });
      toast.success(successMessage || getSuccessMessage(response, "Project initiated successfully"));
    },
  });
}
