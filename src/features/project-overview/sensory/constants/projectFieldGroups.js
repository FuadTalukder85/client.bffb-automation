import {
  statusOptions,
  purposeOptions,
  pdStatusOptions,
  appDevStatusOptions,
  sensoryLabStatusOptions,
  bdStatusOptions,
  segmentOptions,
} from "./projectOptions";

export const projectFieldGroups = [
  // 1. Status Group 1 (Row 1 - 3 columns)
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
      options: appDevStatusOptions,
      path: "applicationLab.developmentStatus",
      canEdit: false,
    },
    {
      id: "sensoryStatus",
      label: "Sensory Status",
      type: "select",
      options: sensoryLabStatusOptions,
      path: "sensoryLab.status",
      canEdit: true,
    },
  ],

  // 2. Status Group 2 (Row 2 - 3 columns)
  [
    {
      id: "bdStatus",
      label: "Business Development Status",
      type: "select",
      options: bdStatusOptions,
      path: "businessDevelopment.status",
      canEdit: false,
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
      id: "raisedDate",
      label: "Raised Date",
      type: "date",
      path: "masterProject.raisedDate",
      canEdit: false,
    },
  ],

  // 3. Purpose & Details Group (Row 3 - 3 columns)
  [
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
    {
      id: "purposeName",
      label: "Purpose Name",
      type: "text",
      path: "masterProject.purposeName",
      canEdit: false,
    },
  ],

  // 4. Objective Group (Row 4 - 3 columns)
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

  // 5. Project Info Group (Row 5 - 3 columns)
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

  // 6. Recipe & Application Group (Row 6 - 3 columns)
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

  // 7. Category Group (Row 7 - 3 columns)
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
      type: "asyncselect",
      asyncType: "subsubcategory",
      path: "applicationLab.subSubcategory",
      canEdit: false,
      placeholder: "Search and select sub-subcategory...",
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

  // 8. Segment & Deadline Group (Row 8 - 3 columns)
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
      id: "sensoryDeadline",
      label: "Sensory Deadline",
      type: "date",
      path: "sensoryLab.deadline",
      canEdit: true,
    },
    {
      id: "latestSensoryDeadline",
      label: "Latest Sensory Deadline",
      type: "date",
      path: "sensoryLab.latestDeadline",
      canEdit: false,
    },
  ],

  // 9. Sensory Evaluation (Full Width)
  [
    {
      id: "sensoryEvaluation",
      label: "Sensory Evaluation",
      type: "textarea",
      rows: 5,
      path: "sensoryLab.evaluation",
      canEdit: true,
      fullWidth: true,
    },
  ],

  // 10. Approval Dates Group (Row 9 - 2 columns)
  [
    {
      id: "sensoryApprovalDate",
      label: "Sensory Approval Date",
      type: "date",
      path: "sensoryLab.approvalDate",
      canEdit: true,
    },
    {
      id: "businessDevelopmentApprovalDate",
      label: "Business Development Approval Date",
      type: "date",
      path: "businessDevelopment.approvalDate",
      canEdit: false,
    },
  ],

  // 11. Client Feedback (Full Width)
  [
    {
      id: "clientFeedback",
      label: "Client Feedback",
      type: "textarea",
      rows: 5,
      path: "sensoryLab.clientFeedback",
      canEdit: true,
      fullWidth: true,
    },
  ],
];
