/**
 * Application Lab Module - Status Configuration
 */

import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";
import { getDynamicAppDevStatusOptions } from "../../shared/constants/projectOptions";

/**
 * Status options for Application Lab
 * Application Lab uses development-specific statuses including Adopted and Dropped
 */

/**
 * Get dynamic application development status options based on current project status
 * @param {Object} project - Current project data
 * @returns {Array} Status options with dynamic rework option
 */
export const getAppDevStatusOptions = (project) => {
  return getDynamicAppDevStatusOptions(project);
};
export const applicationLabStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Completed",
  "Rework",
  "Approved",
  "Paused",
  "Cancelled",
  "Adopted",
]);

/**
 * Status filter options for Application Lab
 */
export const applicationLabStatusFilterOptions = createFilterOptions(
  applicationLabStatusOptions
);

export const applicationLabDetailStatusOptions = applicationLabStatusOptions;

/**
 * Development-specific status options
 */
export const appDevStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Completed",
  "Ready to Promote",
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
]);

// Re-export shared options
export {
  stateOptions,
  purposeOptions,
  objectiveOptions,
  approvalOptions,
  promotionalToolOptions,
  marketingToolOptions,
  developmentPriorityOptions,
  segmentOptions,
} from "../../shared/constants/projectOptions";

export const statusOptions = applicationLabStatusOptions;
export const pdStatusOptions = applicationLabStatusOptions;
export const sensoryStatusOptions = applicationLabStatusOptions;
export const bdStatusOptions = applicationLabStatusOptions;
export const promotionStatusOptions = applicationLabStatusOptions;

export default {
  applicationLabStatusOptions,
  applicationLabStatusFilterOptions,
  applicationLabDetailStatusOptions,
  appDevStatusOptions,
};

