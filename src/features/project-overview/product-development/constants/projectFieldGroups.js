import {
    statusOptions,
    purposeOptions,
    pdStatusOptions,
    appDevStatusOptions,
    sensoryStatusOptions,
    bdStatusOptions,
    promotionStatusOptions,
    segmentOptions,
} from "./projectOptions";

export const projectFieldGroups = [
    // 1. Project Brief
    [
        { id: "projectBrief", label: "Product Development Brief", type: "textarea", rows: 5, path: "productDevelopment.brief", canEdit: true, fullWidth: true },
    ],

    // 2. Statuses
    [
        { id: "pdStatus", label: "Product Development Status", type: "select", options: pdStatusOptions, path: "productDevelopment.status", canEdit: true },
        { id: "adStatus", label: "Application Development Status", type: "select", options: appDevStatusOptions, path: "applicationLab.developmentStatus", canEdit: false },
        { id: "sensoryStatus", label: "Sensory Status", type: "select", options: sensoryStatusOptions, path: "sensoryLab.status", canEdit: false },
    ],
    [
        { id: "bdStatus", label: "Business Development Status", type: "select", options: bdStatusOptions, path: "businessDevelopment.status", canEdit: false },
        { id: "projectStatus", label: "Project Status", type: "select", options: statusOptions, path: "masterProject.status", canEdit: false },
        { id: "promotionStatus", label: "Promotion Status", type: "select", options: promotionStatusOptions, path: "masterProject.promotionStatus", canEdit: false },
    ],

    // 3. Project Information
    [
        { id: "raisedDate", label: "Raised Date", type: "date", path: "masterProject.raisedDate", canEdit: false },
        { id: "raisedBy", label: "Raised By", type: "text", path: "masterProject.raisedBy", canEdit: false },
        { id: "purpose", label: "Purpose", type: "select", options: purposeOptions, path: "masterProject.purpose", canEdit: false },
    ],
    [
        { id: "purposeName", label: "Purpose Name", type: "text", path: "masterProject.purposeDetails", canEdit: false },
        { id: "objective", label: "Objective", type: "text", path: "masterProject.objective", canEdit: false },
        { id: "objectiveDetails", label: "Objective Details", type: "text", path: "masterProject.objectiveDetails", canEdit: false },
    ],
    [
        { id: "projectStartDate", label: "Project Start Date", type: "date", path: "masterProject.startDate", canEdit: false },
        { id: "projectCode", label: "Project Code", type: "text", path: "masterProject.code", canEdit: false },
        { id: "projectName", label: "Project Name", type: "text", path: "masterProject.title", canEdit: false },
    ],
    [
        { id: "projectEndDate", label: "Project End Date", type: "date", path: "masterProject.endDate", canEdit: false },
    ],

    // 4. Product Development Deadline
    [
        { id: "pdDeadline", label: "Product Development Deadline", type: "date", path: "productDevelopment.deadline", canEdit: true },
    ],

    // 5. Product Development Remarks
    [
        { id: "pdRemarks", label: "Product Development Remarks", type: "textarea", rows: 5, path: "productDevelopment.remarks", canEdit: true, fullWidth: true },
    ],

    // 6. Application Details
    [
        { id: "productAppliedTo", label: "Product Applied To", type: "text", path: "applicationLab.productAppliedTo", canEdit: true },
        { id: "recipeCode", label: "Recipe Code", type: "text", path: "applicationLab.recipeCode", canEdit: false },
        { id: "applicationRecipeName", label: "Application Recipe Name", type: "text", path: "applicationLab.recipeName", canEdit: false },
    ],
    [
        { id: "applicationCategory", label: "Application Category", type: "asyncselect", asyncType: "category", path: "applicationLab.category", canEdit: false, placeholder: "Search and select category..." },
        { id: "applicationSubcategory", label: "Application Subcategory", type: "asyncselect", asyncType: "subcategory", path: "applicationLab.subcategory", canEdit: false, placeholder: "Search and select subcategory..." },
        { id: "applicationSubSubcategory", label: "Application Sub-subcategory", type: "asyncselect", asyncType: "subsubcategory", path: "applicationLab.subSubcategory", canEdit: false, placeholder: "Search and select sub-subcategory..." },
    ],
    [
        { id: "applicationTag", label: "Application Tag", type: "multiselectwithsearch", asyncType: "tags", path: "applicationLab.tags", canEdit: false, placeholder: "Search and select tags..." },
        { id: "segment", label: "Segment", type: "select", options: segmentOptions, path: "common.segment", canEdit: false },
    ],

    // 7. All BFF Products Used (Codes)
    [
        { id: "allBffProductsUsed", label: "All BFF Products Used (Codes)", type: "textarea", rows: 5, path: "common.productsUsed", canEdit: false, fullWidth: true },
    ],

    // 8. Business Development Evaluation
    [
        { id: "bdEvaluation", label: "Business Development Evaluation", type: "textarea", rows: 5, path: "businessDevelopment.evaluation", canEdit: false, fullWidth: true },
    ],

    // 9. Approval Dates
    [
        { id: "sensoryApprovalDate", label: "Sensory Approval Date", type: "date", path: "sensoryLab.approvalDate", canEdit: false },
        { id: "bdApprovalDate", label: "Business Development Approval Date", type: "date", path: "businessDevelopment.approvalDate", canEdit: false },
    ],
];