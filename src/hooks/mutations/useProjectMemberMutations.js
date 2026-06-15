import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for adding a member to a project
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }) =>
      api.post(`/project-members/${projectId}/members`, { userId }).then((res) => res.data),
    onSuccess: (data, { projectId }) => {
      // Refresh project members list
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMembers.list(projectId) });
      // Refresh project member status
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMembers.status(projectId) });
      toast.success(getSuccessMessage(data, "Member added to project successfully"));
    },
  });
}

/**
 * Hook for removing a member from a project
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }) =>
      api.delete(`/project-members/${projectId}/members/${userId}`).then((res) => res.data),
    onSuccess: (data, { projectId }) => {
      // Refresh project members list
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMembers.list(projectId) });
      // Refresh project member status
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMembers.status(projectId) });
      toast.success(getSuccessMessage(data, "Member removed from project successfully"));
    },
  });
}

/**
 * Hook for updating project member responsibilities
 */
export function useUpdateProjectMemberResponsibilities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId, responsibilities }) =>
      api.put(`/project-members/${projectId}/members/${userId}`, { responsibilities }).then((res) => res.data),
    onSuccess: (data, { projectId }) => {
      // Refresh project members list
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMembers.list(projectId) });
      // Refresh project member status
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMembers.status(projectId) });
      toast.success(getSuccessMessage(data, "Member responsibilities updated successfully"));
    },
  });
}