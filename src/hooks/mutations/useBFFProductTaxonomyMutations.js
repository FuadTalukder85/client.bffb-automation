import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { bffProductTaxonomyService } from "@/services/bffProductTaxonomyService";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export function useCreateBFFProductTaxonomyItem(kind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => bffProductTaxonomyService.createItem(kind, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.all });
      toast.success(getSuccessMessage(response, "Entry created successfully"));
    },
  });
}

export function useUpdateBFFProductTaxonomyItem(kind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => bffProductTaxonomyService.updateItem(kind, id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.detail(kind, id) });
      toast.success(getSuccessMessage(response, "Entry updated successfully"));
    },
  });
}

export function useArchiveBFFProductTaxonomyItem(kind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => bffProductTaxonomyService.archiveItem(kind, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.all });
      toast.success(getSuccessMessage(response, "Entry archived successfully"));
    },
  });
}

export function useRestoreBFFProductTaxonomyItem(kind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => bffProductTaxonomyService.restoreItem(kind, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.all });
      toast.success(getSuccessMessage(response, "Entry restored successfully"));
    },
  });
}
