// Re-export from shared constants
import { productDevelopmentStatusOptions } from "../../shared/constants/projectOptions";
import { createFilterOptions } from "@/config/statusConfig";

export {
  statusOptions,
  // productDevelopmentStatusOptions, // removed since imported above
  stateOptions,
  purposeOptions,
  developmentPriorityOptions,
  pdStatusOptions,
  productAppDevStatusOptions as appDevStatusOptions,
  sensoryLabStatusOptions as sensoryStatusOptions,
  bdStatusOptions,
  promotionStatusOptions,
  segmentOptions,
} from "../../shared/constants/projectOptions";

// Create filter options with "All"
export const productDevelopmentStatusFilterOptions = createFilterOptions(productDevelopmentStatusOptions);
