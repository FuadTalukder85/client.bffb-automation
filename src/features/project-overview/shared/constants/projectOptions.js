/**
 * Shared Project Options Configuration
 * 
 * This file defines common options used across all project modules.
 * For module-specific status configurations, see individual module constants.
 * 
 * Location: src/features/project-overview/shared/constants/projectOptions.js
 */

import { buildStatusOptions, createFilterOptions, COMMON_STATUS_SETS } from "@/config/statusConfig";

// ============================================================================
// STATUS OPTIONS - Base Configuration
// ============================================================================

/**
 * Base status options for general use
 * Used when a module doesn't need custom status sets
 */
export const baseStatusOptions = buildStatusOptions(COMMON_STATUS_SETS.FULL_LIFECYCLE);

/**
 * Base filter options (includes "All")
 * Used in search/filter bars across modules
 */
export const baseStatusFilterOptions = createFilterOptions(baseStatusOptions);

// ============================================================================
// LEGACY EXPORTS (Backward Compatibility)
// ============================================================================
// These are maintained for backward compatibility but should be migrated
// to use module-specific configurations
// 
// NOTE: Do NOT import from module-specific files here to avoid circular dependencies

export const statusOptions = baseStatusOptions;

// Master Project legacy exports - uses BASIC_WORKFLOW (5 statuses)
const masterProjectBasicStatuses = buildStatusOptions(COMMON_STATUS_SETS.BASIC_WORKFLOW);
export const applicationLabStatusOptions = baseStatusOptions;
export const masterProjectsStatusOptions = masterProjectBasicStatuses; // 5 statuses: Not Started, In Progress, Completed, Rework, Approved
export const productDevelopmentStatusOptions = baseStatusOptions;
export const sensoryLabStatusOptions = baseStatusOptions;

export const masterProjectStatusOptions = masterProjectBasicStatuses;

export const masterProjectScheduleStatusOptions = baseStatusOptions;

export const sensoryStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Completed",
  "Rework",
  "Approved",
  "Paused",
  "Cancelled",
]);

// ============================================================================
// COMMON NON-STATUS OPTIONS
// ============================================================================

// Common state options
export const stateOptions = [
  { label: "Active", value: "true" },
  { label: "Archived", value: "false" },
  { label: "All", value: "all" },
];

// Purpose options with variations
export const purposeOptions = [
  { label: "Client", value: "Client" },
  { label: "Project", value: "Project" },
  { label: "Campaign", value: "Campaign" },
];

// Purpose filter options (includes "All")
export const purposeFilterOptions = [
  { label: "All Purpose", value: "" },
  ...purposeOptions,
];

// Date range filter helper
export const dateRangeOptions = [
  { label: "All Dates", value: "" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "This Year", value: "this_year" },
];

export const getObjectiveByPurpose = (purpose) => {
  const normalizedPurpose = (purpose || "").trim().toLowerCase();

  if (normalizedPurpose === "client") {
    return "Prospect";
  }

  if (normalizedPurpose === "project" || normalizedPurpose === "campaign") {
    return "Requirement";
  }

  return "";
};

// Common objective options
export const objectiveOptions = [
  { label: "Requirement", value: "Requirement" },
  { label: "Prospect", value: "Prospect" },
];

// Common approval options
export const approvalOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

// Tool options
export const promotionalToolOptions = [
  { label: "Work in Progress", value: "Work in Progress" },
  { label: "Under Review", value: "Under Review" },
  { label: "Ready to Print", value: "Ready to Print" },
  { label: "Production Ongoing", value: "Production Ongoing" },
  { label: "Production On Hold", value: "Production On Hold" },
];

export const marketingToolOptions = [
  { label: "Work in Progress", value: "Work in Progress" },
  { label: "Under Review", value: "Under Review" },
  { label: "Ready to Print", value: "Ready to Print" },
  { label: "Production Ongoing", value: "Production Ongoing" },
  { label: "Production On Hold", value: "Production On Hold" },
];

// Priority options
export const developmentPriorityOptions = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

// Filtered status options for specific use cases - colors inherited from base
export const pdStatusOptions = statusOptions.filter((o) =>
  [
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Cancelled",
    "Adopted",
  ].includes(o.value)
);

// ============================================================================
// DYNAMIC STATUS OPTIONS - Context-aware options
// ============================================================================

/**
 * Generate dynamic application development status options based on current project status
 * Shows only the next available rework status instead of all possible rework options
 * @param {Object} project - Current project data
 * @returns {Array} Status options with dynamic rework option
 */
export const getDynamicAppDevStatusOptions = (project) => {
  const baseOptions = statusOptions.filter((o) =>
    [
      "Not Started",
      "In Progress",
      "Completed",
      "Approved",
      "Paused",
      "Cancelled",
      "Adopted",
    ].includes(o.value)
  );

  // Get current application development status
  const currentStatus = project?.applicationLab?.developmentStatus;

  if (!currentStatus) {
    // No current status, include basic Rework option
    return [
      ...baseOptions,
      { label: "Rework", value: "Rework" }
    ];
  }

  // Helper function to extract rework number from status
  const extractReworkNumber = (status) => {
    if (!status || typeof status !== 'string') return 0;
    if (status === 'Rework') return 1;
    const match = status.match(/^Rework (\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const currentReworkNumber = extractReworkNumber(currentStatus);

  if (currentReworkNumber > 0) {
    // Current status is a rework status, show next rework number
    const nextReworkNumber = currentReworkNumber + 1;
    const nextReworkValue = nextReworkNumber === 1 ? 'Rework' : `Rework ${nextReworkNumber}`;
    const nextReworkLabel = nextReworkNumber === 1 ? 'Rework' : `Rework ${nextReworkNumber}`;

    return [
      ...baseOptions,
      { label: nextReworkLabel, value: nextReworkValue }
    ];
  } else {
    // Current status is not a rework status, show Rework as next option
    return [
      ...baseOptions,
      { label: "Rework", value: "Rework" }
    ];
  }
};

// ============================================================================
// LEGACY STATIC OPTIONS (Backward Compatibility)
// ============================================================================
// These are maintained for backward compatibility but should be migrated
// to use dynamic options where possible

export const appDevStatusOptions = statusOptions.filter((o) =>
  [
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
    "Cancelled",
    "Adopted",
  ].includes(o.value)
);

export const bdStatusOptions = statusOptions.filter((o) =>
  [
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Cancelled",
    "Adopted",
  ].includes(o.value)
);

export const promotionStatusOptions = statusOptions.filter((o) =>
  [
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Cancelled",
    "Adopted",
  ].includes(o.value)
);

export const productAppDevStatusOptions = statusOptions.filter((o) =>
  ["Not Started", "In Progress", "Completed", "Ready to Promote", "Rework", "Rework 2", "Rework 3", "Rework 4", "Rework 5", "Rework 6", "Rework 7", "Rework 8", "Rework 9", "Rework 10"].includes(
    o.value
  )
);

// SEGMENT OPTIONS -  
export const segmentOptions = [
  { label: "Flavors", value: "Flavors" },
  { label: "Colors", value: "Colors" },
  { label: "Ingredients", value: "Ingredients" },
  { label: "Seasonings", value: "Seasonings" },
];