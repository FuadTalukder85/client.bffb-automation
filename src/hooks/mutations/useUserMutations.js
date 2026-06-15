import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/user", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(getSuccessMessage(response, "User created successfully"));
    },
  });
}

/**
 * Hook for updating a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/user/${id}`, data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(getSuccessMessage(response, "User updated successfully"));
    },
  });
}

/**
 * Hook for archiving a user (soft delete)
 */
export function useArchiveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.put(`/user/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(getSuccessMessage(response, "User archived successfully"));
    },
  });
}

/**
 * Hook for restoring an archived user
 */
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.put(`/user/${id}/unarchive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(getSuccessMessage(response, "User restored successfully"));
    },
  });
}

/**
 * Hook for updating user role/department
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/user/${id}/update-role`, data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(getSuccessMessage(response, "User role updated successfully"));
    },
  });
}

/**
 * Hook for updating user password (admin action)
 */
export function useUpdateUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }) =>
      api.put(`/user/${id}/password`, { password }).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(getSuccessMessage(response, "Password updated successfully"));
    },
  });
}

/**
 * Hook for unblocking a user after lockout
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.put(`/user/${id}/unblock`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(getSuccessMessage(response, "User unblocked successfully"));
    },
  });
}

/**
 * Hook for deleting a user permanently
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/user/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(getSuccessMessage(response, "User deleted permanently"));
    },
  });
}
