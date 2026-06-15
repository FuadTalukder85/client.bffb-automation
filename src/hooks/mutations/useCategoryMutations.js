import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

// ============ Categories ============

/**
 * Hook for creating a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/categories", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success(getSuccessMessage(response, "Category created successfully"));
    },
  });
}

/**
 * Hook for updating a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/categories/${id}`, data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success(getSuccessMessage(response, "Category updated successfully"));
    },
  });
}

/**
 * Hook for archiving a category
 */
export function useArchiveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/categories/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success(getSuccessMessage(response, "Category archived successfully"));
    },
  });
}

/**
 * Hook for restoring a category
 */
export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/categories/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success(getSuccessMessage(response, "Category restored successfully"));
    },
  });
}

/**
 * Hook for deleting a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success(getSuccessMessage(response, "Category deleted permanently"));
    },
  });
}

// ============ Subcategories ============

/**
 * Hook for creating a new subcategory
 */
export function useCreateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/subcategories", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories.all });
      toast.success(getSuccessMessage(response, "Subcategory created successfully"));
    },
  });
}

/**
 * Hook for updating a subcategory
 */
export function useUpdateSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/subcategories/${id}`, data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories.all });
      toast.success(getSuccessMessage(response, "Subcategory updated successfully"));
    },
  });
}

/**
 * Hook for archiving a subcategory
 */
export function useArchiveSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/subcategories/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories.all });
      toast.success(getSuccessMessage(response, "Subcategory archived successfully"));
    },
  });
}

/**
 * Hook for restoring a subcategory
 */
export function useRestoreSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/subcategories/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories.all });
      toast.success(getSuccessMessage(response, "Subcategory restored successfully"));
    },
  });
}

/**
 * Hook for deleting a subcategory
 */
export function useDeleteSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/subcategories/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subcategories.all });
      toast.success(getSuccessMessage(response, "Subcategory deleted permanently"));
    },
  });
}

// ============ Sub-subcategories ============

/**
 * Hook for creating a new sub-subcategory
 */
export function useCreateSubSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/subsubcategories", data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subsubcategories.all });
      toast.success(getSuccessMessage(response, "Sub-subcategory created successfully"));
    },
  });
}

/**
 * Hook for updating a sub-subcategory
 */
export function useUpdateSubSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/subsubcategories/${id}`, data).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subsubcategories.all });
      toast.success(getSuccessMessage(response, "Sub-subcategory updated successfully"));
    },
  });
}

/**
 * Hook for archiving a sub-subcategory
 */
export function useArchiveSubSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/subsubcategories/${id}/archive`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subsubcategories.all });
      toast.success(getSuccessMessage(response, "Sub-subcategory archived successfully"));
    },
  });
}

/**
 * Hook for restoring a sub-subcategory
 */
export function useRestoreSubSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/subsubcategories/${id}/restore`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subsubcategories.all });
      toast.success(getSuccessMessage(response, "Sub-subcategory restored successfully"));
    },
  });
}

/**
 * Hook for deleting a sub-subcategory
 */
export function useDeleteSubSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/subsubcategories/${id}`).then((res) => res.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subsubcategories.all });
      toast.success(getSuccessMessage(response, "Sub-subcategory deleted permanently"));
    },
  });
}
