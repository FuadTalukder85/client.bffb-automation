// Re-export from shared constants
export {
  masterProjectStatusOptions,

  statusOptions,
  stateOptions,
  purposeOptions,
  objectiveOptions,
  approvalOptions,
  promotionalToolOptions,
  marketingToolOptions,
  developmentPriorityOptions,
  productDevelopmentStatusOptions as pdStatusOptions,
  productAppDevStatusOptions as appDevStatusOptions,
  sensoryLabStatusOptions,
  bdStatusOptions,
  promotionStatusOptions,
  segmentOptions,
} from "../../shared/constants/projectOptions";

// Sensory status options with colors (for filter dropdown)
export const sensoryStatusOptions = [
  { 
    value: "all", 
    label: "All Status",
    bgColor: "#F3D5FF",
    textColor: "#935CE3"
  },
  { 
    value: "Not Started", 
    label: "Not Started",
    bgColor: "#FFD2E5",
    textColor: "#D6005A"
  },
  { 
    value: "In Progress", 
    label: "In Progress",
    bgColor: "#D4DEFF",
    textColor: "#0039FF"
  },
  { 
    value: "Completed", 
    label: "Completed",
    bgColor: "#A5E3FF",
    textColor: "#006797"
  },
  { 
    value: "Rework", 
    label: "Rework",
    bgColor: "#FEEDBB",
    textColor: "#896700"
  },
  { 
    value: "Approved", 
    label: "Approved",
    bgColor: "#C6EACA",
    textColor: "#096812"
  },
  { 
    value: "Paused", 
    label: "Paused",
    bgColor: "#FFD7C9",
    textColor: "#E33A00"
  },
  { 
    value: "Cancelled", 
    label: "Cancelled",
    bgColor: "#FFD5D5",
    textColor: "#E80000"
  },
  { 
    value: "Adopted", 
    label: "Adopted",
    bgColor: "#AAFFB3",
    textColor: "#006209"
  },
];

export const sensoryStatusFilterOptions = sensoryStatusOptions;
