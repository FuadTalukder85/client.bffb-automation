import {
  statusOptions,
  purposeOptions,
  pdStatusOptions,
  sensoryStatusOptions,
  bdStatusOptions,
  promotionStatusOptions,
  segmentOptions,
} from "./projectOptions";

export const projectFieldGroups = [
  // 1. Project Brief (Full Width)
  [
    {
      id: "brief",
      label: "Project Brief",
      type: "textarea",
      rows: 4,
      path: "masterProject.brief",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 2. BD or CRO Brief (Full Width)
  [
    {
      id: "bdOrCROBrief",
      label: "BD/CRO Brief",
      type: "textarea",
      rows: 4,
      path: "masterProject.bdOrCROBrief",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 3. Application Brief (Full Width)
  [
    {
      id: "applicationBrief",
      label: "Application Brief",
      type: "textarea",
      rows: 5,
      path: "applicationLab.brief",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 2. Status Group 1 (Row 1 - 3 columns)
  [
    {
      id: "pdStatus",
      label: "Product Development Status",
      type: "select",
      options: pdStatusOptions,
      path: "productDevelopment.status",
      canEdit: false,
    },
    {
      id: "appDevStatus",
      label: "Application Development Status",
      type: "select",
      asyncType: "dynamicAppDevStatus",
      path: "applicationLab.developmentStatus",
      canEdit: true,
    },
    {
      id: "sensoryStatus",
      label: "Sensory Status",
      type: "select",
      options: sensoryStatusOptions,
      path: "sensoryLab.status",
      canEdit: false,
    },
  ],

  // 3. Status Group 2 (Row 2 - 3 columns)
  [
    {
      id: "bdStatus",
      label: "Business Development Status",
      type: "select",
      options: bdStatusOptions,
      path: "businessDevelopment.status",
      canEdit: true,
    },
    {
      id: "projectStatus",
      label: "Project Status",
      type: "select",
      options: statusOptions,
      path: "masterProject.status",
      canEdit: false,
    },
    {
      id: "promotionStatus",
      label: "Promotion Status",
      type: "select",
      options: promotionStatusOptions,
      path: "businessDevelopment.promotionStatus",
      canEdit: false,
    },
  ],

  // 4. Dates Group 1 (Row 3 - 3 columns)
  [
    {
      id: "raisedDate",
      label: "Raised Date",
      type: "date",
      path: "masterProject.raisedDate",
      canEdit: false,
    },
    {
      id: "raisedBy",
      label: "Raised By",
      type: "text",
      path: "masterProject.raisedBy",
      canEdit: false,
    },
    {
      id: "purpose",
      label: "Purpose",
      type: "select",
      options: purposeOptions,
      path: "masterProject.purpose",
      canEdit: false,
    },
  ],

  // 5. Purpose & Objective Group (Row 4 - 3 columns)
  [
    {
      id: "purposeName",
      label: "Purpose Name",
      type: "text",
      path: "masterProject.purposeName",
      canEdit: false,
    },
    {
      id: "objective",
      label: "Objective",
      type: "text",
      path: "masterProject.objective",
      canEdit: false,
    },
    {
      id: "objectiveDetails",
      label: "Objective Details",
      type: "text",
      path: "masterProject.objectiveDetails",
      canEdit: false,
    },
  ],

  // 6. Project Info Group (Row 5 - 3 columns)
  [
    {
      id: "projectStartDate",
      label: "Project Start Date",
      type: "date",
      path: "masterProject.startDate",
      canEdit: false,
    },
    {
      id: "projectCode",
      label: "Project Code",
      type: "text",
      path: "masterProject.code",
      canEdit: false,
    },
    {
      id: "projectName",
      label: "Project Name",
      type: "text",
      path: "masterProject.title",
      canEdit: false,
    },
  ],

  // 7. Project End & Recipe Group (Row 6 - 3 columns)
  [
    {
      id: "projectEndDate",
      label: "Project End Date",
      type: "date",
      path: "masterProject.endDate",
      canEdit: false,
    },
    {
      id: "recipeCode",
      label: "Recipe Code",
      type: "text",
      path: "applicationLab.recipeCode",
      canEdit: true,
      placeholder: "Enter recipe code...",
    },
    {
      id: "applicationRecipeName",
      label: "Application Recipe Name",
      type: "asyncselect",
      asyncType: "recipe",
      path: "applicationLab.recipeName",
      canEdit: true,
      placeholder: "Search and select recipe...",
    },
  ],

  // 8. Application Category Group (Row 7 - 3 columns)
  [
    {
      id: "applicationCategory",
      label: "Application Category",
      type: "asyncselect",
      asyncType: "category",
      path: "applicationLab.category",
      canEdit: true,
      placeholder: "Search and select category...",
    },
    {
      id: "applicationSubcategory",
      label: "Application Subcategory",
      type: "asyncselect",
      asyncType: "subcategory",
      path: "applicationLab.subcategory",
      canEdit: true,
      placeholder: "Search and select subcategory...",
    },
    {
      id: "applicationSubSubcategory",
      label: "Application Sub-subcategory",
      type: "multiselectwithsearch",
      asyncType: "subsubcategory",
      path: "applicationLab.subSubcategory",
      canEdit: true,
      placeholder: "Search and select sub-subcategories...",
    },
  ],

  // 9. Application Tag & Segment Group (Row 8 - 3 columns)
  [
    {
      id: "applicationTag",
      label: "Application Tag",
      type: "multiselectwithsearch",
      asyncType: "tags",
      path: "applicationLab.tags",
      canEdit: true,
      placeholder: "Search and select tags...",
    },
    {
      id: "applicationDeadline",
      label: "Application Deadline",
      type: "date",
      path: "applicationLab.deadline",
      canEdit: true,
    },
    {
      id: "segment",
      label: "Segment",
      type: "select",
      options: segmentOptions,
      path: "common.segment",
      canEdit: false,
    },
  ],

  // 9a. Packaging Type Group (Row 8a - 1 column)
  [
    {
      id: "packagingType",
      label: "Packaging Type",
      type: "asyncselect",
      asyncType: "packagingType",
      path: "applicationLab.packagingType",
      canEdit: true,
      placeholder: "Search and select packaging type...",
    },
  ],

  // 10. Application Suggestions (Full Width)
  [
    {
      id: "applicationSuggestions",
      label: "Application Suggestions",
      type: "textarea",
      rows: 5,
      path: "applicationLab.suggestions",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 11. All BFF Products Used (Full Width)
  [
    {
      id: "allBffProducts",
      label: "All BFF Products Used (Codes)",
      type: "textarea",
      rows: 3,
      path: "common.productsUsed",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 12. Dates Group 2 (Row 9 - 3 columns)
  [
    {
      id: "applicationDate",
      label: "Application Date",
      type: "date",
      path: "applicationLab.date",
      canEdit: true,
    },
    {
      id: "sensoryApprovalDate",
      label: "Sensory Approval Date",
      type: "date",
      path: "sensoryLab.approvalDate",
      canEdit: false,
    },
    {
      id: "businessDevelopmentTasteDate",
      label: "Business Development Taste Date",
      type: "date",
      path: "businessDevelopment.tasteDate",
      canEdit: true,
    },
  ],

  // 13. Business Development Evaluation (Full Width)
  [
    {
      id: "businessDevelopmentEvaluation",
      label: "Business Development Evaluation",
      type: "textarea",
      rows: 5,
      path: "businessDevelopment.evaluation",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 14. Campaign Dates Group (Row 10 - 2 columns)
  [
    {
      id: "businessDevelopmentApprovalDate",
      label: "Business Development Approval Date",
      type: "date",
      path: "businessDevelopment.approvalDate",
      canEdit: false,
    },
    {
      id: "campaignStartingDate",
      label: "Campaign Starting Date",
      type: "date",
      path: "businessDevelopment.campaignStartDate",
      canEdit: false,
    },
  ],
];
