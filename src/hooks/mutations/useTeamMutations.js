import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new team
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/teams", data).then((res) => res.data),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (response) => {
      // Automatically refreshes any component using useTeams()
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success(getSuccessMessage(response, "Team created successfully"));
    },
  });
}

/**
 * Hook for updating a team
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/teams/${id}`, data).then((res) => res.data),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success(getSuccessMessage(response, "Team updated successfully"));
    },
  });
}

/**
 * Hook for archiving a team (soft delete)
 */
export function useArchiveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/teams/${id}/archive`).then((res) => res.data),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success(getSuccessMessage(response, "Team archived successfully"));
    },
  });
}

/**
 * Hook for restoring an archived team
 */
export function useRestoreTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/teams/${id}/restore`).then((res) => res.data),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success(getSuccessMessage(response, "Team restored successfully"));
    },
  });
}

/**
 * Hook for deleting a team permanently
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/teams/${id}`).then((res) => res.data),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success(getSuccessMessage(response, "Team deleted permanently"));
    },
  });
}

/**
 * Hook for adding a member to a team
 * @param {string} teamId - Team ID
 * @param {string|string[]} userIds - Single user ID or array of user IDs
 */
export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userIds }) => {
      // Ensure userIds is always an array for consistency
      const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];
      return api.post(`/teams/${teamId}/members`, { userIds: userIdsArray }).then((res) => res.data);
    },
    meta: { skipGlobalErrorToast: true },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success(getSuccessMessage(response, "Member(s) added successfully"));
    },
  });
}

/**
 * Hook for removing a member from a team
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }) =>
      api.delete(`/teams/${teamId}/members/${userId}`).then((res) => res.data),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success(getSuccessMessage(response, "Member removed successfully"));
    },
  });
}
