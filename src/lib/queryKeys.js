/**
 * Centralized Query Keys for TanStack Query
 * 
 * STRICT RULE: No hardcoded strings in hooks. All keys must be defined here.
 * This enables type-safe cache invalidation and prevents key collisions.
 */

export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'],
    user: () => ['auth', 'user'],
    permissions: () => ['auth', 'permissions'],
  },

  // Users/Employees
  users: {
    all: ['users'],
    list: (params) => ['users', 'list', params],
    detail: (id) => ['users', 'detail', id],
  },

  // Teams
  teams: {
    all: ['teams'],
    list: (params) => ['teams', 'list', params],
    detail: (id) => ['teams', 'detail', id],
    members: (teamId) => ['teams', teamId, 'members'],
  },

  // Invitations
  invitations: {
    all: ['invitations'],
    list: (params) => ['invitations', 'list', params],
    detail: (id) => ['invitations', 'detail', id],
  },

  // Roles
  roles: {
    all: ['roles'],
    list: (params) => ['roles', 'list', params],
    detail: (id) => ['roles', 'detail', id],
  },

  // Permissions
  permissions: {
    all: ['permissions'],
    list: (params) => ['permissions', 'list', params],
  },

  // Projects
  projects: {
    all: ['projects'],
    list: (params) => ['projects', 'list', params],
    detail: (id) => ['projects', 'detail', id],
  },

  // Main Dashboard
  mainDashboard: {
    all: ['mainDashboard'],
    metrics: (params) => ['mainDashboard', 'metrics', params],
  },

  // Project Members
  projectMembers: {
    all: ['projectMembers'],
    list: (projectId) => ['projectMembers', projectId, 'list'],
    status: (projectId) => ['project-member-status', projectId],
  },

  // Master Projects
  masterProjects: {
    all: ['masterProjects'],
    list: (params) => ['masterProjects', 'list', params],
    detail: (id) => ['masterProjects', 'detail', id],
  },

  // Master Project Schedule
  masterProjectSchedule: {
    all: ['masterProjectSchedule'],
    list: (params) => ['masterProjectSchedule', 'list', params],
  },

  // Product Development Projects
  productDevelopmentProjects: {
    all: ['productDevelopmentProjects'],
    list: (params) => ['productDevelopmentProjects', 'list', params],
    detail: (id) => ['productDevelopmentProjects', 'detail', id],
  },

  // Future project views - uncomment as needed:
  applicationLabProjects: {
    all: ['applicationLabProjects'],
    list: (params) => ['applicationLabProjects', 'list', params],
    detail: (id) => ['applicationLabProjects', 'detail', id],
  },
  sensoryLabProjects: {
    all: ['sensoryLabProjects'],
    list: (params) => ['sensoryLabProjects', 'list', params],
    detail: (id) => ['sensoryLabProjects', 'detail', id],
  },
  businessDevelopmentProjects: {
    all: ['businessDevelopmentProjects'],
    list: (params) => ['businessDevelopmentProjects', 'list', params],
    detail: (id) => ['businessDevelopmentProjects', 'detail', id],
  },

  // Project History
  projectHistory: {
    all: ['projectHistory'],
    list: (projectId, params) => ['projectHistory', 'list', projectId, params],
  },

  // Project Comments
  comments: {
    all: ['comments'],
    list: (projectId, params) => ['comments', 'list', projectId, params],
    detail: (id) => ['comments', 'detail', id],
  },

  // Project Tasks
  projectTasks: {
    all: ['projectTasks'],
    list: (params) => ['projectTasks', 'list', params],
    detail: (id) => ['projectTasks', 'detail', id],
    byProject: (projectId, params) => ['projectTasks', 'byProject', projectId, params],
  },

  // Internal Tasks
  internalTasks: {
    all: ['internalTasks'],
    list: (params) => ['internalTasks', 'list', params],
    detail: (id) => ['internalTasks', 'detail', id],
    byUser: (userId, params) => ['internalTasks', 'byUser', userId, params],
    byTeam: (teamId, params) => ['internalTasks', 'byTeam', teamId, params],
  },

  // Recipes
  recipes: {
    all: ['recipes'],
    list: (params) => ['recipes', 'list', params],
    cloneOptions: (params) => ['recipes', 'cloneOptions', params],
    detail: (id) => ['recipes', 'detail', id],
    byProject: (projectId, params) => ['recipes', 'byProject', projectId, params],
    byCategory: (categoryId, params) => ['recipes', 'byCategory', categoryId, params],
    versions: (id) => ['recipes', 'versions', id],
    typeChangePreview: (id, targetRecipeType) => ['recipes', 'typeChangePreview', id, targetRecipeType],
    projectsWithLatestRecipeDate: (params) => ['recipes', 'projectsWithLatestRecipeDate', params],
  },

  // Categories
  categories: {
    all: ['categories'],
    list: (params) => ['categories', 'list', params],
    detail: (id) => ['categories', 'detail', id],
  },

  // Subcategories
  subcategories: {
    all: ['subcategories'],
    list: (params) => ['subcategories', 'list', params],
    detail: (id) => ['subcategories', 'detail', id],
    byCategory: (categoryId, params) => ['subcategories', 'byCategory', categoryId, params],
  },

  // Sub-subcategories
  subsubcategories: {
    all: ['subsubcategories'],
    list: (params) => ['subsubcategories', 'list', params],
    detail: (id) => ['subsubcategories', 'detail', id],
    bySubcategory: (subcategoryId, params) => ['subsubcategories', 'bySubcategory', subcategoryId, params],
  },

  // Application Tags
  applicationTags: {
    all: ['applicationTags'],
    list: (params) => ['applicationTags', 'list', params],
    detail: (id) => ['applicationTags', 'detail', id],
    bySubcategory: (subcategoryId, params) => ['applicationTags', 'bySubcategory', subcategoryId, params],
  },

  // Packaging Types
  packagingTypes: {
    all: ['packagingTypes'],
    list: (params) => ['packagingTypes', 'list', params],
    detail: (id) => ['packagingTypes', 'detail', id],
  },

  // BFF Product Codes
  bffProductCodes: {
    all: ['bffProductCodes'],
    list: (params) => ['bffProductCodes', 'list', params],
    detail: (id) => ['bffProductCodes', 'detail', id],
    bySegment: (segment, params) => ['bffProductCodes', 'bySegment', segment, params],
  },

  // BFF Product Taxonomy
  bffProductTaxonomy: {
    all: ['bffProductTaxonomy'],
    kinds: () => ['bffProductTaxonomy', 'kinds'],
    list: (kind, params) => ['bffProductTaxonomy', kind, 'list', params],
    detail: (kind, id) => ['bffProductTaxonomy', kind, 'detail', id],
  },

  // Dispatch Records
  dispatch: {
    all: ['dispatch'],
    list: (params) => ['dispatch', 'list', params],
    detail: (id) => ['dispatch', 'detail', id],
  },

  // Access History
  accessHistory: {
    all: ['accessHistory'],
    list: (params) => ['accessHistory', 'list', params],
  },

  // Modules
  modules: {
    all: ['modules'],
    list: () => ['modules', 'list'],
    submodules: (moduleKey) => ['modules', moduleKey, 'submodules'],
  },

  // Raw Materials
  rawMaterials: {
    all: ['rawMaterials'],
    list: (params) => ['rawMaterials', 'list', params],
    detail: (id) => ['rawMaterials', 'detail', id],
  },

  // Packaging Types
  packagingTypes: {
    all: ['packagingTypes'],
    list: (params) => ['packagingTypes', 'list', params],
    detail: (id) => ['packagingTypes', 'detail', id],
  },

  // Samples
  samples: {
    all: ['samples'],
    list: (params) => ['samples', 'list', params],
    detail: (id) => ['samples', 'detail', id],
    byProject: (projectId, params) => ['samples', 'byProject', projectId, params],
    projectsWithLatestSampleDate: (params) => ['samples', 'projectsWithLatestSampleDate', params],
    projectsForSamplePreparation: (params) => ['samples', 'projectsForSamplePreparation', params],
    projectsForApplicationLabRecords: (params) => ['samples', 'projectsForApplicationLabRecords', params],
    projectsForShelfLifeTestRecords: (params) => ['samples', 'projectsForShelfLifeTestRecords', params],
    shelfLifeSamplesByProject: (projectId, params) => ['samples', 'shelfLifeSamplesByProject', projectId, params],
    shelfLifeTestingBySample: (sampleId) => ['samples', 'shelfLifeTestingBySample', sampleId],
    shelfLifeRecordsBySample: (sampleId) => ['samples', 'shelfLifeRecordsBySample', sampleId],
    monitoringHistory: (params) => ['samples', 'monitoringHistory', params],
  },

  // Production Schedules
  productionSchedules: {
    all: ['productionSchedules'],
    list: (params) => ['productionSchedules', 'list', params],
    byDate: (date, params) => ['productionSchedules', 'byDate', date, params],
    byDateRange: (startDate, endDate, params) => ['productionSchedules', 'byDateRange', startDate, endDate, params],
    byProject: (projectId, params) => ['productionSchedules', 'byProject', projectId, params],
    detail: (id) => ['productionSchedules', 'detail', id],
    availableSlots: (projectId, date) => ['productionSchedules', 'availableSlots', projectId, date],
  },

  // Sensory
  sensory: {
    all: ['sensory'],
    projectsForSensoryForm: (params) => ['sensory', 'projectsForSensoryForm', params],
    projectsForSensoryTopSheet: (params) => ['sensory', 'projectsForSensoryTopSheet', params],
    samplesByProject: (projectId, params) => ['sensory', 'samplesByProject', projectId, params],
    formBySample: (sampleId, panelistId) => ['sensory', 'formBySample', sampleId, panelistId],
    formAggregated: (sampleId) => ['sensory', 'formAggregated', sampleId],
    topSheetBySample: (sampleId) => ['sensory', 'topSheetBySample', sampleId],
    sampleDetails: (sampleId) => ['sensory', 'sampleDetails', sampleId],
  },

  // Cleaning
  cleaning: {
    all: ['cleaning'],
    cleanlinessItems: {
      list: (params) => ['cleaning', 'cleanlinessItems', 'list', params],
      detail: (id) => ['cleaning', 'cleanlinessItems', 'detail', id],
    },
    status: {
      all: ['cleaning', 'status'],
      list: (params) => ['cleaning', 'status', 'list', params],
      availableItems: (params) => ['cleaning', 'status', 'available-items', params],
    },
  },

  // Maintenance
  maintenance: {
    all: ['maintenance'],
    maintenanceItems: {
      list: (params) => ['maintenance', 'maintenanceItems', 'list', params],
      detail: (id) => ['maintenance', 'maintenanceItems', 'detail', id],
    },
    maintenanceSchedules: {
      all: ['maintenance', 'maintenanceSchedules'],
      overview: (year, filters = {}) => ['maintenance', 'maintenanceSchedules', 'overview', year, filters],
    },
  },
};

