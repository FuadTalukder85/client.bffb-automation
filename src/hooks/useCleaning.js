import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { cleaningService } from "@/services/cleaningService";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };
const getSuccessMessage = (response, fallback) =>
    response?.message || response?.data?.message || fallback;

/**
 * Hook for fetching cleanliness items using TanStack Query
 * @param {Object} filters
 * @returns {Object} TanStack Query result
 */
export function useCleanlinessItems(filters = {}) {
    return useQuery({
        queryKey: queryKeys.cleaning.cleanlinessItems.list(filters),
        queryFn: () => cleaningService.getCleanlinessItems(filters),
        placeholderData: keepPreviousData,
        select: (responseData) => {
            return {
                data: responseData?.data || [],
                pagination: responseData?.pagination || DEFAULT_PAGINATION,
            };
        },
    });
}

/**
 * Hook for fetching cleaning status using TanStack Query
 * @param {Object} filters
 * @returns {Object} TanStack Query result
 */
export function useCleaningStatus(filters = {}) {
    return useQuery({
        queryKey: queryKeys.cleaning.status.list(filters),
        queryFn: () => cleaningService.getCleaningStatus(filters),
        placeholderData: keepPreviousData,
        select: (responseData) => {
            return {
                data: responseData?.data || [],
                pagination: responseData?.pagination || DEFAULT_PAGINATION,
                meta: responseData?.meta || {},
            };
        },
    });
}

export function useAvailableCleaningStatusItems(filters = {}, enabled = true) {
    return useQuery({
        queryKey: queryKeys.cleaning.status.availableItems(filters),
        queryFn: () => cleaningService.getAvailableCleaningStatusItems(filters),
        enabled,
        placeholderData: keepPreviousData,
        select: (responseData) => {
            // Normalize to { data: [] } to match other hooks
            let items = [];
            if (Array.isArray(responseData)) {
                items = responseData;
            } else if (Array.isArray(responseData?.data)) {
                items = responseData.data;
            }
            return { data: items };
        },
    });
}

export function useAddItemToCleaningMonth() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => cleaningService.addItemToCleaningMonth(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.status.all });
            toast.success(getSuccessMessage(response, "Item added to cleaning month successfully"));
        },
    });
}

export function useRemoveItemFromCleaningMonth() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (monthItemId) => cleaningService.removeItemFromCleaningMonth(monthItemId),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.status.all });
            toast.success(getSuccessMessage(response, "Item removed from cleaning month successfully"));
        },
    });
}

export function useUpdateMonthItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ monthItemId, cleaningItemId }) =>
            cleaningService.updateMonthItem(monthItemId, cleaningItemId),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.status.all });
            toast.success(getSuccessMessage(response, "Cleaning item updated successfully"));
        },
    });
}

export function useUpsertCleaningStatusEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => cleaningService.updateCleaningStatus(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.status.all });
            toast.success(getSuccessMessage(response, "Cleaning status updated successfully"));
        },
    });
}

export function useCreateCleanlinessItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => cleaningService.createCleanlinessItem(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.all });
            toast.success(getSuccessMessage(response, "Cleanliness item created successfully"));
        },
    });
}

export function useUpdateCleanlinessItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => cleaningService.updateCleanlinessItem(id, data),
        onSuccess: (response, { id }) => {
            // Invalidate both the cleanliness items list/detail and any status views that depend on the item name.
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.cleanlinessItems.detail(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.status.all });
            toast.success(getSuccessMessage(response, "Cleanliness item updated successfully"));
        },
    });
}

export function useArchiveCleanlinessItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => cleaningService.archiveCleanlinessItem(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.status.all });
            toast.success(getSuccessMessage(response, "Cleanliness item archived successfully"));
        },
    });
}

export function useRestoreCleanlinessItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => cleaningService.restoreCleanlinessItem(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.status.all });
            toast.success(getSuccessMessage(response, "Cleanliness item restored successfully"));
        },
    });
}

export function useRestoreCleaningStatusMonthItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (monthItemId) => cleaningService.restoreCleaningMonthItem(monthItemId),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.cleaning.status.all });
            toast.success(getSuccessMessage(response, "Cleaning status item restored successfully"));
        },
    });
}

export function useExportCleanlinessItems() {
    return useMutation({
        meta: { skipGlobalErrorToast: true },
        mutationFn: async ({ searchTerm, isActive }) => {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (isActive !== undefined) params.isActive = isActive;

            const response = await cleaningService.exportCleanlinessItems(params);
            return response;
        },
        onSuccess: (response) => {
            toast.success(getSuccessMessage(response, "Cleanliness items exported successfully"));
        },
    });
}
