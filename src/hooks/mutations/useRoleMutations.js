import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/roles", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accessHistory.all });
      toast.success(getSuccessMessage(response, "Role created successfully"));
    },
  });
}

/**
 * Hook for creating a role with permissions
 */
export function useCreateRoleWithPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { skipGlobalErrorToast: true },
    mutationFn: (data) => api.post("/roles/with-permissions", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accessHistory.all });
      toast.success(getSuccessMessage(response, "Role with permissions created successfully"));
    },
  });
}

/**
 * Hook for updating a role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { skipGlobalErrorToast: true },
    mutationFn: ({ id, data }) => api.patch(`/roles/${id}`, data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accessHistory.all });
      toast.success(getSuccessMessage(response, "Role updated successfully"));
    },
  });
}

/**
 * Hook for archiving a role
 */
export function useArchiveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/roles/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success(getSuccessMessage(response, "Role archived successfully"));
    },
  });
}

/**
 * Hook for restoring a role
 */
export function useRestoreRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/roles/${id}/unarchive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success(getSuccessMessage(response, "Role restored successfully"));
    },
  });
}

/**
 * Hook for deleting a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/roles/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      toast.success(getSuccessMessage(response, "Role deleted permanently"));
    },
  });
}

/**
 * Hook for assigning a role to a user
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }) =>
      api.post(`/user/${userId}/roles`, { roleId }).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accessHistory.all });
      toast.success(getSuccessMessage(response, "Role assigned to user successfully"));
    },
  });
}

/**
 * Hook for removing a role from a user
 */
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }) =>
      api.delete(`/user/${userId}/roles/${roleId}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accessHistory.all });
      toast.success(getSuccessMessage(response, "Role removed from user successfully"));
    },
  });
}

/**
 * Hook for updating role permissions
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { skipGlobalErrorToast: true },
    mutationFn: ({ id, permissionIds }) =>
      api.put(`/roles/${id}/permissions`, { permissionIds }).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.permissions() });
      toast.success(getSuccessMessage(response, "Role permissions updated successfully"));
    },
  });
}
