import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

/**
 * Hook for creating a new recipe
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/recipes", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      toast.success(getSuccessMessage(response, "Recipe created successfully"));
    },
  });
}

/**
 * Hook for updating a recipe
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/recipes/${id}`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.detail(id) });
      toast.success(getSuccessMessage(response, "Recipe updated successfully"));
    },
  });
}

/**
 * Hook for archiving a recipe
 */
export function useArchiveRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/recipes/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      toast.success(getSuccessMessage(response, "Recipe archived successfully"));
    },
  });
}

/**
 * Hook for restoring a recipe
 */
export function useRestoreRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.post(`/recipes/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      toast.success(getSuccessMessage(response, "Recipe restored successfully"));
    },
  });
}

/**
 * Hook for creating a new recipe version
 */
export function useCreateRecipeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data = {} }) => api.post(`/recipes/${id}/versions`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.versions(id) });
      toast.success(getSuccessMessage(response, "New recipe version created"));
    },
  });
}

/**
 * Hook for deleting a recipe permanently
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/recipes/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      toast.success(getSuccessMessage(response, "Recipe deleted permanently"));
    },
  });
}

/**
 * Hook for changing recipe type (v0-only recipes)
 */
export function useChangeRecipeType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      api.patch(`/recipes/${id}/type`, data).then((res) => res.data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.versions(id) });
      toast.success(getSuccessMessage(response, "Recipe type changed successfully"));
    },
  });
}
