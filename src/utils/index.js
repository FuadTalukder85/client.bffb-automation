/**
 * Central exports for all utility functions used in the application.
 */

// Date utilities
export * from "./dateFormatter";

// Permission utilities
export * from "./projectPermissions";

// Color enrichment utilities - For adding colors to select options
export {
  enrichOptionWithColors,
  enrichOptionsWithColors,
  hasColorMetadata,
  getOptionColorStyle,
  enrichStatusOptions,
} from "./enrichOptionsWithColors";

// Number formatting utilities
export * from "./numberFormatter";

// HTML utilities
export * from "./htmlUtils";

// API error utilities
export * from "./apiError";
