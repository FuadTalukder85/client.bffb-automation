import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { bffProductSegmentService } from "@/services/bffProductSegmentService";

const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export function useCreateBFFProductSegmentItem(kind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => bffProductSegmentService.createItem(kind, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.all });
      toast.success(getSuccessMessage(response, "Entry created successfully"));
    },
  });
}
export const useCreateBFFProductTaxonomyItem = useCreateBFFProductSegmentItem;

export function useUpdateBFFProductSegmentItem(kind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => bffProductSegmentService.updateItem(kind, id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.detail(kind, id) });
      toast.success(getSuccessMessage(response, "Entry updated successfully"));
    },
  });
}
export const useUpdateBFFProductTaxonomyItem = useUpdateBFFProductSegmentItem;

export function useArchiveBFFProductSegmentItem(kind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => bffProductSegmentService.archiveItem(kind, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.all });
      toast.success(getSuccessMessage(response, "Entry archived successfully"));
    },
  });
}
export const useArchiveBFFProductTaxonomyItem = useArchiveBFFProductSegmentItem;

export function useRestoreBFFProductSegmentItem(kind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => bffProductSegmentService.restoreItem(kind, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bffProductTaxonomy.all });
      toast.success(getSuccessMessage(response, "Entry restored successfully"));
    },
  });
}
export const useRestoreBFFProductTaxonomyItem = useRestoreBFFProductSegmentItem;
