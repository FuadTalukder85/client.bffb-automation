// Product Development Field Configuration

// Status options (matching MasterProjectDetails format)
const statusOptions = [
    { label: "Not Started", value: "Not Started" },
    { label: "In Progress", value: "In Progress" },
    { label: "Approved", value: "Approved" },
    { label: "Rework", value: "Rework" },
    { label: "Rework 2", value: "Rework 2" },
    { label: "Rework 3", value: "Rework 3" },
    { label: "Rework 4", value: "Rework 4" },
    { label: "Rework 5", value: "Rework 5" },
    { label: "Rework 6", value: "Rework 6" },
    { label: "Rework 7", value: "Rework 7" },
    { label: "Rework 8", value: "Rework 8" },
    { label: "Rework 9", value: "Rework 9" },
    { label: "Rework 10", value: "Rework 10" },
    { label: "Completed", value: "Completed" },
];

const purposeOptions = [
    { label: "Campaign", value: "Campaign" },
    { label: "Product Launch", value: "Product Launch" },
    { label: "Research", value: "Research" },
    { label: "Other", value: "Other" },
];

const pdStatusOptions = statusOptions.filter(o => ['Not Started', 'In Progress', 'Approved', 'Rework'].includes(o.value));
const appDevStatusOptions = statusOptions;
const sensoryStatusOptions = statusOptions.filter(o => ['Not Started', 'In Progress', 'Completed', 'Rework', 'Approved'].includes(o.value));
const bdStatusOptions = statusOptions.filter(o => ['Not Started', 'In Progress', 'Completed', 'Rework'].includes(o.value));

export const productDevelopmentFieldGroups = [
    // 1. PD Brief (FW TA)
    [
        { id: "pdBrief", label: "PD brief", type: "textarea", rows: 5, path: "productDevelopment.brief", canEdit: true, fullWidth: true },
    ],

    // 2. Statuses and Project Info
    [
        { id: "pdStatus", label: "PD status", type: "select", options: pdStatusOptions, path: "productDevelopment.status", canEdit: true },
        { id: "adStatus", label: "AD status", type: "select", options: appDevStatusOptions, path: "applicationLab.developmentStatus", canEdit: false },
        { id: "sensoryStatus", label: "Sensory status", type: "select", options: sensoryStatusOptions, path: "sensoryLab.status", canEdit: false },
    ],
    [
        { id: "bdStatus", label: "BD status", type: "select", options: bdStatusOptions, path: "businessDevelopment.status", canEdit: false },
        { id: "projectStatus", label: "Project status", type: "select", options: statusOptions, path: "masterProject.status", canEdit: false },
        { id: "raisedDate", label: "raised date", type: "date", path: "masterProject.raisedDate", canEdit: false },
    ],
    [
        { id: "raisedBy", label: "raised by", type: "text", path: "masterProject.raisedBy", canEdit: false },
        { id: "purpose", label: "purpose", type: "select", options: purposeOptions, path: "masterProject.purpose", canEdit: false },
        { id: "purposeDetails", label: "purpose details", type: "text", path: "masterProject.purposeDetails", canEdit: false },
    ],
    [
        { id: "objective", label: "objective", type: "text", path: "masterProject.objective", canEdit: false },
        { id: "objectiveDetails", label: "objective details", type: "text", path: "masterProject.objectiveDetails", canEdit: false },
        { id: "projectStartDate", label: "project start date", type: "date", path: "masterProject.startDate", canEdit: false },
    ],
    [
        { id: "projectCode", label: "project code", type: "text", path: "masterProject.code", canEdit: false },
        { id: "projectName", label: "project name", type: "text", path: "masterProject.title", canEdit: false },
        { id: "projectEndDate", label: "project end date", type: "date", path: "masterProject.endDate", canEdit: false },
    ],

    // 3. Product Development Deadline
    [
        { id: "pdDeadline", label: "product development deadline", type: "date", path: "productDevelopment.deadline", canEdit: true },
    ],

    // 4. PD Remarks (FW TA)
    [
        { id: "pdRemarks", label: "PD Remarks", type: "textarea", rows: 5, path: "productDevelopment.remarks", canEdit: true, fullWidth: true },
    ],

    // 5. Application Details
    [
        { id: "productAppliedTo", label: "product applied to", type: "text", path: "applicationLab.productAppliedTo", canEdit: true },
        { id: "recipeCode", label: "Recipe Code", type: "text", path: "applicationLab.recipeCode", canEdit: false },
        { id: "applicationRecipeName", label: "Application Recipe Name", type: "text", path: "applicationLab.recipeName", canEdit: false },
    ],
    [
        { id: "applicationCategory", label: "Application Category", type: "text", path: "applicationLab.category", canEdit: false },
        { id: "applicationSubcat", label: "Application Subcat", type: "text", path: "applicationLab.subcategory", canEdit: false },
        { id: "applicationSubSubCat", label: "Application sub sub cat", type: "text", path: "applicationLab.subSubcategory", canEdit: false },
    ],
    [
        { id: "applicationTag", label: "application tag", type: "text", path: "applicationLab.tags", canEdit: false },
        { id: "segment", label: "segment", type: "text", path: "common.segment", canEdit: false },
    ],

    // 6. All BFF Product Code Used (FW TA)
    [
        { id: "allBffProductCodeUsed", label: "All BFF Product code used", type: "textarea", rows: 5, path: "common.productsUsed", canEdit: false, fullWidth: true },
    ],

    // 7. Sensory Approval Date
    [
        { id: "sensoryApprovalDate", label: "sensory approval date", type: "date", path: "sensoryLab.approvalDate", canEdit: false },
    ],

    // 8. BD Evaluation (FW TA)
    [
        { id: "bdEvaluation", label: "BD evaluation", type: "textarea", rows: 5, path: "businessDevelopment.evaluation", canEdit: false, fullWidth: true },
    ],

    // 9. BD Approval Date
    [
        { id: "bdApprovalDate", label: "BD Approval date", type: "date", path: "businessDevelopment.approvalDate", canEdit: false },
    ],
];