import React, { useState } from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination } from "@/components/ui/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useProjects } from "@/hooks/useProjects";
import MobileProjectTaskList from "./components/MobileProjectTaskList";
import { DesktopProjectTaskTable } from "./components/DesktopProjectTaskTable";
import { useNavigate } from "react-router";

const ProjectTask = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch projects from API (not tasks - tasks are shown on the single project page)
  const {
    data: projectsData,
    isLoading,
    error,
  } = useProjects({
    searchTerm: debouncedSearchTerm,
    status: selectedStatus,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Extract projects array and pagination from the query result
  const projects = projectsData?.data ?? [];
  const pagination = projectsData?.pagination;

  // Flatten project data for easier access in components
  const flattenedProjects = projects.map((project) => ({
    ...project,
    name: project.masterProject?.title || "Untitled Project",
    status: project.masterProject?.status || "not_started",
    startDate: project.masterProject?.startDate,
    endDate: project.masterProject?.endDate,
    code: project.masterProject?.code,
    brief: project.masterProject?.brief,
    raisedBy: project.masterProject?.raisedBy,
    purpose: project.masterProject?.purpose,
    deadline: project.masterProject?.deadline,
  }));

  // Status options matching the Figma design
  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Not Started", value: "not_started" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Rework", value: "rework" },
    { label: "Approved", value: "approved" },
    { label: "Paused", value: "paused" },
    { label: "Cancelled", value: "cancelled" },
  ];

  // Get total pages from API pagination
  const totalPages = pagination?.totalPages || 1;
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No projects match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const handleManageTasks = (project) => {
    const projectId = project._id || project.id;
    // Navigate to single project task view to manage tasks for this project
    navigate(`/project-tasks/${projectId}`);
  };

  const errorMessage = error
    ? error?.response?.data?.error || error?.message || "Failed to load projects"
    : "";
  const hasError = Boolean(errorMessage);

  const listProps = {
    projects: flattenedProjects,
    isLoading,
    error: errorMessage,
    errorMessage,
    hasError,
    selectedFilter: selectedStatus,
    searchTerm: debouncedSearchTerm,
    onManageTasks: handleManageTasks,
    currentPage,
    itemsPerPage,
    totalPages,
    onPageChange: handlePageChange,
    onItemsPerPageChange: handleItemsPerPageChange,
    noDataMessage,
    noDataDescription,
  };

  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Page Header & Search & Theme Toggle(Desktop Only) */}
      <div className="flex-none flex items-center justify-between ms-0 lg:ms-5">
        <PageHeader
          title="Project Tasks"
          className={"text-heading py-4 pb-6 md:p-0 md:m-0"}
        />

        {/* Search & Theme Toggle(Desktop Only) */}
        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Filter Input */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search..."
        filterValue={selectedStatus}
        onFilterChange={handleStatusChange}
        filterOptions={statusOptions}
        hideOnDesktop={true}
        defaultFilterValue="all"
      />

      {/* Desktop Filter Input */}
      <div className="flex-none hidden md:block ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        <div className="flex items-center justify-between">
          <DesktopFilterPills
            value={selectedStatus}
            options={statusOptions}
            onChange={handleStatusChange}
          />
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Mobile UI */}
        <MobileProjectTaskList {...listProps} />

        {/* Desktop UI */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
          <DesktopProjectTaskTable 
            {...listProps} 
            emptyState={
              hasError ? (
                <div className="py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : null
            }
          />
        </div>
      </div>

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </section>
  );
};

export default ProjectTask;
