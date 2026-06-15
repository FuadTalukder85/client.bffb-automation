import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { maintenanceService } from "@/services/maintenanceService";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };
const getSuccessMessage = (response, fallback) =>
    response?.message || response?.data?.message || fallback;

/**
 * Hook for fetching maintenance items using TanStack Query
 * @param {Object} filters
 * @returns {Object} TanStack Query result
 */
export function useMaintenanceItems(filters = {}) {
    return useQuery({
        queryKey: queryKeys.maintenance.maintenanceItems.list(filters),
        queryFn: () => maintenanceService.getMaintenanceItems(filters),
        placeholderData: keepPreviousData,
        select: (responseData) => {
            return {
                data: responseData?.data || [],
                pagination: responseData?.pagination || DEFAULT_PAGINATION,
            };
        },
    });
}

export function useCreateMaintenanceItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => maintenanceService.createMaintenanceItem(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all });
            toast.success(getSuccessMessage(response, "Maintenance item created successfully"));
        },
    });
}

export function useUpdateMaintenanceItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => maintenanceService.updateMaintenanceItem(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all });
            toast.success(getSuccessMessage(response, "Maintenance item updated successfully"));
        },
    });
}

export function useArchiveMaintenanceItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => maintenanceService.archiveMaintenanceItem(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all });
            toast.success(getSuccessMessage(response, "Maintenance item archived successfully"));
        },
    });
}

export function useRestoreMaintenanceItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => maintenanceService.restoreMaintenanceItem(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all });
            toast.success(getSuccessMessage(response, "Maintenance item restored successfully"));
        },
    });
}

export function useExportMaintenanceItems() {
    return useMutation({
        meta: { skipGlobalErrorToast: true },
        mutationFn: (filters) => maintenanceService.exportMaintenanceItems(filters),
        onSuccess: (response) => {
            const data = response;
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `maintenance-items-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(getSuccessMessage(response, "Maintenance items exported successfully"));
        },
    });
}

/**
 * Hook for fetching maintenance schedule overview
 * @param {number} year
 * @param {Object} filters
 * @returns {Object} TanStack Query result
 */
export function useMaintenanceScheduleOverview(year, filters = {}) {
    return useQuery({
        queryKey: queryKeys.maintenance.maintenanceSchedules.overview(year, filters),
        queryFn: () => maintenanceService.getMaintenanceScheduleOverview(year, filters),
        select: (responseData) => responseData?.data || [],
    });
}

/**
 * Hook for bulk scheduling maintenance
 * @returns {Object} TanStack Query mutation
 */
export function useBulkScheduleMaintenance() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => maintenanceService.bulkScheduleMaintenance(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.maintenanceSchedules.all });
            toast.success(getSuccessMessage(response, "Maintenance scheduled successfully"));
        },
    });
}

/**
 * Hook for deleting a maintenance schedule
 * @returns {Object} TanStack Query mutation
 */
export function useDeleteMaintenanceSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => maintenanceService.deleteMaintenanceSchedule(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.maintenanceSchedules.all });
            toast.success(getSuccessMessage(response, "Maintenance schedule deleted successfully"));
        },
    });
}

export function useRestoreMaintenanceSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => maintenanceService.restoreMaintenanceSchedule(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.maintenanceSchedules.all });
            toast.success(getSuccessMessage(response, "Maintenance schedule restored successfully"));
        },
    });
}

/**
 * Hook for updating a specific occurrence in a schedule
 * @returns {Object} TanStack Query mutation
 */
export function useUpdateMaintenanceOccurrence() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, occurrenceId, payload }) => maintenanceService.updateOccurrence(id, occurrenceId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.maintenanceSchedules.all });
            toast.success(getSuccessMessage(response, "Maintenance status updated successfully"));
        },
    });
}

