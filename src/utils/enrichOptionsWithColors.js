import { STATUS_COLOR_PALETTE } from "@/constants/statusColors";

/**
 * Normalizes status values to palette keys
 */
const STATUS_TO_PALETTE_MAP = {
  "Not Started": "NOT_STARTED",
  "In Progress": "IN_PROGRESS",
  "Completed": "COMPLETED",
  "Rework": "REWORK",
  "Approved": "APPROVED",
  "Paused": "PAUSED",
  "Cancelled": "CANCELLED",
  "Lost": "CANCELLED",
  "Adopted": "ADOPTED",
  "All": "ALL_STATUS",
  "all": "ALL_STATUS",
};

/**
 * Enrich a single option with color metadata
 */
export const enrichOptionWithColors = (option) => {
  if (!option) return option;
  
  // If already has colors, return as-is
  if (option.bgColor && option.textColor) {
    return option;
  }

  const paletteKey = STATUS_TO_PALETTE_MAP[option.value] || 
                     STATUS_TO_PALETTE_MAP[option.label] || 
                     String(option.value).toUpperCase().replace(/ /g, "_");
  
  const paletteEntry = STATUS_COLOR_PALETTE[paletteKey] || STATUS_COLOR_PALETTE.NOT_STARTED;

  return {
    ...option,
    bgColor: paletteEntry.bgColor,
    textColor: paletteEntry.textColor,
  };
};

/**
 * Enrich an array of options
 */
export const enrichOptionsWithColors = (options) => {
  if (!Array.isArray(options)) return options;
  return options.map(enrichOptionWithColors);
};

export const hasColorMetadata = (option) => {
  return Boolean(option?.bgColor && option?.textColor);
};

export const getOptionColorStyle = (option) => {
  if (!hasColorMetadata(option)) return {};
  return {
    backgroundColor: option.bgColor,
    color: option.textColor,
  };
};

/**
 * Compatibility export
 */
export const enrichStatusOptions = (options) => enrichOptionsWithColors(options);

export default {
  enrichOptionWithColors,
  enrichOptionsWithColors,
  hasColorMetadata,
  getOptionColorStyle,
  enrichStatusOptions,
};

