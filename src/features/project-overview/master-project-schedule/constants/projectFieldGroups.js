import {
  statusOptions,
  purposeOptions,
  pdStatusOptions,
  bdStatusOptions,
  sensoryStatusOptions,
  promotionStatusOptions,
  approvalOptions,
  segmentOptions,
} from "./projectOptions";

export const projectFieldGroups = [
  // 1. Project Brief (Full Width)
  [
    {
      id: "projectBrief",
      label: "Project Brief",
      type: "textarea",
      rows: 5,
      path: "masterProject.brief",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 2. Status Group 1 (Row 1 - 3 columns)
  [
    {
      id: "projectStatus",
      label: "Project Status",
      type: "select",
      options: statusOptions,
      path: "masterProject.status",
      canEdit: false,
    },
    {
      id: "sensoryStatus",
      label: "Sensory Status",
      type: "select",
      options: sensoryStatusOptions,
      path: "sensoryLab.status",
      canEdit: false,
    },
    {
      id: "bdStatus",
      label: "Business Development Status",
      type: "select",
      options: bdStatusOptions,
      path: "businessDevelopment.status",
      canEdit: false,
    },
  ],

  // 3. Status Group 2 (Row 2 - 3 columns)
  [
    {
      id: "promotionStatus",
      label: "Promotion Status",
      type: "select",
      options: promotionStatusOptions,
      path: "businessDevelopment.promotionStatus",
      canEdit: false,
    },
    {
      id: "pdStatus",
      label: "Product Development Status",
      type: "select",
      options: pdStatusOptions,
      path: "productDevelopment.status",
      canEdit: false,
    },
    {
      id: "raisedDate",
      label: "Raised Date",
      type: "date",
      path: "masterProject.raisedDate",
      canEdit: false,
    },
  ],

  // 4. Purpose & Details Group (Row 3 - 3 columns)
  [
    {
      id: "raisedBy",
      label: "Raised By",
      type: "text",
      path: "masterProject.raisedBy",
      canEdit: true,
    },
    {
      id: "purpose",
      label: "Purpose",
      type: "select",
      options: purposeOptions,
      path: "masterProject.purpose",
      canEdit: false,
    },
    {
      id: "purposeDetails",
      label: "Purpose Details",
      type: "text",
      path: "masterProject.purposeDetails",
      canEdit: false,
    },
  ],

  // 5. Objective Group (Row 4 - 3 columns)
  [
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
    {
      id: "projectStartDate",
      label: "Project Start Date",
      type: "date",
      path: "masterProject.startDate",
      canEdit: false,
    },
  ],

  // 6. Project Info Group (Row 5 - 3 columns)
  [
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
    {
      id: "projectEndDate",
      label: "Project End Date",
      type: "date",
      path: "masterProject.endDate",
      canEdit: false,
    },
  ],

  // 7. Product Development Remarks (Full Width)
  [
    {
      id: "pdRemarks",
      label: "Product Development Remarks",
      type: "textarea",
      rows: 5,
      path: "productDevelopment.remarks",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 8. Recipe & Application Group (Row 6 - 3 columns)
  [
    {
      id: "recipeCode",
      label: "Recipe Code",
      type: "text",
      path: "applicationLab.recipeCode",
      canEdit: false,
    },
    {
      id: "applicationRecipeName",
      label: "Application Recipe Name",
      type: "text",
      path: "applicationLab.recipeName",
      canEdit: false,
    },
    {
      id: "applicationCategory",
      label: "Application Category",
      type: "asyncselect",
      asyncType: "category",
      path: "applicationLab.category",
      canEdit: false,
      placeholder: "Search and select category...",
    },
  ],

  // 9. Category Group (Row 7 - 3 columns)
  [
    {
      id: "applicationSubcategory",
      label: "Application Subcategory",
      type: "asyncselect",
      asyncType: "subcategory",
      path: "applicationLab.subcategory",
      canEdit: false,
      placeholder: "Search and select subcategory...",
    },
    {
      id: "applicationSubSubcategory",
      label: "Application Sub-subcategory",
      type: "multiselectwithsearch",
      asyncType: "subsubcategory",
      path: "applicationLab.subSubcategory",
      canEdit: false,
      placeholder: "Search and select sub-subcategories...",
    },
    {
      id: "applicationTag",
      label: "Application Tag",
      type: "multiselectwithsearch",
      asyncType: "tags",
      path: "applicationLab.tags",
      canEdit: false,
      placeholder: "Search and select tags...",
    },
  ],

  // 10. Production Dates Group (Row 8 - 3 columns)
  [
    {
      id: "segment",
      label: "Segment",
      type: "select",
      options: segmentOptions,
      path: "common.segment",
      canEdit: false,
    },
    {
      id: "nextProductionDate",
      label: "Next Production Date",
      type: "date",
      path: "applicationLab.nextProductionDate",
      canEdit: true,
    },
    {
      id: "lastProductionDate",
      label: "Last Production Date",
      type: "date",
      path: "applicationLab.lastProductionDate",
      canEdit: true,
    },
  ],

  // 11. Sensory Dates Group (Row 9 - 3 columns)
  [
    {
      id: "approvalForSensory",
      label: "Approval for Sensory",
      type: "select",
      options: approvalOptions,
      path: "sensoryLab.approval",
      canEdit: false,
    },
    {
      id: "latestSensoryDate",
      label: "Latest Sensory Date",
      type: "date",
      path: "sensoryLab.latestDate",
      canEdit: true,
    },
    {
      id: "nextSensoryDate",
      label: "Next Sensory Date",
      type: "date",
      path: "sensoryLab.nextDate",
      canEdit: true,
    },
  ],

  // 12. Business Development Evaluation (Full Width)
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

  // 13. Final Dates Group (Row 10 - 2 columns)
  [
    {
      id: "businessDevelopmentApprovalDate",
      label: "Business Development Approval Date",
      type: "date",
      path: "businessDevelopment.approvalDate",
      canEdit: false,
    },
    {
      id: "clientSampleDeliveryDate",
      label: "Client Sample Delivery Date",
      type: "date",
      path: "businessDevelopment.clientSampleDeliveryDate",
      canEdit: false,
    },
  ],
];
