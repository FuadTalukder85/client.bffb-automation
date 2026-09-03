import { createBrowserRouter, Navigate } from "react-router";
import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

import { AuthLayout } from "./layouts/AuthLayout.jsx";
import { DashboardLayout } from "./layouts/DashboardLayout.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { PermissionRoute } from "./routes/PermissionRoute.jsx";
import { PERMISSIONS } from "./constants/permissions";
import { useReducedMotion } from "framer-motion";
import RawMaterialsPricePage from "./features/application-lab/raw-materials-price/RawMaterialsPricePage.jsx";
import ApplicationRecipesPage from "./features/application-lab/application-recipes/ApplicationRecipesPage.jsx";
import ViewRecipePage from "./features/application-lab/application-recipes/ViewRecipePage.jsx";
import ScaleBatchSamplePage from "./features/application-lab/application-recipes/ScaleBatchSamplePage.jsx";
import PackagingTypesPage from "./features/application-lab/packaging-types/PackagingTypesPage.jsx";
import SamplePreparationAndPackagingPage from "./features/application-lab/sample-preparation-&-packaging/SamplePreparationAndPackagingPage.jsx";


import ApplicationLabRecordsPage from "./features/application-lab/application-lab-records/ApplicationLabRecordsPage.jsx";
import RecordDetailsPage from "./features/application-lab/application-lab-records/RecordDetailsPage.jsx";
import SamplePreparationDetailPage from "./features/application-lab/sample-preparation-&-packaging/SamplePreparationDetailPage.jsx";
import ProductionSchedulePage from "./features/application-lab/production-schedule/ProductionSchedulePage.jsx";
import ManagementReports from "./features/management-overview/management-reports/ManagementReports.jsx";
import ApplicationLabDashboard from "./features/management-overview/application-lab-dashboard/ApplicationLabDashboard.jsx";

// Lazy load auth components
const Login = lazy(() => import("./features/auth/Login.jsx"));
const Register = lazy(() => import("./features/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("./features/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./features/auth/ResetPassword.jsx"));

// Lazy load dashboard components
const ProjectOverview = lazy(() => import("./features/project-overview/ProjectOverview.jsx"));
const EmployeeInvitations = lazy(() => import("./features/invites-and-access/employee-invite/EmployeeInvitations.jsx"));
const EmployeeManagement = lazy(() => import("./features/invites-and-access/employee-management/EmployeeManagement.jsx"));
const History = lazy(() => import("./features/invites-and-access/history/History.jsx"));
const AccessManagement = lazy(() => import("./features/invites-and-access/access-management/AccessManagement.jsx"));
const ProjectTask = lazy(() => import("./features/task-assignments/project-task/ProjectTask.jsx"));
const InternalTask = lazy(() => import("./features/task-assignments/internal-task/InternalTask.jsx"));
const UserProfilePage = lazy(() => import("./features/profile/UserProfilePage.jsx"));
const CreateRole = lazy(() => import("./features/invites-and-access/access-management/CreateRole.jsx"));
const UpdateRole = lazy(() => import("./features/invites-and-access/access-management/UpdateRole.jsx"));
const TeamFormation = lazy(() => import("./features/team-management/team-formation/TeamFormation.jsx"));
const SingleProjectTask = lazy(() => import("./features/task-assignments/project-task/SingleProjectTask/SingleProjectTask.jsx"));
const SingleTeamFormation = lazy(() => import("./features/team-management/team-formation/single-team-formation/SingleTeamFormation.jsx"));
const MainLayout = lazy(() => import("./features/master-application-recipe-list/application-recipes/layout/MainLayout.jsx"));
const FinalRecipes = lazy(() => import("./features/master-application-recipe-list/application-recipes/final-recipes/FinalRecipes.jsx"));
const IndevelopmentRecipes = lazy(() => import("./features/master-application-recipe-list/application-recipes/in-development-recipes/IndevelopmentRecipes.jsx"));
const ApplicationCategories = lazy(() => import("./features/master-application-recipe-list/application-categories/ApplicationCategories.jsx"));
const ApplicationSubcategories = lazy(() => import("./features/master-application-recipe-list/application-categories/ApplicationSubcategories.jsx"));
const ApplicationSubSubcategories = lazy(() => import("./features/master-application-recipe-list/application-categories/ApplicationSubSubcategories.jsx"));
const ApplicationTags = lazy(() => import("./features/master-application-recipe-list/application-categories/ApplicationTags.jsx"));
const BFFProductCodeList = lazy(() => import("./features/master-application-recipe-list/bff-product-code-list/BFFProductCodeList.jsx"));
const AddBFFProductCodePage = lazy(() => import("./features/master-application-recipe-list/bff-product-code-list/AddBFFProductCodePage.jsx"));
const EditBFFProductCodePage = lazy(() => import("./features/master-application-recipe-list/bff-product-code-list/EditBFFProductCodePage.jsx"));
const BFFProductSegmentPage = lazy(() => import("./features/bff-product/segment/BFFProductSegmentPage.jsx"));
const DispatchPage = lazy(() => import("./features/dispatch/DispatchListPage.jsx"));
const MasterProjects = lazy(() => import("./features/project-overview/master-project/MasterProjects.jsx"));
const MasterProjectDetails = lazy(() => import("./features/project-overview/master-project/MasterProjectDetails.jsx"));
const PermissionDebugger = lazy(() => import("./features/permissions-debugger/PermissionDebugger.jsx"));

const ProductDevelopment = lazy(() => import("./features/project-overview/product-development/ProductDevelopment.jsx"));
const ProductDevelopmentDetails = lazy(() => import("./features/project-overview/product-development/ProductDevelopmentDetails.jsx"));

const ApplicationLab = lazy(() => import("./features/project-overview/application-lab/ApplicationLab.jsx"));
const ApplicationLabDetails = lazy(() => import("./features/project-overview/application-lab/ApplicationLabDetails.jsx"));
const Sensory = lazy(() => import("./features/project-overview/sensory/Sensory.jsx"));
const SensoryDetails = lazy(() => import("./features/project-overview/sensory/SensoryDetails.jsx"));
const MasterProjectSchedule = lazy(() => import("./features/project-overview/master-project-schedule/MasterProjectSchedule.jsx"));
const MasterProjectScheduleDetails = lazy(() => import("./features/project-overview/master-project-schedule/MasterProjectScheduleDetails.jsx"));

// eslint-disable-next-line react-refresh/only-export-components
function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="mb-4 lg:mb-1.5 xl:mb-2 2xl:mb-3 3xl:mb-4 lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-4xl font-bold text-red-500">Oops!</h1>
        <p className="mb-4 lg:mb-1.5 xl:mb-2 2xl:mb-3 3xl:mb-4 text-lg lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg">Something went wrong.</p>
        <p className="text-sm text-gray-500">
          Please try refreshing the page or contact support if the problem
          persists.
        </p>
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
// eslint-disable-next-line react-refresh/only-export-components
function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen transition-opacity min-w-screen">
      <div className="text-center">
        <motion.img
          src="/logo.png"
          alt="Loading..."
          className=""
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatType: "loop" }}
        />
      </div>
    </div>
  );
}

// Wrapper component for lazy loaded components
function LazyWrapper({ children }) {
  return <Suspense fallback={<LoadingPage />}>{children}</Suspense>;
}

const invitesAndAccessRoutes = [
  { path: "employee-management", element: <LazyWrapper><EmployeeManagement /></LazyWrapper> },
  { path: "employee-invitations", element: <LazyWrapper><EmployeeInvitations /></LazyWrapper> },
  { path: "access-management", element: <LazyWrapper><AccessManagement /></LazyWrapper> },
  { path: "access-management/create-role", element: <LazyWrapper><CreateRole /></LazyWrapper> },
  { path: "access-management/update-role/:roleId", element: <LazyWrapper><UpdateRole /></LazyWrapper> },
  { path: "access-history", element: <LazyWrapper><History /></LazyWrapper> },
  { path: "project-tasks/:taskId", element: <LazyWrapper><SingleProjectTask /></LazyWrapper> },
  { path: "team-formation/:teamId", element: <LazyWrapper><SingleTeamFormation /></LazyWrapper> },
];


const masterApplicationRecipeRoutes = [
  {
    path: "application-recipes",
    element: <LazyWrapper><MainLayout /></LazyWrapper>,
    children: [
      { path: "final-recipes", element: <LazyWrapper><FinalRecipes /></LazyWrapper> },
      { path: "in-development-recipes", element: <LazyWrapper><IndevelopmentRecipes /></LazyWrapper> },
    ],
  },
  {
    path: "application-categories",
    children: [
      { path: "", element: <LazyWrapper><ApplicationCategories /></LazyWrapper> },
      { path: ":categoryId/subcategories", element: <LazyWrapper><ApplicationSubcategories /></LazyWrapper> },
      { path: ":categoryId/subcategories/:subCategoryId/subsubcategories", element: <LazyWrapper><ApplicationSubSubcategories /></LazyWrapper> },
      { path: ":categoryId/subcategories/:subCategoryId/tags", element: <LazyWrapper><ApplicationTags /></LazyWrapper> },
    ]
  },
  {
    path: "bff-product-code-list",
    element: <Navigate to="/bff-product/list" replace />,
  }
];

const bffProductRoutes = [
  {
    path: "bff-product/list",
    element: (
      <PermissionRoute requiredPermission={PERMISSIONS.BFF_PRODUCT.READ}>
        <LazyWrapper><BFFProductCodeList /></LazyWrapper>
      </PermissionRoute>
    ),
  },
  {
    path: "bff-product/add",
    element: (
      <PermissionRoute requiredPermission={PERMISSIONS.BFF_PRODUCT.CREATE}>
        <LazyWrapper><AddBFFProductCodePage /></LazyWrapper>
      </PermissionRoute>
    ),
  },
  {
    path: "bff-product/:id",
    element: (
      <PermissionRoute requiredPermission={PERMISSIONS.BFF_PRODUCT.UPDATE}>
        <LazyWrapper><EditBFFProductCodePage /></LazyWrapper>
      </PermissionRoute>
    ),
  },
  {
    path: "bff-product/segment",
    element: (
      <PermissionRoute requiredPermission={PERMISSIONS.BFF_PRODUCT_SEGMENT.READ}>
        <LazyWrapper><BFFProductSegmentPage /></LazyWrapper>
      </PermissionRoute>
    ),
  },
  {
    path: "bff-product/segment/:kind",
    element: (
      <PermissionRoute requiredPermission={PERMISSIONS.BFF_PRODUCT_SEGMENT.READ}>
        <LazyWrapper><BFFProductSegmentPage /></LazyWrapper>
      </PermissionRoute>
    ),
  },
];


const projectOverviewRoutes = [
  {
    path: "project-overview",
    children: [
      { path: "master-projects", element: <LazyWrapper><MasterProjects /></LazyWrapper> },
      { path: "master-projects/:projectId", element: <LazyWrapper><MasterProjectDetails /></LazyWrapper> },
      { path: "product-development", element: <LazyWrapper><ProductDevelopment /></LazyWrapper> },
      { path: "product-development/:projectId", element: <LazyWrapper><ProductDevelopmentDetails /></LazyWrapper> },
      { path: "application-lab", element: <LazyWrapper><ApplicationLab /></LazyWrapper> },
      { path: "application-lab/:projectId", element: <LazyWrapper><ApplicationLabDetails /></LazyWrapper> },
      { path: "sensory", element: <LazyWrapper><Sensory /></LazyWrapper> },
      { path: "sensory/:projectId", element: <LazyWrapper><SensoryDetails /></LazyWrapper> },
      { path: "master-project-schedule", element: <LazyWrapper><MasterProjectSchedule /></LazyWrapper> },
      { path: "master-project-schedule/:projectId", element: <LazyWrapper><MasterProjectScheduleDetails /></LazyWrapper> },
    ]
  }
];

const applicationLabRoutes = [
  {
    path: "application-lab",
    children: [
      { path: "raw-materials-price-list", element: <LazyWrapper><RawMaterialsPricePage /></LazyWrapper> },
      { path: "application-recipes", element: <LazyWrapper><ApplicationRecipesPage /></LazyWrapper> },
      { path: "application-recipes/version/:recipeId", element: <LazyWrapper><ViewRecipePage /></LazyWrapper> },
      { path: "application-recipes/sample/:recipeId/:version", element: <LazyWrapper><ScaleBatchSamplePage /></LazyWrapper> },
      { path: "application-recipes/sample/:recipeId", element: <LazyWrapper><ScaleBatchSamplePage /></LazyWrapper> },
      { path: "application-recipes/:projectId/sample/:version", element: <LazyWrapper><ScaleBatchSamplePage /></LazyWrapper> },
      { path: "application-recipes/:projectId/sample", element: <LazyWrapper><ScaleBatchSamplePage /></LazyWrapper> },
      { path: "application-recipes/:projectId", element: <LazyWrapper><ViewRecipePage /></LazyWrapper> },
      { path: "packaging-types", element: <LazyWrapper><PackagingTypesPage /></LazyWrapper> },
      { path: "sample-preparation-and-packaging", element: <LazyWrapper><SamplePreparationAndPackagingPage /></LazyWrapper> },
      { path: "sample-preparation-and-packaging/:projectId", element: <LazyWrapper><SamplePreparationDetailPage /></LazyWrapper> },
      { path: "application-lab-records", element: <LazyWrapper><ApplicationLabRecordsPage /></LazyWrapper> },
      { path: "application-lab-records/:id", element: <LazyWrapper><RecordDetailsPage /></LazyWrapper> },
      {
        path: "production-schedule",
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.PRODUCTION_SCHEDULE.READ}>
            <LazyWrapper><ProductionSchedulePage /></LazyWrapper>
          </PermissionRoute>
        ),
      },
    
    ]
  }
];

const SensoryForms = lazy(() => import("./features/sensory-testing/sensory-forms/SensoryFormProjectListPage.jsx"));
const SensorySampleListPage = lazy(() => import("./features/sensory-testing/sensory-forms/SensoryFormSampleListPage.jsx"));
const SensoryFormDetailPage = lazy(() => import("./features/sensory-testing/sensory-forms/SensoryFormDetailPage.jsx"));
const SensoryTopSheet = lazy(() => import("./features/sensory-testing/sensory-top-sheet/SensoryTopSheet.jsx"));
const SensoryTopSheetSampleListPage = lazy(() => import("./features/sensory-testing/sensory-top-sheet/SensoryTopSheetSampleListPage.jsx"));
const SensoryTopSheetDetailPage = lazy(() => import("./features/sensory-testing/sensory-top-sheet/SensoryTopSheetDetailPage.jsx"));
const ProjectListForShelfLifeTestRecords = lazy(() => import("./features/shelf-life-testing/test-records/ProjectListForShelfLifeTestRecords.jsx"));
const SampleListForShelfLifeTestRecord = lazy(() => import("./features/shelf-life-testing/test-records/SampleListForShelfLifeTestRecord.jsx"));
const ShelfLifeTestRecord = lazy(() => import("./features/shelf-life-testing/test-records/components/shelf-life-test-record/ShelfLifeTestRecord.jsx"));
const MonitoringHistoryPage = lazy(() => import("./features/shelf-life-testing/monitoring-history/MonitoringHistoryPage.jsx"));

const CleanlinessItemsList = lazy(() => import("./features/cleaning/cleanliness-items-list/CleanlinessItemsListPage.jsx"));
const CleaningStatus = lazy(() => import("./features/cleaning/cleaning-status/CleaningStatusPage.jsx"));

const MaintenanceItemsList = lazy(() => import("./features/maintenance-items-list/MaintenanceItemsListPage.jsx"));
const MaintenanceCalendar = lazy(() => import("./features/maintenance-calendar/MaintenanceCalendarPage.jsx"));
const ScheduleMaintenance = lazy(() => import("./features/maintenance-calendar/ScheduleMaintenancePage.jsx"));
const SingleMaintenanceSchedule = lazy(() => import("./features/maintenance-calendar/SingleMaintenanceSchedulePage.jsx"));

const sensoryTestingRoutes = [
  {
    path: "sensory-testing",
    children: [
      { path: "sensory-forms", element: <LazyWrapper><SensoryForms /></LazyWrapper> },
      { path: "sensory-forms/:projectId", element: <LazyWrapper><SensorySampleListPage /></LazyWrapper> },
      { path: "sensory-forms/:projectId/:sampleId", element: <LazyWrapper><SensoryFormDetailPage /></LazyWrapper> },
      { path: "sensory-top-sheet", element: <LazyWrapper><SensoryTopSheet /></LazyWrapper> },
      { path: "sensory-top-sheet/:projectId", element: <LazyWrapper><SensoryTopSheetSampleListPage /></LazyWrapper> },
      { path: "sensory-top-sheet/:projectId/:sampleId", element: <LazyWrapper><SensoryTopSheetDetailPage /></LazyWrapper> },
    ]
  }
];

const cleaningRoutes = [
  {
    path: "cleaning",
    children: [
      {
        path: "cleanliness-items-list",
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.CLEANING.READ}>
            <LazyWrapper><CleanlinessItemsList /></LazyWrapper>
          </PermissionRoute>
        ),
      },
      {
        path: "cleaning-status",
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.CLEANING.READ}>
            <LazyWrapper><CleaningStatus /></LazyWrapper>
          </PermissionRoute>
        ),
      },
    ]
  }
];

const maintenanceRoutes = [
  {
    path: "maintenance",
    children: [
      {
        path: "maintenance-items-list",
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.MAINTENANCE.READ}>
            <LazyWrapper><MaintenanceItemsList /></LazyWrapper>
          </PermissionRoute>
        ),
      },
      {
        path: "maintenance-calendar",
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.MAINTENANCE.READ}>
            <LazyWrapper><MaintenanceCalendar /></LazyWrapper>
          </PermissionRoute>
        ),
      },
      {
        path: "maintenance-calendar/:itemId",
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.MAINTENANCE.READ}>
            <LazyWrapper><SingleMaintenanceSchedule /></LazyWrapper>
          </PermissionRoute>
        ),
      },
      {
        path: "schedule-maintenance",
        element: (
          <PermissionRoute requiredPermission={PERMISSIONS.MAINTENANCE.READ}>
            <LazyWrapper><ScheduleMaintenance /></LazyWrapper>
          </PermissionRoute>
        ),
      },
    ]
  }
];

const shelfLifeTestingRoutes = [
  {
    path: "shelf-life-testing",
    children: [
      { path: "test-records", element: <LazyWrapper><ProjectListForShelfLifeTestRecords /></LazyWrapper> },
      { path: "test-records/:projectId", element: <LazyWrapper><SampleListForShelfLifeTestRecord /></LazyWrapper> },
      { path: "test-records/:projectId/:sampleId", element: <LazyWrapper><ShelfLifeTestRecord /></LazyWrapper> },
      { path: "monitoring-history", element: <LazyWrapper><MonitoringHistoryPage /></LazyWrapper> },
    ]
  }
];

export const router = createBrowserRouter([
  {
    // Root redirect to login
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    // === AUTH LAYOUT ===
    path: "/",
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "login", element: <LazyWrapper><Login /></LazyWrapper> },
      { path: "register", element: <LazyWrapper><Register /></LazyWrapper> },
      { path: "forgot-password", element: <LazyWrapper><ForgotPassword /></LazyWrapper> },
      { path: "reset-password", element: <LazyWrapper><ResetPassword /></LazyWrapper> },
    ],
  },
  {
    // === DASHBOARD LAYOUT (PROTECTED) ===
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <DashboardLayout />, // UI: sidebar + topbar
        errorElement: <ErrorPage />,
        children: [
          // Dashboard routes
          { path: "dashboard", element: <LazyWrapper><ProjectOverview /></LazyWrapper> },
          { path: "project-overview", element: <LazyWrapper><ProjectOverview /></LazyWrapper> },
          { path: "main-dashboard", element: <LazyWrapper><ManagementReports /></LazyWrapper> },
          { path: "application-lab-dashboard", element: <LazyWrapper><ApplicationLabDashboard /></LazyWrapper> },
          { path: "team-formation", element: <LazyWrapper><TeamFormation /></LazyWrapper> },
          { path: "project-tasks", element: <LazyWrapper><ProjectTask /></LazyWrapper> },
          { path: "internal-tasks", element: <LazyWrapper><InternalTask /></LazyWrapper> },
          { path: "profile", element: <LazyWrapper><UserProfilePage /></LazyWrapper> },
          ...invitesAndAccessRoutes,
          ...masterApplicationRecipeRoutes,
          ...bffProductRoutes,
          ...projectOverviewRoutes,
          ...applicationLabRoutes,
          ...sensoryTestingRoutes,
          ...cleaningRoutes,
          ...maintenanceRoutes,
          ...shelfLifeTestingRoutes,
          // dispatch page
          { path: "dispatch", element: <LazyWrapper><DispatchPage /></LazyWrapper> },
          { path: "permission-debugger", element: <LazyWrapper><PermissionDebugger /></LazyWrapper> },

        ],
      },
    ],
  },
]);

