import {
    purposeOptions,
    developmentPriorityOptions,
    masterProjectDetailStatusOptions as statusOptions,
    clientStatusOptions,
    shelfLifeStatusOptions,
    trialStatusOptions,
} from "./projectOptions";
import { marketingToolOptions, applicationLabDetailStatusOptions as pdStatusOptions, promotionalToolOptions } from "../../application-lab/constants/projectOptions";
import { segmentOptions } from "../../shared/constants";

// Use applicationLabDetailStatusOptions for all these since they were sharing the same options
const appDevStatusOptions = pdStatusOptions;
const sensoryStatusOptions = pdStatusOptions;
const bdStatusOptions = pdStatusOptions;
const promotionStatusOptions = pdStatusOptions;

export const projectFieldGroups = [
    // 1. Project Brief (FW TA)
    [
        { id: "brief", label: "Project Brief", type: "textarea", rows: 4, path: "masterProject.brief", canEdit: true, fullWidth: true },
    ],

    // 2. BD or CRO Brief
    [
        { id: "bdOrCROBrief", label: "BD/CRO Brief", type: "textarea", rows: 4, path: "masterProject.bdOrCROBrief", canEdit: true, fullWidth: true },
    ],

    // 2.5. New Fields: Client Status, Shelf Life Status, Trial Status & Approved Recipes
    [
        { id: "clientStatus", label: "Client Status", type: "select", options: clientStatusOptions, path: "masterProject.clientStatus", canEdit: true },
        { id: "shelfLifeStatus", label: "Shelf Life Status", type: "select", options: shelfLifeStatusOptions, path: "masterProject.shelfLifeStatus", canEdit: false },
        { id: "trialStatus", label: "Trial Status", type: "select", options: trialStatusOptions, path: "masterProject.trialStatus", canEdit: true },
    ],

    // 3. Statuses Group 1 (max 3)
    [
        { id: "pdStatus", label: "Product Development Status", type: "select", options: pdStatusOptions, path: "productDevelopment.status", canEdit: true },
        { id: "appDevStatus", label: "Application Development Status", type: "select", options: appDevStatusOptions, path: "applicationLab.developmentStatus", canEdit: false },
        { id: "sensoryStatus", label: "Sensory Lab Status", type: "select", options: sensoryStatusOptions, path: "sensoryLab.status", canEdit: false },
    ],

    // 4. Statuses Group 2 (max 3)
    [
        { id: "bdStatus", label: "Business Development Status", type: "select", options: bdStatusOptions, path: "businessDevelopment.status", canEdit: false },
        { id: "mpStatus", label: "Project Status", type: "select", asyncType: "dynamicMasterProjectStatus", path: "masterProject.status", canEdit: true },
        { id: "promotionStatus", label: "Promotion Status", type: "select", options: promotionStatusOptions, path: "businessDevelopment.promotionStatus", canEdit: true },
    ],

    // 5. Research & Assignment Group (max 3)
    [
        { id: "researchAnalysis", label: "Research and Analysis", type: "text", path: "masterProject.researchAnalysis", canEdit: true },
        { id: "researchTopic", label: "Research Topic", type: "text", path: "masterProject.researchTopic", canEdit: true },
        { id: "assignedTo", label: "Assigned To", type: "userselect", path: "masterProject.assignedTo", canEdit: true, placeholder: "Select user..." },
    ],

    // 6. Dates Group 1 (max 3)
    [
        { id: "assignedDate", label: "Assigned Date", type: "date", path: "masterProject.assignedDate", canEdit: true },
        { id: "ideaPresentedDate", label: "Idea Presented Date", type: "date", path: "masterProject.ideaPresentedDate", canEdit: true },
        { id: "raisedDate", label: "Raised Date", type: "date", path: "masterProject.raisedDate", canEdit: true },
    ],

    // 7. Purpose Group (max 3)
    [
        { id: "raisedBy", label: "Raised By", type: "text", path: "masterProject.raisedBy", canEdit: true },
        { id: "purpose", label: "Purpose", type: "select", options: purposeOptions, path: "masterProject.purpose", canEdit: true },
        { id: "purposeDetails", label: "Purpose Details", type: "text", path: "masterProject.purposeDetails", canEdit: true },
    ],

    // 8. Objective Group (max 3)
    [
        { id: "objective", label: "Objective", type: "text", path: "masterProject.objective", canEdit: true },
        { id: "objectiveDetails", label: "Objective Details", type: "text", path: "masterProject.objectiveDetails", canEdit: true },
        { id: "startDate", label: "Project Start Date", type: "date", path: "masterProject.startDate", canEdit: true },
    ],

    // 9. Project Info Group (max 3)
    [
        { id: "projectCode", label: "Project Code", type: "text", path: "masterProject.code", canEdit: false },
        { id: "projectName", label: "Project Name", type: "text", path: "masterProject.title", canEdit: true },
        { id: "deadline", label: "Project Deadline", type: "date", path: "masterProject.deadline", canEdit: true },
    ],

    // 10. Project End & Recipe Group (max 3)
    [
        { id: "endDate", label: "Project End Date", type: "date", path: "masterProject.endDate", canEdit: true },
        { id: "recipeCode", label: "Recipe Code", type: "text", path: "applicationLab.recipeCode", canEdit: false },
        { id: "recipeName", label: "Application Recipe Name", type: "text", path: "applicationLab.recipeName", canEdit: false },
    ],

    // 11. Application Category Group (max 3)
    [
        { id: "applicationCategory", label: "Application Category", type: "asyncselect", asyncType: "category", path: "applicationLab.category", canEdit: true, placeholder: "Search and select category..." },
        { id: "applicationSubcategory", label: "Application Subcategory", type: "asyncselect", asyncType: "subcategory", path: "applicationLab.subcategory", canEdit: true, placeholder: "Search and select subcategory..." },
        { id: "applicationSubSubcategory", label: "Application Sub-Subcategory", type: "asyncselect", asyncType: "subsubcategory", path: "applicationLab.subSubcategory", canEdit: true, placeholder: "Search and select sub-subcategory..." },

    ],

    // 12. Application Tag & Product Group (max 3)
    [
        { id: "applicationTag", label: "Application Tag", type: "multiselectwithsearch", asyncType: "tags", path: "applicationLab.tags", canEdit: true, placeholder: "Search and select tags..." },
        // { id: "application", label: "Application", type: "text", path: "applicationLab.productAppliedTo", canEdit: true },
        { id: "segment", label: "Segment", type: "multiselectwithsearch", options: segmentOptions, path: "common.segment", canEdit: true },

    ],

    // 13. Application Suggestions (FW TA X)
    [
        { id: "applicationSuggestions", label: "Application Suggestions", type: "textarea", rows: 5, path: "applicationLab.suggestions", canEdit: false, fullWidth: true },
    ],

    // 14. All BFF Product Used (FW TA)
    [
        { id: "productsUsed", label: "All BFF Product Used", type: "multiselectwithsearch", asyncType: "bffAllProductCodes", path: "common.productsUsed", canEdit: true, placeholder: "Search and select BFF product codes...", fullWidth: true },
    ],

    // 15. BFF Flavor (FW TA)
    [
        { id: "flavorProfile", label: "BFF Flavor (Body + Coat + Filling) ", type: "multiselectwithsearch", asyncType: "bffAllProductCodes", path: "common.flavorProfile", canEdit: true, placeholder: "Search and select flavors...", fullWidth: true },
    ],

    // 16. Coating/Filling/Color Group (max 3)
    [
        { id: "upperLayer", label: "Coating/Upper Layer", type: "multiselectwithsearch", asyncType: "bffAllProductCodes", path: "common.coatingUpperLayer", canEdit: true, placeholder: "Search and select BFF product code..." },
        { id: "filling", label: "Filling", type: "multiselectwithsearch", asyncType: "bffAllProductCodes", path: "common.filling", canEdit: true, placeholder: "Search and select BFF product code..." },
        { id: "bffColor", label: "BFF Color", type: "multiselectwithsearch", asyncType: "bffColor", path: "common.color", canEdit: true, placeholder: "Search and select colors..." },
    ],

    // 17. Ingredients & Brand Group (max 3)
    [
        { id: "bffIngredients", label: "BFF Ingredients", type: "multiselectwithsearch", asyncType: "bffAllProductCodes", path: "common.ingredients", canEdit: true, placeholder: "Search and select ingredients..." },
        { id: "brand", label: "Brand", type: "text", path: "common.brand", canEdit: true },
    ],

    // 18. Shelf Life (FW TA X)
    [
        { id: "shelfLife", label: "Shelf Life", type: "textarea", rows: 5, path: "common.shelfLife", canEdit: false, fullWidth: true },
    ],

    // 19. Costing/Shape/Texture Group (max 3)
    [
        { id: "costing", label: "Target Costing", type: "text", path: "common.costing", canEdit: true },
        { id: "shape", label: "Shape", type: "text", path: "common.shape", canEdit: true },
        { id: "texture", label: "Texture", type: "text", path: "common.texture", canEdit: true },
    ],

    // 20. Machine/Benchmark/Link Group (max 3)
    [
        { id: "machineRequirements", label: "Machine Requirements", type: "text", path: "common.machineRequirement", canEdit: true },
        { id: "benchmark", label: "Benchmark", type: "text", path: "common.benchmark", canEdit: true },
        { id: "link", label: "Link", type: "text", path: "common.link", canEdit: true },
    ],

    // 21. Trend/Priority/Development Group (max 3)
    [
        { id: "trend", label: "Trend", type: "text", path: "common.trend", canEdit: true },
        { id: "developmentPriority", label: "Development Priority", type: "select", options: developmentPriorityOptions, path: "common.developmentPriority", canEdit: true },
        { id: "selectedForDevelopment", label: "Selected For Development", type: "select", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }], path: "common.selectedForDevelopment", canEdit: true },
    ],

    // 22. Application Date/Sensory Group (max 3)
    [
        { id: "applicationDate", label: "Application Date", type: "date", path: "applicationLab.date", canEdit: false },
        { id: "sensoryApproval", label: "Approval for Sensory", type: "select", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }], path: "sensoryLab.approval", canEdit: true },
        { id: "sensoryDeadline", label: "Sensory Deadline", type: "date", path: "sensoryLab.deadline", canEdit: true },
    ],

    // 23. Approval Dates/Promotion Group (max 3)
    [
        { id: "sensoryApprovalDate", label: "Sensory Approval Date", type: "date", path: "sensoryLab.approvalDate", canEdit: false },
        { id: "bdApprovalDate", label: "BD Approval Date", type: "date", path: "businessDevelopment.approvalDate", canEdit: true },
        { id: "selectedForPromotion", label: "Selected For Promotion", type: "select", options: [{ value: true, label: "Yes" }, { value: false, label: "No" }], path: "businessDevelopment.selectedForPromotion", canEdit: true },
    ],

    // 24. Marketing/Promotion/Campaign Group (max 3)
    [
        { id: "marketingTool", label: "Marketing Tool", type: "select", options: marketingToolOptions, path: "businessDevelopment.marketingTool", canEdit: true },
        { id: "promotionalTool", label: "Promotional Tool", type: "select", options: promotionalToolOptions, path: "businessDevelopment.promotionalTool", canEdit: true },
        { id: "campaignStartDate", label: "Campaign Start Date", type: "date", path: "businessDevelopment.campaignStartDate", canEdit: true },
    ],

    // 25. Client Sample Delivery Date (max 3)
    [
        { id: "clientSampleDeliveryDate", label: "Client Sample Delivery Date", type: "date", path: "businessDevelopment.clientSampleDeliveryDate", canEdit: false },
        { id: "approvedRecipesCount", label: "Approved Recipes Count", type: "number", path: "masterProject.approvedRecipesCount", canEdit: false },
    ],
];
