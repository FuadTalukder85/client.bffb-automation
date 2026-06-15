/**
 * Status Configuration Factory
 * 
 * Industry-grade configuration system for managing status options across modules.
 * Each module can define its own status sets and optionally override colors.
 */

import { STATUS_COLOR_PALETTE } from "@/constants/statusColors";

/**
 * Default palette key mapping
 * Maps common status names to STATUS_COLOR_PALETTE keys
 */
const DEFAULT_PALETTE_MAPPING = {
  "Not Started": "NOT_STARTED",
  "In Progress": "IN_PROGRESS",
  "Completed": "COMPLETED",
  "Rework": "REWORK",
  "Approved": "APPROVED",
  "Paused": "PAUSED",
  "Cancelled": "CANCELLED",
  "Adopted": "ADOPTED",
  "Ready to Promote": "READY_TO_PROMOTE",
  "Good Enough": "GOOD_ENOUGH",
  "Lost": "CANCELLED",
  "Dropped": "DROPPED",
  "All": "ALL_STATUS",
  "all": "ALL_STATUS",
};

/**
 * Status configuration builder
 * Provides a fluent API for creating module-specific status configurations
 */
export class StatusConfigBuilder {
  constructor() {
    this.statuses = [];
  }

  /**
   * Add a status to the configuration
   * @param {string|Object} config - Status value as string or full config object
   * @param {Object} overrides - Manual overrides
   */
  addStatus(config, overrides = {}) {
    let value, label, paletteKey, bgColor, textColor;

    if (typeof config === "string") {
      value = config;
      label = config;
      paletteKey = DEFAULT_PALETTE_MAPPING[config] || config.toUpperCase().replace(/ /g, "_");
    } else {
      value = config.value;
      label = config.label || config.value;
      paletteKey = config.paletteKey || DEFAULT_PALETTE_MAPPING[config.value] || config.value.toUpperCase().replace(/ /g, "_");
      bgColor = config.bgColor;
      textColor = config.textColor;
    }

    // Apply overrides if provided
    if (overrides.label) label = overrides.label;
    if (overrides.paletteKey) paletteKey = overrides.paletteKey;
    if (overrides.bgColor) bgColor = overrides.bgColor;
    if (overrides.textColor) textColor = overrides.textColor;

    // Resolve colors from palette if not explicitly provided
    if (!bgColor || !textColor) {
      // Handle dynamic Rework palette mapping
      const lookupKey = paletteKey.startsWith('REWORK') ? 'REWORK' : paletteKey;
      const paletteEntry = STATUS_COLOR_PALETTE[lookupKey] || STATUS_COLOR_PALETTE.NOT_STARTED;
      bgColor = bgColor || paletteEntry.bgColor;
      textColor = textColor || paletteEntry.textColor;
    }

    this.statuses.push({
      value,
      label,
      bgColor,
      textColor,
    });

    return this;
  }

  /**
   * Add multiple statuses
   * @param {Array<string|Object>} statusList 
   */
  addMultiple(statusList) {
    statusList.forEach(status => this.addStatus(status));
    return this;
  }

  /**
   * Build the final configuration
   */
  build() {
    return this.statuses;
  }
}

export const createStatusConfig = () => new StatusConfigBuilder();

/**
 * Industry-grade status options builder
 * Supports complex configurations for different modules.
 * 
 * @param {Array<string|Object>} statusValues - Array of status values or config objects
 * @returns {Array<Object>} Enriched status options
 */
export const buildStatusOptions = (statusValues) => {
  const builder = createStatusConfig();
  builder.addMultiple(statusValues);
  return builder.build();
};

/**
 * Create filter options (includes "All" option)
 */
export const createFilterOptions = (statusOptions, allLabel = "All Status") => {
  const allOption = {
    label: allLabel,
    value: "all",
    bgColor: STATUS_COLOR_PALETTE.ALL_STATUS.bgColor,
    textColor: STATUS_COLOR_PALETTE.ALL_STATUS.textColor,
  };
  return [allOption, ...statusOptions];
};


/**
 * Predefined status sets for common use cases
 */

export const COMMON_STATUS_SETS = {
  // Full lifecycle statuses
  FULL_LIFECYCLE: [
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Cancelled",
    "Adopted",
  ],

  // Basic workflow statuses
  BASIC_WORKFLOW: [
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
  ],

  // Development statuses
  DEVELOPMENT: [
    "Not Started",
    "In Progress",
    "Completed",
    "Ready to Promote",
  ],

  // Review statuses
  REVIEW_WORKFLOW: [
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Cancelled",
  ],
};

export default {
  StatusConfigBuilder,
  createStatusConfig,
  buildStatusOptions,
  createFilterOptions,
  COMMON_STATUS_SETS,
};


