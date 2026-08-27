import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { productionScheduleService } from "@/services/productionScheduleService";

const DEFAULT_PAGINATION = { page: 1, limit: 50, total: 0, totalPages: 1 };
const getSuccessMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

// Activity type mapping
const ACTIVITY_MAP = {
  w: 'Weighing',
  m: 'Mixing',
  pr: 'Preparation',
  pk: 'Packaging',
};

// Time slots constant (matches server)
const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

/**
 * Format date to YYYY-MM-DD for API
 */
const formatDateForAPI = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Transform server schedule data to client format (rows per project)
 * Now with new structure: each doc has schedule array with time slots
 */
const transformSchedulesToRows = (schedules) => {
  if (!schedules || !Array.isArray(schedules)) return [];

  return schedules.map(schedule => {
    const project = schedule.projectId || {};
    const masterProject = project.masterProject || {};

    // Build schedule map from time slot to action
    const scheduleMap = {};
    const scheduleEntries = [];

    if (schedule.schedule && Array.isArray(schedule.schedule)) {
      schedule.schedule.forEach(item => {
        scheduleMap[item.timeSlot] = item.action;
        scheduleEntries.push({
          _id: item._id,
          timeSlot: item.timeSlot,
          action: item.action,
        });
      });
    }

    const responsiblePersons = schedule.responsiblePersons || [];
    const responsiblePersonNames = Array.isArray(responsiblePersons)
      ? responsiblePersons.map(u => u?.name || u?.email || "Unknown").join(", ")
      : "";
    const recipeId = schedule.recipeId?._id || schedule.recipeId || null;
    const recipeCode = schedule.recipeCode || schedule.recipeId?.recipeCode || project.applicationLab?.recipeCode || '';

    return {
      id: schedule._id,
      projectId: project._id,
      projectCode: masterProject.code || 'Unknown',
      projectName: masterProject.title || '',
      purposeName: masterProject.purposeDetails || masterProject.purposeName || masterProject.purpose || project.purposeDetails || project.purposeName || project.applicationLab?.purposeName || '',
      objectiveDetails: masterProject.objectiveDetails || masterProject.objective || project.objectiveDetails || project.productDevelopment?.objectiveDetails || '',
      recipeCode: recipeCode,
      recipeId: recipeId,
      responsiblePersons: responsiblePersons,
      responsiblePersonNames: responsiblePersonNames,
      date: schedule.date,
      isActive: schedule.isActive,
      schedule: scheduleMap,
      scheduleEntries: scheduleEntries,
      rawSchedule: schedule,
    };
  });
};

/**
 * Hook for fetching production schedules by date
 * @param {Object} options
 * @param {Date|string} options.date - Date to fetch schedules for
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Object} TanStack Query result
 */
export function useProductionSchedulesByDate(options = {}) {
  const {
    date = new Date(),
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    isActive = 'true'
  } = options;

  const formattedDate = formatDateForAPI(date);

  return useQuery({
    queryKey: queryKeys.productionSchedules.byDate(formattedDate, { page, limit, isActive }),
    queryFn: ({ signal }) =>
      api.get(`/production-schedules/date/${formattedDate}`, {
        params: { page, limit, isActive },
        signal
      }).then((res) => res.data),
    placeholderData: keepPreviousData,
    enabled: !!formattedDate,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const schedules = result.data || result.items || [];

      return {
        data: transformSchedulesToRows(schedules),
        rawSchedules: schedules,
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}

/**
 * Hook for fetching a single production schedule by ID
 */
export function useProductionSchedule(scheduleId, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.productionSchedules.detail(scheduleId),
    queryFn: async ({ signal }) => {
      const response = await api.get(`/production-schedules/${scheduleId}`, { signal });
      return response.data;
    },
    enabled: enabled && !!scheduleId,
  });
}

/**
 * Hook for fetching available time slots for a project on a specific date
 */
export function useAvailableTimeSlots(projectId, date, { enabled = true } = {}) {
  const formattedDate = formatDateForAPI(date);

  return useQuery({
    queryKey: queryKeys.productionSchedules.availableSlots(projectId, formattedDate),
    queryFn: async ({ signal }) => {
      const response = await api.get(
        `/production-schedules/available-slots/${projectId}/${formattedDate}`,
        { signal }
      );
      return response.data?.data || [];
    },
    enabled: enabled && !!projectId && !!formattedDate,
  });
}

/**
 * Hook for upserting (create or update) a production schedule
 */
export function useUpsertProductionSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionScheduleService.upsertProductionSchedule,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productionSchedules.all });
      toast.success(getSuccessMessage(response, "Schedule updated successfully"));
    },
  });
}

/**
 * Hook for updating a single time slot
 */
export function useUpdateTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionScheduleService.updateTimeSlot,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productionSchedules.all });
      toast.success(getSuccessMessage(response, "Time slot updated successfully"));
    },
  });
}

/**
 * Hook for removing a single time slot
 */
export function useRemoveTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionScheduleService.removeTimeSlot,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productionSchedules.all });
      toast.success(getSuccessMessage(response, "Time slot removed"));
    },
  });
}

/**
 * Hook for archiving (soft deleting) a production schedule
 */
export function useArchiveProductionSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionScheduleService.archiveProductionSchedule,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.productionSchedules.all,
        refetchType: 'all'
      });
      toast.success(getSuccessMessage(response, "Schedule archived successfully"));
    },
  });
}

/**
 * Hook for restoring an archived production schedule
 */
export function useRestoreProductionSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionScheduleService.restoreProductionSchedule,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productionSchedules.all });
      toast.success(getSuccessMessage(response, "Schedule restored successfully"));
    },
  });
}

/**
 * Hook for exporting production schedules to Excel
 * @returns {Object} Mutation object for downloading Excel file
 */
export function useExportProductionSchedules() {
  return useMutation({
    meta: { skipGlobalErrorToast: true },
    mutationFn: async ({ date, startDate, endDate, projectId }) => {
      const params = {};
      if (date) params.date = formatDateForAPI(date);
      if (startDate) params.startDate = formatDateForAPI(startDate);
      if (endDate) params.endDate = formatDateForAPI(endDate);
      if (projectId) params.projectId = projectId;

      const response = await productionScheduleService.exportProductionSchedules(params);
      return response;
    },
  });
}

export { TIME_SLOTS, ACTIVITY_MAP, formatDateForAPI };
