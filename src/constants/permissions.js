/**
 * Permission System - Single Source of Truth (Client)
 * 
 * This file mirrors the server-side permission constants.
 * Keep in sync with: server/src/constants/permissions.js
 * 
 * NAMING CONVENTION (ENFORCED):
 * - Resources: kebab-case (e.g., 'project', 'bff-product', 'internal-task')
 * - Actions: lowercase (e.g., 'read', 'create', 'update', 'delete')
 * - Sections: camelCase (e.g., 'masterProject', 'applicationLab')
 * - Fields: dot notation camelCase (e.g., 'masterProject.code')
 * - Groups: @camelCase (e.g., '@basic', '@technical')
 * 
 * FORMAT:
 * - Resource level: resource:action (e.g., 'project:read')
 * - Wildcard: resource:* (e.g., 'project:*')
 * - Section level: resource:action:section (e.g., 'project:read:masterProject')
 * - Field level: resource:action:section.field (e.g., 'project:read:masterProject.code')
 * - Group level: resource:action:@group (e.g., 'project:read:@basic')
 * 
 * HIERARCHY (permission inheritance):
 * resource:* > resource:action > resource:action:@group > resource:action:section > resource:action:section.field
 */

// ============================================================================
// RESOURCES - All available resources in the system
// ============================================================================
export const RESOURCES = {
  DASHBOARD: 'dashboard',
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  PROJECT: 'project',
  TASK: 'task',
  PROJECT_TASK: 'project-task',
  INTERNAL_TASK: 'internal-task',
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory',
  SUBSUBCATEGORY: 'subsubcategory',
  RECIPE: 'recipe',
  BFF_PRODUCT: 'bff-product',
  BFF_PRODUCT_SEGMENT: 'bff-product-segment',
  SENSORY_EVALUATION: 'sensory-evaluation',
  SENSORY_FORM: 'sensory-form',
  SENSORY_TOP_SHEET: 'sensory-top-sheet',
  INVITATION: 'invitation',
  TEAM: 'team',
  APPLICATION_TAG: 'application-tag',
  RAW_MATERIAL: 'raw-material',
  PACKAGING_TYPE: 'packaging-type',
  SAMPLE: 'sample',
  PRODUCTION_SCHEDULE: 'production-schedule',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  DISPATCH: 'dispatch',
  SHELF_LIFE_TESTING: 'shelf-life-testing',
  AUDIT: 'audit',
  PROJECT_MEMBER: 'project-member',
};

// ============================================================================
// ACTIONS - Standard CRUD actions plus custom actions
// ============================================================================
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  UNBLOCK: 'unblock',
  UPDATE_PASSWORD: 'update-password',
  DELETE: 'delete',
  MANAGE: '*',
  IMPORT: 'import',
  EXPORT: 'export',
  EXPORT_PDF: 'export-pdf',
  EXPORT_APPLICATION_RECIPE: 'export-application-recipe',
  EXPORT_FINAL_RECIPES: 'export-final-recipes',
  EXPORT_IN_DEVELOPMENT_RECIPES: 'export-in-development-recipes',
  EXPORT_TEST_RECORDS: 'export-test-records',
  EXPORT_MONITORING_HISTORY: 'export-monitoring-history',
  REASSIGN: 'reassign',
  MANAGE_MEMBERS: 'manage-members',
  MANAGE_RECURRING: 'manage-recurring',
  VIEW: 'view',
  ADD: 'add',
  REMOVE: 'remove',
  VIEW_ALL_SAMPLE_PROJECTS: 'view-all-sample-projects',
  VIEW_ALL_TEST_RECORD_PROJECTS: 'view-all-test-record-projects',
  VIEW_ALL_MANAGE_RECIPE_PROJECTS: 'view-all-manage-recipe-projects',
  VIEW_ALL_SENSORY_FORM_PROJECTS: 'view-all-sensory-form-projects',
  VIEW_ALL_SENSORY_TOP_SHEET_PROJECTS: 'view-all-sensory-top-sheet-projects',
  MANAGE_COMMERCIALIZED: 'manage-commercialized',
};

// ============================================================================
// PROJECT SECTIONS - Sections for field-level permissions
// ============================================================================
export const PROJECT_SECTIONS = {
  MASTER_PROJECT: 'masterProject',
  PRODUCT_DEVELOPMENT: 'productDevelopment',
  COMMON: 'common',
  APPLICATION_LAB: 'applicationLab',
  SENSORY_LAB: 'sensoryLab',
  BUSINESS_DEVELOPMENT: 'businessDevelopment',
};

export const PROJECT_SECTION_NAMES = Object.values(PROJECT_SECTIONS);

// ============================================================================
// PROJECT GROUPS - Groups of sections (prefixed with @)
// ============================================================================
export const PROJECT_GROUPS = {
  VIEW_MASTER_PROJECT: '@view-master-project',     // All fields for viewing Master Project
  UPDATE_MASTER_PROJECT: '@update-master-project', // Editable fields for updating Master Project
  VIEW_PRODUCT_DEVELOPMENT: '@view-product-development',     // All fields for viewing Product Development
  UPDATE_PRODUCT_DEVELOPMENT: '@update-product-development', // Editable fields for updating Product Development
  VIEW_APPLICATION_LAB: '@view-application-lab',     // All fields for viewing Application Lab
  UPDATE_APPLICATION_LAB: '@update-application-lab', // Editable fields for updating Application Lab
  VIEW_SENSORY_LAB: '@view-sensory-lab',     // All fields for viewing Sensory Lab
  UPDATE_SENSORY_LAB: '@update-sensory-lab', // Editable fields for updating Sensory Lab
  VIEW_MASTER_PROJECT_SCHEDULE: '@view-master-project-schedule',
  UPDATE_MASTER_PROJECT_SCHEDULE: '@update-master-project-schedule',
};

// Group to sections mapping - both groups include all sections since they filter by field permissions
export const PROJECT_GROUP_SECTIONS = {
  '@view-master-project': ['masterProject', 'productDevelopment', 'common', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@update-master-project': ['masterProject', 'productDevelopment', 'common', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@view-product-development': ['masterProject', 'productDevelopment', 'common', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@update-product-development': ['masterProject', 'productDevelopment', 'common', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@view-application-lab': ['masterProject', 'productDevelopment', 'common', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@update-application-lab': ['masterProject', 'productDevelopment', 'common', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@view-sensory-lab': ['masterProject', 'productDevelopment', 'common', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@update-sensory-lab': ['masterProject', 'productDevelopment', 'common', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@view-master-project-schedule': ['masterProject', 'productDevelopment', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
  '@update-master-project-schedule': ['masterProject', 'productDevelopment', 'applicationLab', 'sensoryLab', 'businessDevelopment'],
};

// ============================================================================
// PROJECT FIELDS - All fields organized by section
// ============================================================================
export const PROJECT_FIELDS = {
  masterProject: [
    'masterProject.code',
    'masterProject.title',
    'masterProject.brief',
    'masterProject.bdOrCROBrief',
    'masterProject.raisedDate',
    'masterProject.raisedBy',
    'masterProject.researchAnalysis',
    'masterProject.researchTopic',
    'masterProject.assignedTo',
    'masterProject.assignedDate',
    'masterProject.ideaPresentedDate',
    'masterProject.startDate',
    'masterProject.deadline',
    'masterProject.endDate',
    'masterProject.status',
    'masterProject.purpose',
    'masterProject.purposeDetails',
    'masterProject.objective',
    'masterProject.objectiveDetails',
    'masterProject.isActive',
    'masterProject.clientStatus',
    'masterProject.shelfLifeStatus',
    'masterProject.trialStatus',
    'masterProject.approvedRecipesCount',
  ],
  productDevelopment: [
    'productDevelopment.brief',
    'productDevelopment.deadline',
    'productDevelopment.remarks',
    'productDevelopment.status',
  ],
  common: [
    'common.isFeasible',
    'common.sentToPD',
    'common.sentToApplication',
    'common.sentToSensory',
    'common.sentToSchedule',
    'common.segment',
    'common.flavorProfile',
    'common.coatingUpperLayer',
    'common.filling',
    'common.color',
    'common.ingredients',
    'common.productsUsed',
    'common.shelfLife',
    'common.shape',
    'common.texture',
    'common.machineRequirement',
    'common.costing',
    'common.targetCosting',
    'common.benchmark',
    'common.link',
    'common.trend',
    'common.developmentPriority',
    'common.selectedForDevelopment',
  ],
  applicationLab: [
    'applicationLab.brief',
    'applicationLab.productAppliedTo',
    'applicationLab.recipeName',
    'applicationLab.recipeCode',
    'applicationLab.recipeRef',
    'applicationLab.category',
    'applicationLab.subcategory',
    'applicationLab.subSubcategory',
    'applicationLab.tags',
    'applicationLab.date',
    'applicationLab.deadline',
    'applicationLab.suggestions',
    'applicationLab.developmentStatus',
    'applicationLab.lastProductionDate',
    'applicationLab.nextProductionDate',
    'applicationLab.sampleRequestToLab',
    'applicationLab.sampleRequisitionDate',
    'applicationLab.productionStatus',
    'applicationLab.sampleDeliveryStatus',
  ],
  sensoryLab: [
    'sensoryLab.approval',
    'sensoryLab.deadline',
    'sensoryLab.latestDate',
    'sensoryLab.nextDate',
    'sensoryLab.evaluation',
    'sensoryLab.status',
    'sensoryLab.approvalDate',
  ],
  businessDevelopment: [
    'businessDevelopment.tasteDate',
    'businessDevelopment.evaluation',
    'businessDevelopment.status',
    'businessDevelopment.approvalDate',
    'businessDevelopment.selectedForPromotion',
    'businessDevelopment.promotionStatus',
    'businessDevelopment.marketingTool',
    'businessDevelopment.promotionalTool',
    'businessDevelopment.campaignStartDate',
    'businessDevelopment.promotionDate',
    'businessDevelopment.clientPresentationDate',
    'businessDevelopment.clientFeedback',
    'businessDevelopment.clientSampleDeliveryDate',
    'businessDevelopment.projectStatusToClient',
    'businessDevelopment.responsiblePerson',
    'businessDevelopment.salespersonKAM',
    'businessDevelopment.rawMaterialsRequirements',
    'businessDevelopment.rawMaterialsCost',
    'businessDevelopment.targetCost',
    'businessDevelopment.expectedRevenue',
    'businessDevelopment.initialSalesAmount',
    'businessDevelopment.forecast',
  ],
};

// ============================================================================
// PROJECT MASTER PROJECT FIELDS - Fields shown on MasterProjectDetails page
// ============================================================================
export const PROJECT_MASTER_PROJECT_FIELDS = [
  // Project Active Status (needed for archive/restore functionality)
  'masterProject.isActive',

  // Project Brief
  'masterProject.brief',

  // BD or CRO Brief
  'masterProject.bdOrCROBrief',

  // Product Development Brief (needed for modal)
  'productDevelopment.brief',

  // Application Lab Brief (needed for modal)
  'applicationLab.brief',

  // Statuses Group 1
  'productDevelopment.status',
  'applicationLab.developmentStatus',
  'sensoryLab.status',

  // Statuses Group 2
  'businessDevelopment.status',
  'masterProject.status',
  'businessDevelopment.promotionStatus',

  // Common Status Fields (needed for modal logic)
  'common.isFeasible',
  'common.sentToPD',
  'common.sentToApplication',
  'common.sentToSensory',
  'common.sentToSchedule',

  // Research & Assignment Group
  'masterProject.researchAnalysis',
  'masterProject.researchTopic',
  'masterProject.assignedTo',

  // Dates Group 1
  'masterProject.assignedDate',
  'masterProject.ideaPresentedDate',
  'masterProject.raisedDate',

  // Purpose Group
  'masterProject.raisedBy',
  'masterProject.purpose',
  'masterProject.purposeDetails',

  // Objective Group
  'masterProject.objective',
  'masterProject.objectiveDetails',
  'masterProject.startDate',

  // Project Info Group
  'masterProject.code',
  'masterProject.title',
  'masterProject.deadline',

  // Project End & Recipe Group
  'masterProject.endDate',
  'applicationLab.recipeCode',
  'applicationLab.recipeName',

  // Application Category Group
  'applicationLab.category',
  'applicationLab.subcategory',
  'applicationLab.subSubcategory',

  // Application Tag & Product Group
  'applicationLab.tags',
  'applicationLab.productAppliedTo',

  // Application Suggestions
  'applicationLab.suggestions',

  // Segment
  'common.segment',

  // All BFF Product Used
  'common.productsUsed',

  // BFF Flavor
  'common.flavorProfile',

  // Coating/Filling/Color Group
  'common.coatingUpperLayer',
  'common.filling',
  'common.color',

  // Ingredients & Brand Group
  'common.ingredients',
  'common.benchmark',

  // Shelf Life
  'common.shelfLife',

  // Costing/Shape/Texture Group
  'common.costing',
  'common.targetCosting',
  'common.shape',
  'common.texture',

  // Machine/Benchmark/Link Group
  'common.machineRequirement',
  'common.benchmark',
  'common.link',

  // Trend/Priority/Development Group
  'common.trend',
  'common.developmentPriority',
  'common.selectedForDevelopment',

  // Application Date/Sensory Group
  'applicationLab.date',
  'sensoryLab.approval',
  'sensoryLab.deadline',

  // Approval Dates/Promotion Group
  'sensoryLab.approvalDate',
  'businessDevelopment.approvalDate',
  'businessDevelopment.selectedForPromotion',

  // Marketing/Promotion/Campaign Group
  'businessDevelopment.marketingTool',
  'businessDevelopment.promotionalTool',
  'businessDevelopment.campaignStartDate',

  // Client Sample Delivery Date
  'businessDevelopment.clientSampleDeliveryDate',

  // Master Project Additional Fields
  'masterProject.clientStatus',
  'masterProject.shelfLifeStatus',
  'masterProject.trialStatus',
  'masterProject.approvedRecipesCount',
];

// ============================================================================
// PROJECT PRODUCT DEVELOPMENT FIELDS - Fields shown on ProductDevelopment page
// ============================================================================
export const PROJECT_PRODUCT_DEVELOPMENT_FIELDS = [
  // PD Brief
  'productDevelopment.brief',

  // Master Project Brief (needed for modal)
  'masterProject.brief',

  // Application Lab Brief (needed for modal)
  'applicationLab.brief',

  // Statuses and Project Info
  'productDevelopment.status',
  'applicationLab.developmentStatus',
  'sensoryLab.status',
  'businessDevelopment.status',
  'masterProject.status',

  // Common Status Fields (needed for modal logic)
  'common.isFeasible',
  'common.sentToPD',
  'common.sentToApplication',
  'common.sentToSensory',
  'common.sentToSchedule',

  'masterProject.raisedDate',
  'masterProject.raisedBy',
  'masterProject.purpose',
  'masterProject.purposeDetails',
  'masterProject.objective',
  'masterProject.objectiveDetails',
  'masterProject.startDate',
  'masterProject.code',
  'masterProject.title',
  'masterProject.endDate',

  // Product Development Deadline
  'productDevelopment.deadline',

  // PD Remarks
  'productDevelopment.remarks',

  // Application Details
  'applicationLab.productAppliedTo',
  'applicationLab.recipeCode',
  'applicationLab.recipeName',
  'applicationLab.category',
  'applicationLab.subcategory',
  'applicationLab.subSubcategory',
  'applicationLab.tags',
  'common.segment',

  // All BFF Product Code Used
  'common.productsUsed',

  // Sensory Approval Date
  'sensoryLab.approvalDate',

  // BD Evaluation
  'businessDevelopment.evaluation',

  // BD Approval Date
  'businessDevelopment.approvalDate',
];

export const PROJECT_APPLICATION_LAB_FIELDS = [
  // Application Brief
  'applicationLab.brief',

  // Statuses Group 1
  'productDevelopment.status',
  'applicationLab.developmentStatus',
  'sensoryLab.status',

  // Statuses Group 2
  'businessDevelopment.status',
  'masterProject.status',
  'businessDevelopment.promotionStatus',

  // Common Status Fields (needed for modal logic)
  'common.isFeasible',
  'common.sentToPD',
  'common.sentToApplication',
  'common.sentToSensory',
  'common.sentToSchedule',

  // Dates Group 1
  'masterProject.raisedDate',
  'masterProject.raisedBy',
  'masterProject.purpose',

  // Purpose & Objective Group
  'masterProject.purposeName',
  'masterProject.objective',
  'masterProject.objectiveDetails',

  // Project Info Group
  'masterProject.startDate',
  'masterProject.code',
  'masterProject.title',

  // Project End & Recipe Group
  'masterProject.endDate',
  'applicationLab.recipeCode',
  'applicationLab.recipeName',

  // Application Category Group
  'applicationLab.category',
  'applicationLab.subcategory',
  'applicationLab.subSubcategory',

  // Application Tag & Segment Group
  'applicationLab.tags',
  'applicationLab.deadline',
  'common.segment',

  // Application Suggestions
  'applicationLab.suggestions',

  // All BFF Products Used
  'common.productsUsed',

  // Dates Group 2
  'applicationLab.date',
  'sensoryLab.approvalDate',
  'businessDevelopment.tasteDate',

  // Business Development Evaluation
  'businessDevelopment.evaluation',

  // Campaign Dates Group
  'businessDevelopment.approvalDate',
  'businessDevelopment.campaignStartDate',
];

export const PROJECT_SENSORY_LAB_FIELDS = [
  // Status Group 1
  'productDevelopment.status',
  'applicationLab.developmentStatus',
  'sensoryLab.status',

  // Status Group 2
  'businessDevelopment.status',
  'masterProject.status',

  // Common Status Fields (needed for modal logic)
  'common.isFeasible',
  'common.sentToPD',
  'common.sentToApplication',
  'common.sentToSensory',
  'common.sentToSchedule',

  'masterProject.raisedDate',

  // Purpose & Details Group
  'masterProject.raisedBy',
  'masterProject.purpose',
  'masterProject.purposeName',

  // Objective Group
  'masterProject.objective',
  'masterProject.objectiveDetails',
  'masterProject.startDate',

  // Project Info Group
  'masterProject.code',
  'masterProject.title',
  'masterProject.endDate',

  // Recipe & Application Group
  'applicationLab.recipeCode',
  'applicationLab.recipeName',
  'applicationLab.category',

  // Category Group
  'applicationLab.subcategory',
  'applicationLab.subSubcategory',
  'applicationLab.tags',

  // Segment & Deadline Group
  'common.segment',
  'sensoryLab.deadline',
  'sensoryLab.latestDeadline',

  // Sensory Evaluation
  'sensoryLab.evaluation',

  // Approval Dates Group
  'sensoryLab.approvalDate',
  'businessDevelopment.approvalDate',

  // Client Feedback
  'sensoryLab.clientFeedback',
];

// Financial fields subset (for @financials group)
export const PROJECT_FINANCIAL_FIELDS = [
  'businessDevelopment.rawMaterialsCost',
  'businessDevelopment.targetCost',
  'businessDevelopment.expectedRevenue',
  'businessDevelopment.initialSalesAmount',
  'businessDevelopment.forecast',
];

export const PROJECT_MASTER_PROJECT_SCHEDULE_FIELDS = [
  'masterProject.brief',
  'masterProject.status',
  'sensoryLab.status',
  'businessDevelopment.status',
  'businessDevelopment.promotionStatus',
  'productDevelopment.status',
  'masterProject.code',
  'masterProject.title',
  'masterProject.raisedDate',
  'masterProject.raisedBy',
  'masterProject.purpose',
  'masterProject.purposeDetails',
  'masterProject.objective',
  'masterProject.objectiveDetails',
  'masterProject.startDate',
  'masterProject.endDate',
  'productDevelopment.remarks',
  'applicationLab.recipeCode',
  'applicationLab.recipeName',
  'applicationLab.category',
  'applicationLab.subcategory',
  'applicationLab.subSubcategory',
  'applicationLab.tags',
  'applicationLab.nextProductionDate',
  'applicationLab.lastProductionDate',
  'common.segment',
  'sensoryLab.approval',
  'sensoryLab.latestDate',
  'sensoryLab.nextDate',
  'businessDevelopment.evaluation',
  'businessDevelopment.approvalDate',
  'businessDevelopment.clientSampleDeliveryDate',
];

// ============================================================================
// PERMISSION BUILDER - Utility to build permission strings
// ============================================================================
export const PermissionBuilder = {
  resource: (resource, action) => `${resource}:${action}`,
  wildcard: (resource) => `${resource}:*`,
  section: (resource, action, section) => `${resource}:${action}:${section}`,
  field: (resource, action, field) => `${resource}:${action}:${field}`,
  group: (resource, action, group) => `${resource}:${action}:${group}`,
};

// ============================================================================
// PERMISSIONS - All permission strings (using PermissionBuilder)
// ============================================================================
export const PERMISSIONS = {
  DASHBOARD: {
    READ: PermissionBuilder.resource(RESOURCES.DASHBOARD, ACTIONS.READ),
    EXPORT_PDF: PermissionBuilder.resource(RESOURCES.DASHBOARD, ACTIONS.EXPORT_PDF),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.DASHBOARD),
  },

  USER: {
    CREATE: PermissionBuilder.resource(RESOURCES.USER, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.USER, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.USER, ACTIONS.UPDATE),
    UNBLOCK: PermissionBuilder.resource(RESOURCES.USER, ACTIONS.UNBLOCK),
    UPDATE_PASSWORD: PermissionBuilder.resource(RESOURCES.USER, ACTIONS.UPDATE_PASSWORD),
    DELETE: PermissionBuilder.resource(RESOURCES.USER, ACTIONS.DELETE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.USER),
  },
  ROLE: {
    CREATE: PermissionBuilder.resource(RESOURCES.ROLE, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.ROLE, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.ROLE, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.ROLE, ACTIONS.DELETE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.ROLE),
  },
  PERMISSION: {
    READ: PermissionBuilder.resource(RESOURCES.PERMISSION, ACTIONS.READ),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.PERMISSION),
  },
  PROJECT: {
    CREATE: PermissionBuilder.resource(RESOURCES.PROJECT, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.PROJECT, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.PROJECT, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.PROJECT, ACTIONS.DELETE),
    IMPORT: PermissionBuilder.resource(RESOURCES.PROJECT, ACTIONS.IMPORT),
    EXPORT: PermissionBuilder.resource(RESOURCES.PROJECT, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.PROJECT),

    // Group-level permissions (Active Roles & Field-Level Access)
    READ_MASTER_PROJECT: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.READ, PROJECT_GROUPS.VIEW_MASTER_PROJECT),
    UPDATE_MASTER_PROJECT: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.UPDATE, PROJECT_GROUPS.UPDATE_MASTER_PROJECT),
    READ_PRODUCT_DEVELOPMENT: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.READ, PROJECT_GROUPS.VIEW_PRODUCT_DEVELOPMENT),
    UPDATE_PRODUCT_DEVELOPMENT: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.UPDATE, PROJECT_GROUPS.UPDATE_PRODUCT_DEVELOPMENT),
    READ_APPLICATION_LAB: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.READ, PROJECT_GROUPS.VIEW_APPLICATION_LAB),
    UPDATE_APPLICATION_LAB: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.UPDATE, PROJECT_GROUPS.UPDATE_APPLICATION_LAB),
    READ_SENSORY_LAB: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.READ, PROJECT_GROUPS.VIEW_SENSORY_LAB),
    UPDATE_SENSORY_LAB: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.UPDATE, PROJECT_GROUPS.UPDATE_SENSORY_LAB),
    READ_MASTER_PROJECT_SCHEDULE: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.READ, PROJECT_GROUPS.VIEW_MASTER_PROJECT_SCHEDULE),
    UPDATE_MASTER_PROJECT_SCHEDULE: PermissionBuilder.group(RESOURCES.PROJECT, ACTIONS.UPDATE, PROJECT_GROUPS.UPDATE_MASTER_PROJECT_SCHEDULE),
  },
  TASK: {
    CREATE: PermissionBuilder.resource(RESOURCES.TASK, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.TASK, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.TASK, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.TASK, ACTIONS.DELETE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.TASK),
  },
  PROJECT_TASK: {
    CREATE: PermissionBuilder.resource(RESOURCES.PROJECT_TASK, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.PROJECT_TASK, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.PROJECT_TASK, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.PROJECT_TASK, ACTIONS.DELETE),
    EXPORT: PermissionBuilder.resource(RESOURCES.PROJECT_TASK, ACTIONS.EXPORT),
    REASSIGN: PermissionBuilder.resource(RESOURCES.PROJECT_TASK, ACTIONS.REASSIGN),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.PROJECT_TASK),
  },
  INTERNAL_TASK: {
    CREATE: PermissionBuilder.resource(RESOURCES.INTERNAL_TASK, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.INTERNAL_TASK, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.INTERNAL_TASK, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.INTERNAL_TASK, ACTIONS.DELETE),
    REASSIGN: PermissionBuilder.resource(RESOURCES.INTERNAL_TASK, ACTIONS.REASSIGN),
    MANAGE_RECURRING: PermissionBuilder.resource(RESOURCES.INTERNAL_TASK, ACTIONS.MANAGE_RECURRING),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.INTERNAL_TASK),
  },
  CATEGORY: {
    CREATE: PermissionBuilder.resource(RESOURCES.CATEGORY, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.CATEGORY, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.CATEGORY, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.CATEGORY, ACTIONS.DELETE),
    IMPORT: PermissionBuilder.resource(RESOURCES.CATEGORY, ACTIONS.IMPORT),
    EXPORT: PermissionBuilder.resource(RESOURCES.CATEGORY, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.CATEGORY),
  },
  SUBCATEGORY: {
    CREATE: PermissionBuilder.resource(RESOURCES.SUBCATEGORY, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.SUBCATEGORY, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.SUBCATEGORY, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.SUBCATEGORY, ACTIONS.DELETE),
    IMPORT: PermissionBuilder.resource(RESOURCES.SUBCATEGORY, ACTIONS.IMPORT),
    EXPORT: PermissionBuilder.resource(RESOURCES.SUBCATEGORY, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.SUBCATEGORY),
  },
  SUBSUBCATEGORY: {
    CREATE: PermissionBuilder.resource(RESOURCES.SUBSUBCATEGORY, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.SUBSUBCATEGORY, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.SUBSUBCATEGORY, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.SUBSUBCATEGORY, ACTIONS.DELETE),
    IMPORT: PermissionBuilder.resource(RESOURCES.SUBSUBCATEGORY, ACTIONS.IMPORT),
    EXPORT: PermissionBuilder.resource(RESOURCES.SUBSUBCATEGORY, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.SUBSUBCATEGORY),
  },
  RECIPE: {
    CREATE: PermissionBuilder.resource(RESOURCES.RECIPE, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.RECIPE, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.RECIPE, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.RECIPE, ACTIONS.DELETE),
    EXPORT_APPLICATION_RECIPE: PermissionBuilder.resource(RESOURCES.RECIPE, ACTIONS.EXPORT_APPLICATION_RECIPE),
    EXPORT_FINAL_RECIPES: PermissionBuilder.resource(RESOURCES.RECIPE, ACTIONS.EXPORT_FINAL_RECIPES),
    EXPORT_IN_DEVELOPMENT_RECIPES: PermissionBuilder.resource(RESOURCES.RECIPE, ACTIONS.EXPORT_IN_DEVELOPMENT_RECIPES),
    VIEW_ALL_MANAGE_RECIPE_PROJECTS: PermissionBuilder.resource(RESOURCES.RECIPE, ACTIONS.VIEW_ALL_MANAGE_RECIPE_PROJECTS),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.RECIPE),
  },
  BFF_PRODUCT: {
    CREATE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.DELETE),
    MANAGE_COMMERCIALIZED: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.MANAGE_COMMERCIALIZED),
    IMPORT: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.IMPORT),
    EXPORT: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.BFF_PRODUCT),
  },
  BFF_PRODUCT_SEGMENT: {
    CREATE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT_SEGMENT, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT_SEGMENT, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT_SEGMENT, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT_SEGMENT, ACTIONS.DELETE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.BFF_PRODUCT_SEGMENT),
  },
  /** @deprecated Alias — use BFF_PRODUCT */
  BFF_PRODUCT_CODE: {
    CREATE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.DELETE),
    MANAGE_COMMERCIALIZED: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.MANAGE_COMMERCIALIZED),
    IMPORT: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.IMPORT),
    EXPORT: PermissionBuilder.resource(RESOURCES.BFF_PRODUCT, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.BFF_PRODUCT),
  },
  SENSORY_EVALUATION: {
    CREATE: PermissionBuilder.resource(RESOURCES.SENSORY_EVALUATION, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.SENSORY_EVALUATION, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.SENSORY_EVALUATION, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.SENSORY_EVALUATION, ACTIONS.DELETE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.SENSORY_EVALUATION),
  },
  // Sensory form / top–sheet permissions for UI
  SENSORY_FORM: {
    CREATE: PermissionBuilder.resource(RESOURCES.SENSORY_FORM, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.SENSORY_FORM, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.SENSORY_FORM, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.SENSORY_FORM, ACTIONS.DELETE),
    VIEW_ALL_SENSORY_FORM_PROJECTS: PermissionBuilder.resource(
      RESOURCES.SENSORY_FORM,
      ACTIONS.VIEW_ALL_SENSORY_FORM_PROJECTS
    ),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.SENSORY_FORM),
  },
  SENSORY_TOP_SHEET: {
    CREATE: PermissionBuilder.resource(RESOURCES.SENSORY_TOP_SHEET, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.SENSORY_TOP_SHEET, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.SENSORY_TOP_SHEET, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.SENSORY_TOP_SHEET, ACTIONS.DELETE),
    VIEW_ALL_SENSORY_TOP_SHEET_PROJECTS: PermissionBuilder.resource(
      RESOURCES.SENSORY_TOP_SHEET,
      ACTIONS.VIEW_ALL_SENSORY_TOP_SHEET_PROJECTS
    ),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.SENSORY_TOP_SHEET),
  },
  INVITATION: {
    CREATE: PermissionBuilder.resource(RESOURCES.INVITATION, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.INVITATION, ACTIONS.READ),
    DELETE: PermissionBuilder.resource(RESOURCES.INVITATION, ACTIONS.DELETE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.INVITATION),
  },
  TEAM: {
    CREATE: PermissionBuilder.resource(RESOURCES.TEAM, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.TEAM, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.TEAM, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.TEAM, ACTIONS.DELETE),
    MANAGE_MEMBERS: PermissionBuilder.resource(RESOURCES.TEAM, ACTIONS.MANAGE_MEMBERS),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.TEAM),
  },
  APPLICATION_TAG: {
    CREATE: PermissionBuilder.resource(RESOURCES.APPLICATION_TAG, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.APPLICATION_TAG, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.APPLICATION_TAG, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.APPLICATION_TAG, ACTIONS.DELETE),
    IMPORT: PermissionBuilder.resource(RESOURCES.APPLICATION_TAG, ACTIONS.IMPORT),
    EXPORT: PermissionBuilder.resource(RESOURCES.APPLICATION_TAG, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.APPLICATION_TAG),
  },
  RAW_MATERIAL: {
    CREATE: PermissionBuilder.resource(RESOURCES.RAW_MATERIAL, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.RAW_MATERIAL, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.RAW_MATERIAL, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.RAW_MATERIAL, ACTIONS.DELETE),
    IMPORT: PermissionBuilder.resource(RESOURCES.RAW_MATERIAL, ACTIONS.IMPORT),
    EXPORT: PermissionBuilder.resource(RESOURCES.RAW_MATERIAL, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.RAW_MATERIAL),
  },
  PACKAGING_TYPE: {
    CREATE: PermissionBuilder.resource(RESOURCES.PACKAGING_TYPE, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.PACKAGING_TYPE, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.PACKAGING_TYPE, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.PACKAGING_TYPE, ACTIONS.DELETE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.PACKAGING_TYPE),
  },
  SAMPLE: {
    CREATE: PermissionBuilder.resource(RESOURCES.SAMPLE, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.SAMPLE, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.SAMPLE, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.SAMPLE, ACTIONS.DELETE),
    VIEW_ALL_SAMPLE_PROJECTS: PermissionBuilder.resource(RESOURCES.SAMPLE, ACTIONS.VIEW_ALL_SAMPLE_PROJECTS),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.SAMPLE),
  },
  PRODUCTION_SCHEDULE: {
    CREATE: PermissionBuilder.resource(RESOURCES.PRODUCTION_SCHEDULE, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.PRODUCTION_SCHEDULE, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.PRODUCTION_SCHEDULE, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.PRODUCTION_SCHEDULE, ACTIONS.DELETE),
    EXPORT: PermissionBuilder.resource(RESOURCES.PRODUCTION_SCHEDULE, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.PRODUCTION_SCHEDULE),
  },
  CLEANING: {
    CREATE: PermissionBuilder.resource(RESOURCES.CLEANING, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.CLEANING, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.CLEANING, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.CLEANING, ACTIONS.DELETE),
    EXPORT: PermissionBuilder.resource(RESOURCES.CLEANING, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.CLEANING),
  },
  MAINTENANCE: {
    CREATE: PermissionBuilder.resource(RESOURCES.MAINTENANCE, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.MAINTENANCE, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.MAINTENANCE, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.MAINTENANCE, ACTIONS.DELETE),
    EXPORT: PermissionBuilder.resource(RESOURCES.MAINTENANCE, ACTIONS.EXPORT),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.MAINTENANCE),
  },
  DISPATCH: {
    CREATE: PermissionBuilder.resource(RESOURCES.DISPATCH, ACTIONS.CREATE),
    READ: PermissionBuilder.resource(RESOURCES.DISPATCH, ACTIONS.READ),
    UPDATE: PermissionBuilder.resource(RESOURCES.DISPATCH, ACTIONS.UPDATE),
    DELETE: PermissionBuilder.resource(RESOURCES.DISPATCH, ACTIONS.DELETE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.DISPATCH),
  },
  SHELF_LIFE_TESTING: {
    READ: PermissionBuilder.resource(RESOURCES.SHELF_LIFE_TESTING, ACTIONS.READ),
    EXPORT_TEST_RECORDS: PermissionBuilder.resource(RESOURCES.SHELF_LIFE_TESTING, ACTIONS.EXPORT_TEST_RECORDS),
    EXPORT_MONITORING_HISTORY: PermissionBuilder.resource(RESOURCES.SHELF_LIFE_TESTING, ACTIONS.EXPORT_MONITORING_HISTORY),
    VIEW_ALL_TEST_RECORD_PROJECTS: PermissionBuilder.resource(RESOURCES.SHELF_LIFE_TESTING, ACTIONS.VIEW_ALL_TEST_RECORD_PROJECTS),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.SHELF_LIFE_TESTING),
  },
  AUDIT: {
    READ: PermissionBuilder.resource(RESOURCES.AUDIT, ACTIONS.READ),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.AUDIT),
  },
  PROJECT_MEMBER: {
    VIEW: PermissionBuilder.resource(RESOURCES.PROJECT_MEMBER, ACTIONS.VIEW),
    ADD: PermissionBuilder.resource(RESOURCES.PROJECT_MEMBER, ACTIONS.ADD),
    REMOVE: PermissionBuilder.resource(RESOURCES.PROJECT_MEMBER, ACTIONS.REMOVE),
    MANAGE: PermissionBuilder.wildcard(RESOURCES.PROJECT_MEMBER),
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all project fields as flat array
 */
export function getAllProjectFields() {
  return Object.values(PROJECT_FIELDS).flat();
}

/**
 * Get fields for a section
 */
export function getSectionFields(section) {
  return PROJECT_FIELDS[section] || [];
}

/**
 * Get fields for a group
 */
export function getGroupFields(group) {
  // For @view-master-project, return only fields shown on MasterProjectDetails page
  if (group === '@view-master-project') {
    return PROJECT_MASTER_PROJECT_FIELDS;
  }

  // For @update-master-project, return only editable fields from MasterProjectDetails page
  if (group === '@update-master-project') {
    return PROJECT_MASTER_PROJECT_FIELDS.filter(field => {
      // Define which fields are editable based on frontend config
      const editableFields = [
        'masterProject.brief',
        'masterProject.bdOrCROBrief',
        'masterProject.status',
        'masterProject.researchAnalysis',
        'masterProject.researchTopic',
        'masterProject.assignedTo',
        'masterProject.assignedDate',
        'masterProject.ideaPresentedDate',
        'masterProject.raisedDate',
        'masterProject.raisedBy',
        'masterProject.purpose',
        'masterProject.purposeDetails',
        'masterProject.objective',
        'masterProject.objectiveDetails',
        'masterProject.startDate',
        'masterProject.title',
        'masterProject.deadline',
        'masterProject.endDate',
        'common.segment',
        'common.productsUsed',
        'common.flavorProfile',
        'common.coatingUpperLayer',
        'common.filling',
        'common.color',
        'common.ingredients',
        'common.benchmark',
        'common.costing',
        'common.targetCosting',
        'common.shape',
        'common.texture',
        'common.machineRequirement',
        'common.trend',
        'common.developmentPriority',
        'common.selectedForDevelopment',
        'common.link',
        'applicationLab.productAppliedTo',
        'applicationLab.category',
        'applicationLab.subcategory',
        'applicationLab.subSubcategory',
        'applicationLab.tags',
        'sensoryLab.approval',
        'sensoryLab.deadline',
        'businessDevelopment.promotionStatus',
        'businessDevelopment.selectedForPromotion',
        'businessDevelopment.marketingTool',
        'businessDevelopment.promotionalTool',
        'businessDevelopment.campaignStartDate',
        'masterProject.clientStatus',
        'masterProject.shelfLifeStatus',
        'masterProject.trialStatus',
        'masterProject.approvedRecipesCount',
      ];
      return editableFields.includes(field);
    });
  }

  // For @view-product-development, return only fields shown on ProductDevelopmentDetails page
  if (group === '@view-product-development') {
    return PROJECT_PRODUCT_DEVELOPMENT_FIELDS;
  }

  // For @update-product-development, return only editable fields from ProductDevelopmentDetails page
  if (group === '@update-product-development') {
    return PROJECT_PRODUCT_DEVELOPMENT_FIELDS.filter(field => {
      const editableFields = [
        'productDevelopment.brief',
        'productDevelopment.status',
        'productDevelopment.deadline',
        'productDevelopment.remarks',
      ];
      return editableFields.includes(field);
    });
  }

  // For @financials, return only financial fields
  if (group === '@financials') {
    return PROJECT_FINANCIAL_FIELDS;
  }

  // For @view-application-lab, return only fields shown on ApplicationLabDetails page
  if (group === '@view-application-lab') {
    return PROJECT_APPLICATION_LAB_FIELDS;
  }

  // For @view-sensory-lab, return only fields shown on SensoryLabDetails page
  if (group === '@view-sensory-lab') {
    return PROJECT_SENSORY_LAB_FIELDS;
  }

  // For @view-master-project-schedule, return only fields shown on MasterProjectSchedule page
  if (group === '@view-master-project-schedule') {
    return PROJECT_MASTER_PROJECT_SCHEDULE_FIELDS;
  }

  // For @update-master-project-schedule, return only editable fields from MasterProjectSchedule page
  if (group === '@update-master-project-schedule') {
    return PROJECT_MASTER_PROJECT_SCHEDULE_FIELDS.filter(field => {
      const editableFields = [
        'masterProject.brief',
        'masterProject.raisedBy',
        'productDevelopment.remarks',
        'applicationLab.nextProductionDate',
        'applicationLab.lastProductionDate',
        'sensoryLab.latestDate',
        'sensoryLab.nextDate',
        'businessDevelopment.evaluation',
      ];
      return editableFields.includes(field);
    });
  }

  // For @update-application-lab, return all editable fields from ApplicationLab section
  if (group === '@update-application-lab') {
    return PROJECT_FIELDS.applicationLab;
  }

  // For @update-sensory-lab, return all editable fields from SensoryLab section
  if (group === '@update-sensory-lab') {
    return PROJECT_FIELDS.sensoryLab;
  }

  // For legacy groups, use section mapping
  const sections = PROJECT_GROUP_SECTIONS[group] || [];
  const fields = [];
  for (const section of sections) {
    fields.push(...(PROJECT_FIELDS[section] || []));
  }
  return fields;
}

/**
 * Get section name from field path
 */
export function getFieldSection(fieldPath) {
  if (!fieldPath) return null;
  const section = fieldPath.split('.')[0];
  return PROJECT_FIELDS[section] ? section : null;
}

/**
 * Check if a string is a valid section name
 */
export function isValidSection(name) {
  return PROJECT_SECTION_NAMES.includes(name);
}

/**
 * Check if a string is a valid group name
 */
export function isValidGroup(name) {
  return Object.values(PROJECT_GROUPS).includes(name);
}

/**
 * Parse a permission string into its components
 */
export function parsePermission(permission) {
  const parts = permission.split(':');
  const result = {
    resource: parts[0],
    action: parts[1],
  };
  
  if (parts.length > 2) {
    result.scope = parts.slice(2).join(':');
    result.isGroup = result.scope.startsWith('@');
    result.isField = result.scope.includes('.') && !result.isGroup;
    result.isSection = !result.isGroup && !result.isField;
  }
  
  return result;
}

/**
 * Get all permission strings for a resource
 * @param {string} resourceKey - Resource key (e.g., 'USER', 'PROJECT')
 * @returns {string[]} Array of permission strings
 */
export function getResourcePermissions(resourceKey) {
  const resourcePerms = PERMISSIONS[resourceKey];
  if (!resourcePerms) {
    throw new Error(`Unknown resource: ${resourceKey}`);
  }
  return Object.values(resourcePerms);
}

/**
 * Get all permission strings in the system
 * @returns {string[]} Array of all permission strings
 */
export function getAllPermissions() {
  const allPerms = [];
  Object.values(PERMISSIONS).forEach(resourcePerms => {
    allPerms.push(...Object.values(resourcePerms));
  });
  return allPerms;
}

// ============================================================================
// SCOPES & MAPPINGS
// ============================================================================

export const SCOPES = {
  GLOBAL: 'global',
  APPLICATION: 'application',
  CRM: 'crm'
};

export const RESOURCE_SCOPES = {
  dashboard: 'global',
  user: 'global',
  role: 'global',
  permission: 'global',
  invitation: 'global',
  audit: 'global',
  'bff-product-segment': 'global',
  client: 'crm',
  campaign: 'crm',
  prospect: 'crm',
  'crm-tag': 'crm'
};

export function getPermissionScope(key) {
  const resource = key.split(':')[0];
  return RESOURCE_SCOPES[resource] || 'application';
}

export default PERMISSIONS;
