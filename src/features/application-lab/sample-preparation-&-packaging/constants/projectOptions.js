/**
 * Sample Preparation & Packaging Module - Status Configuration
 * Uses centralized status configuration for consistency with Application Recipes
 */

import { buildStatusOptions as buildStatusConfig, createFilterOptions as createFilterConfig } from "@/config/statusConfig";

// Build status options using centralized config (same as Application Recipes)
const samplePreparationBaseStatuses = buildStatusConfig([
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Cancelled",
]);

// Main status filter options with colors for tabs (includes "All Status")
export const statusOptions = createFilterConfig(samplePreparationBaseStatuses, "All Status");

// Period filter options (Running/Previous/All)
export const periodOptions = [
    { label: "Running", value: "running" },
    { label: "Previous", value: "previous" },
    { label: "All", value: "all" },
];

// Individual status badge options
export const samplePreparationStatusOptions = samplePreparationBaseStatuses;

// Helper function to build status filter options
export const buildStatusOptions = () => statusOptions;

// Helper function to create filter options for SearchFilterBar
export const createFilterOptions = () => {
    return statusOptions.map(status => ({
        label: status.label,
        value: status.value
    }));
};
