import React, { useState, useMemo, useCallback } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useNavigate } from "react-router";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { useProjectsForSensoryTopSheet } from "@/hooks/useSensoryForm";
import { useDebounce } from "@/hooks/useDebounce";
import DesktopSensoryTopSheetPage from "./components/DesktopSensoryTopSheetPage";
import MobileSensoryTopSheetPage from "./components/MobileSensoryTopSheetPage";

import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";

import { hasPermission } from "@/lib/utils";

const statusOptions = createFilterOptions(
  buildStatusOptions([
    { label: "Not Started", value: "not-started" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Rework", value: "rework" },
    { label: "Approved", value: "approved" },
    { label: "Paused", value: "paused" },
    { label: "Canceled", value: "canceled" },
    { label: "Adopted", value: "adopted" },
  ]),
  "All"
);

const typeOptions = [
  { label: "Running", value: "running" },
  { label: "Previous", value: "previous" },
  { label: "All", value: "all" },
];

export default function SensoryTopSheet() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { permissions = [] } = useUserPermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("running");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);

  const sortBy = sorting.length > 0 ? sorting[0].id : "";
  const sortOrder = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debouncedDateFrom = useDebounce(dateFrom, 300);
  const debouncedDateTo = useDebounce(dateTo, 300);

  const {
    data: projectsResponse,
    isLoading,
    error,
  } = useProjectsForSensoryTopSheet({
    statusFilter: selectedType,
    searchTerm,
    status: selectedStatus,
    isActive: "true",
    isFeasible: "all",
    dateFrom: debouncedDateFrom,
    dateTo: debouncedDateTo,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load sensory top sheet projects";

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
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No records match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleDateFromChange = (value) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateToChange = (value) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  // hide "All" option when user lacks view-all permission
  const canViewAll = hasPermission(permissions, PERMISSIONS.SENSORY_TOP_SHEET.VIEW_ALL_SENSORY_TOP_SHEET_PROJECTS);
  const typeOptionsFiltered = canViewAll ? typeOptions : typeOptions.filter(o => o.value !== "all");

  const filters = useMemo(() => [
    {
      id: "status",
      label: "Status",
      value: selectedStatus,
      options: statusOptions,
      onChange: handleStatusChange,
      placeholder: "All Status",
    },
    {
      id: "type",
      label: "Type",
      value: selectedType,
      options: typeOptionsFiltered,
      onChange: handleTypeChange,
      placeholder: "Select type...",
    },
  ], [selectedStatus, selectedType, typeOptionsFiltered, handleStatusChange]);

  const filteredData = useMemo(() => {
    return projects.map((proj) => ({
      _id: proj._id,
      id: proj._id,
      projectCode: proj.masterProject?.code || "—",
      projectName: proj.masterProject?.title || "—",
      raisedDate: proj.masterProject?.raisedDate || null,
      appDevStatus: proj.applicationLab?.status || "Not Started",
      appDevDays: proj.applicationLab?.days || 0,
      sensoryStatus: proj.sensoryLab?.status || "Not Started",
      sensoryDays: proj.sensoryLab?.days || 0,
      purpose: proj.masterProject?.purpose || "—",
      purposeName: proj.masterProject?.purposeDetails || "—",
      objective: proj.masterProject?.objective || "—",
      objectiveDetails: proj.masterProject?.objectiveDetails || "—",
      category: proj.applicationLab?.category?.name || "—",
      subcategory: proj.applicationLab?.subcategory?.name || "—",
      subSubcategory: Array.isArray(proj.applicationLab?.subSubcategory)
        ? proj.applicationLab.subSubcategory.map(s => s?.name || s).filter(Boolean).join(", ") || "—"
        : (proj.applicationLab?.subSubcategory?.name || "—"),
      tags: proj.applicationLab?.tags?.map((tag) => tag.name) || [],
      ...proj,
    }));
  }, [projects]);

  const paginatedData = filteredData;

  const handleViewDetails = (project) => {
    const id = project?._id || project?.id || project?.projectId;
    if (id) {
      navigate(`/sensory-testing/sensory-top-sheet/${id}`, { state: { project } });
      return;
    }
    console.log("Viewing details for:", project);
  };

  const commonProps = {
    searchTerm,
    handleSearchChange,
    statusOptions,
    selectedStatus,
    handleStatusChange,
    typeOptions: typeOptionsFiltered,
    selectedType,
    handleTypeChange,
    filteredData: paginatedData,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    totalPages,
    isLoading,
    error,
    errorMessage,
    hasError,
    handleViewDetails,
    noDataMessage,
    noDataDescription,
    filters,
    sorting,
    setSorting,
    dateFrom,
    dateTo,
    handleDateFromChange,
    handleDateToChange,
  };

  if (isMobile) {
    return (
      <section className="flex flex-col min-h-[calc(100vh-6rem)]">
        <MobileSensoryTopSheetPage {...commonProps} />
      </section>
    );
  }

  return <DesktopSensoryTopSheetPage {...commonProps} />;
}
