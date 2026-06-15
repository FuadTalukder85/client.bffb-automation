import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new invitation
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/invitations", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accessHistory.all });
    },
  });
}

/**
 * Hook for resending an invitation
 */
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/invitations/${id}/resend`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
    },
  });
}

/**
 * Hook for revoking an invitation
 */
export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/invitations/${id}/revoke`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accessHistory.all });
    },
  });
}

/**
 * Hook for deleting an invitation
 */
export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/invitations/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
    },
  });
}
