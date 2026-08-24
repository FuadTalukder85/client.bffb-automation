import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { useProjectsForSensoryForm } from "@/hooks/useSensoryForm";
import DesktopSensoryFormProjectListPage from "./components/DesktopSensoryFormProjectListPage";
import MobileSensoryFormProjectListPage from "./components/MobileSensoryFormProjectListPage";

import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";

import { hasPermission } from "@/lib/utils";
import { useProjectFilterOptions } from "@/hooks/useProjectFilters";
import { purposeFilterOptions } from "@/features/project-overview/shared/constants/projectOptions";

const statusOptions = createFilterOptions(
  buildStatusOptions([
    "Not Started",
    "In Progress",
    "Completed",
    "Rework",
    "Approved",
    "Paused",
    "Canceled",
    "Adopted",
  ]),
  "All"
);

const periodOptions = [
  { value: "running", label: "Running" },
  { value: "previous", label: "Previous" },
  { value: "all", label: "All" },
];

export default function SensoryFormProjectListPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { permissions = [] } = useUserPermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("running");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnPinning, setColumnPinning] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjectsForSensoryForm({
    statusFilter: selectedPeriod,
    searchTerm,
    status: selectedStatus,
    isActive: "true",
    isFeasible: "all",
    page: currentPage,
    limit: itemsPerPage,
    category: selectedCategory,
    subcategory: selectedSubcategory,
    subSubcategory: selectedSubSubcategory,
    createdBy: selectedCreator,
    purpose: selectedPurpose,
  });

  const { categories, subcategories, subSubcategories, users } = useProjectFilterOptions(selectedCategory, selectedSubcategory, projectsResponse?.filterOptions);

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load sensory form projects";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const projects = projectsResponse?.data ?? [];
  const pagination = projectsResponse?.pagination ?? {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
  };
  const totalPages = pagination.totalPages || 0;

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (statusKey) => {
    setSelectedStatus(statusKey);
    setCurrentPage(1);
  };

  const handlePeriodChange = (periodKey) => {
    setSelectedPeriod(periodKey);
    setCurrentPage(1);
  };

  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value);
    setSelectedSubcategory("");
    setSelectedSubSubcategory("");
    setCurrentPage(1);
  }, []);

  const handleSubcategoryChange = useCallback((value) => {
    setSelectedSubcategory(value);
    setSelectedSubSubcategory("");
    setCurrentPage(1);
  }, []);

  const handleSubSubcategoryChange = useCallback((value) => {
    setSelectedSubSubcategory(value);
    setCurrentPage(1);
  }, []);

  const handleCreatorChange = useCallback((value) => {
    setSelectedCreator(value);
    setCurrentPage(1);
  }, []);

  const handlePurposeChange = useCallback((value) => {
    setSelectedPurpose(value);
    setCurrentPage(1);
  }, []);

  const handleViewProjectDetails = (project) => {
    navigate(`/sensory-testing/sensory-forms/${project._id}`, { state: { project } });
  };

  const handleItemsPerPageChange = (val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  // hide the "All" period if user doesn't have view-all permission
  const canViewAll = hasPermission(permissions, PERMISSIONS.SENSORY_FORM.VIEW_ALL_SENSORY_FORM_PROJECTS);
  const periodOptionsFiltered = canViewAll ? periodOptions : periodOptions.filter(o => o.value !== "all");

  const filters = useMemo(() => [
    {
      id: "status",
      label: "Status",
      value: selectedStatus,
      options: statusOptions,
      onChange: handleStatusChange,
    },
    {
      id: "period",
      label: "Period",
      value: selectedPeriod,
      options: periodOptionsFiltered,
      onChange: handlePeriodChange,
    },
    {
      id: "category",
      value: selectedCategory,
      onChange: handleCategoryChange,
      options: [{ label: "All Categories", value: "" }, ...categories],
      placeholder: "All Categories",
    },
    {
      id: "subcategory",
      value: selectedSubcategory,
      onChange: handleSubcategoryChange,
      options: [{ label: "All Subcategories", value: "" }, ...subcategories],
      placeholder: "All Subcategories",
    },
    {
      id: "subSubcategory",
      value: selectedSubSubcategory,
      onChange: handleSubSubcategoryChange,
      options: [{ label: "All Sub-Subcategories", value: "" }, ...subSubcategories],
      placeholder: "All Sub-Subcategories",
    },
    {
      id: "creator",
      value: selectedCreator,
      onChange: handleCreatorChange,
      options: [{ label: "All Creators", value: "" }, ...users],
      placeholder: "All Creators",
    },
    {
      id: "purpose",
      value: selectedPurpose,
      onChange: handlePurposeChange,
      options: purposeFilterOptions,
      placeholder: "All Purpose",
    },
  ], [selectedStatus, selectedPeriod, periodOptionsFiltered, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose, categories, subcategories, subSubcategories, users]);

  const normalizedProjects = useMemo(() => {
    return projects.map((proj) => ({
      id: proj._id,
      sl: "",
      projectCode: proj.masterProject?.code || null,
      projectName: proj.masterProject?.title || null,
      raisedDate: proj.masterProject?.raisedDate || null,
      purpose: proj.masterProject?.purpose || null,
      purposeName: proj.masterProject?.purposeDetails || null,
      objective: proj.masterProject?.objective || null,
      objectiveDetails: proj.masterProject?.objectiveDetails || null,
      applicationCategory: proj.applicationLab?.category?.name || null,
      applicationSubcategory: proj.applicationLab?.subcategory?.name || null,
      applicationSubSubcategory: Array.isArray(proj.applicationLab?.subSubcategory)
        ? proj.applicationLab.subSubcategory.map(s => s?.name || s).filter(Boolean).join(", ")
        : (proj.applicationLab?.subSubcategory?.name || null),
      applicationTags: proj.applicationLab?.tags?.map(tag => tag.name) || [],
      status: proj.sensoryLab?.status || "Not Started",
      ...proj,
    }));
  }, [projects]);

  const commonProps = {
    searchTerm,
    handleSearchChange,
    error,
    isLoading,
    normalizedProjects,
    currentPage,
    totalPages,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    handleViewProjectDetails,
    errorMessage,
    hasError,
    noDataMessage: "No Projects Found",
    noDataDescription: searchTerm
      ? `No projects match "${searchTerm}". Try adjusting your search.`
      : "No projects available yet.",
  };

  if (isMobile) {
    return (
      <section className="flex flex-col min-h-[calc(100vh-6rem)]">
        <MobileSensoryFormProjectListPage
          {...commonProps}
          filters={filters}
        />
      </section>
    );
  }

  return (
    <DesktopSensoryFormProjectListPage
      {...commonProps}
      statusOptions={statusOptions}
      selectedStatus={selectedStatus}
      handleStatusChange={handleStatusChange}
      periodOptions={periodOptionsFiltered}
      selectedPeriod={selectedPeriod}
      handlePeriodChange={handlePeriodChange}
      handleItemsPerPageChange={handleItemsPerPageChange}
      sorting={sorting}
      setSorting={setSorting}
      columnVisibility={columnVisibility}
      setColumnVisibility={setColumnVisibility}
      columnPinning={columnPinning}
      setColumnPinning={setColumnPinning}
      columnSizing={columnSizing}
      setColumnSizing={setColumnSizing}
    />
  );
}
