/**
 * Master Project Module - Status Configuration
 */

import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";

/**
 * Status options for Master Project
 * Master Project uses "Lost" instead of "Cancelled"
 */
export const masterProjectStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Completed",
  "Rework",
  "Rework 2",
  "Rework 3",
  "Rework 4",
  "Rework 5",
  "Rework 6",
  "Rework 7",
  "Rework 8",
  "Rework 9",
  "Rework 10",
  "Approved",
  "Paused",
  { label: "Lost", value: "Lost", paletteKey: "CANCELLED" },
  "Adopted",
]);

export const getDynamicMasterProjectStatusOptions = (project) => {
  const baseOptions = masterProjectStatusOptions.filter((o) =>
    ["Not Started", "In Progress", "Completed", "Approved", "Paused", "Lost", "Adopted"].includes(o.value)
  );

  const currentStatus = project?.masterProject?.status;
  const extractReworkNumber = (status) => {
    if (!status || typeof status !== 'string') return 0;
    if (status === 'Rework') return 1;
    const match = status.match(/^Rework (\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const currentReworkNumber = extractReworkNumber(currentStatus);

  if (currentReworkNumber > 0) {
    const nextReworkNumber = currentReworkNumber + 1;
    const nextReworkValue = nextReworkNumber === 1 ? 'Rework' : `Rework ${nextReworkNumber}`;
    return [
      ...baseOptions,
      { label: nextReworkValue, value: nextReworkValue },
    ];
  }

  return [
    ...baseOptions,
    { label: 'Rework', value: 'Rework' },
  ];
};

/**
 * Status filter options for Master Project
 */
export const masterProjectStatusFilterOptions = createFilterOptions(
  masterProjectStatusOptions.filter(o => !o.value.startsWith('Rework') || o.value === 'Rework')
);

export const masterProjectDetailStatusOptions = masterProjectStatusOptions;

// Re-export shared options
export {
  purposeOptions,
  objectiveOptions,
  getObjectiveByPurpose,
  approvalOptions,
  promotionalToolOptions,
  marketingToolOptions,
  developmentPriorityOptions,
} from "../../shared/constants/projectOptions";

// Legacy exports
export const statusOptions = masterProjectStatusOptions;
export const masterProjectsStatusOptions = masterProjectStatusOptions;

export default {
  masterProjectStatusOptions,
  masterProjectStatusFilterOptions,
  masterProjectDetailStatusOptions,
};


// Master Project specific state options including "Not Feasible"
export const stateOptions = [
  { label: "Active", value: "active" },
  { label: "Archive", value: "archived" },
  { label: "Not Feasible", value: "not_feasible" },
  { label: "All", value: "all" },
];

export const clientStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Approved",
  "Rework",
  "Completed",
  "Paused",
  "Cancelled",
]);

export const shelfLifeStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Approved",
  "Rejected",
  "Rework",
]);

export const trialStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Approved",
  "Rejected",
  "Completed",
]);
