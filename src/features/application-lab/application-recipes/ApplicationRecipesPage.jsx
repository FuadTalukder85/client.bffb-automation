import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { Pagination } from "@/components/ui/Pagination";
import DesktopApplicationRecipesTable from "./components/DesktopApplicationRecipesTable";
import MobileApplicationRecipesCard from "./components/MobileApplicationRecipesCard";
import { ApplicationRecipesTableSkeleton } from "./components/ApplicationRecipesTableSkeleton";
import { MobileApplicationRecipesCardSkeleton } from "./components/MobileApplicationRecipesCardSkeleton";
import CreateRecipeModal from "./components/CreateRecipeModal";
import { useApplicationRecipesLogic } from "./hooks/useApplicationRecipesLogic";
import { statusOptions } from "./constants/projectOptions";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { NoData } from "@/components/ui/NoData";
import { hasPermission } from "@/lib/utils";
import { useProjectFilterOptions } from "@/hooks/useProjectFilters";
import { purposeFilterOptions } from "@/features/project-overview/shared/constants/projectOptions";

const ApplicationRecipesPage = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");

  const runOptions = [
    { label: "Running", value: "running" },
    { label: "Previous", value: "previous" },
    { label: "All", value: "all" },
  ];

  // Permissions
  const { permissions = [] } = useUserPermissions();
  const canViewAllSampleProjects = hasPermission(permissions, PERMISSIONS.RECIPE.VIEW_ALL_MANAGE_RECIPE_PROJECTS);
  const filteredRunOptions = canViewAllSampleProjects ? runOptions : runOptions.filter(o => o.value !== "all");

  const {
    searchTerm,
    selectedStatus,
    runToggle,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    columnPinning,
    setColumnPinning,
    columnSizing,
    setColumnSizing,
    projects,
    pagination,
    isLoading,
    error,
    handleSearchChange,
    handleStatusChange,
    handleRunToggleChange,
    filters,
    filterOptions,
  } = useApplicationRecipesLogic();

  const { categories, subcategories, subSubcategories, users } = useProjectFilterOptions(selectedCategory, selectedSubcategory, filterOptions);

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load projects";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const handleCreateRecipe = (project) => {
    setSelectedProject(project);
    setIsCreateModalOpen(true);
  };

  const handleViewRecipe = (project) => {
    navigate(`/application-lab/application-recipes/${project._id}`, { state: { project } });
  };

  const handleCreateRecipeConfirm = (data) => {
    setIsCreateModalOpen(false);
  };

  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value);
    setSelectedSubcategory("");
    setSelectedSubSubcategory("");
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleSubcategoryChange = useCallback((value) => {
    setSelectedSubcategory(value);
    setSelectedSubSubcategory("");
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleSubSubcategoryChange = useCallback((value) => {
    setSelectedSubSubcategory(value);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleCreatorChange = useCallback((value) => {
    setSelectedCreator(value);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handlePurposeChange = useCallback((value) => {
    setSelectedPurpose(value);
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Mobile filters including run toggle
  const mobileFilters = [
    {
      id: "run-toggle",
      label: "Run Type",
      value: runToggle,
      options: filteredRunOptions,
      onChange: handleRunToggleChange,
    },
    {
      id: "status-filter",
      label: "Status",
      value: selectedStatus,
      options: statusOptions,
      onChange: handleStatusChange,
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
  ];

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <PageHeader
          title="Application Recipes"
          className="py-4 pb-6 text-heading md:p-0 md:m-0"
        />

        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        searchPlaceholder="Search projects..."
        filters={mobileFilters}
        hideOnDesktop={true}
        defaultFilterValue="true"
      />

      <div className="flex-none hidden md:block my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 ms-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 border-b border-border">
            {statusOptions.map((tab) => {
              const isSelected = selectedStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleStatusChange(tab.value)}
                  className={`px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px ${
                    isSelected
                      ? ""
                      : "border-transparent text-lighter-text hover:text-foreground"
                  }`}
                  style={{
                    color: isSelected ? tab.textColor : undefined,
                    borderBottomColor: isSelected ? tab.textColor : "transparent"
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-none ms-5">
            <DesktopFilterPills
              value={runToggle}
              options={filteredRunOptions}
              onChange={handleRunToggleChange}
              variant="pills"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden ">
              <MobileApplicationRecipesCardSkeleton cards={5} />
            </div>
            <ApplicationRecipesTableSkeleton
              rows={5}
              columnVisibility={columnVisibility}
              columnPinning={columnPinning}
              columnSizing={columnSizing}
            />
          </>
        ) : (
          <>
            <div className="mt-6 md:hidden">
              {hasError && projects.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : projects.length > 0 ? (
                projects.map((project, index) => (
                  <MobileApplicationRecipesCard
                    key={project._id}
                    project={project}
                    serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                    onViewDetails={handleViewRecipe}
                    onCreateRecipe={handleCreateRecipe}
                  />
                ))
              ) : (
                <NoData
                  message="No Projects Found"
                  description={searchTerm
                    ? `No projects match "${searchTerm}". Try adjusting your search.`
                    : "No projects available yet."}
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopApplicationRecipesTable
                projects={projects}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                onViewDetails={handleViewRecipe}
                onCreateRecipe={handleCreateRecipe}
                sorting={sorting}
                onSortingChange={setSorting}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                columnPinning={columnPinning}
                onColumnPinningChange={setColumnPinning}
                columnSizing={columnSizing}
                onColumnSizingChange={setColumnSizing}
                emptyState={
                  hasError ? (
                    <div className="py-10 text-center text-red-500">{errorMessage}</div>
                  ) : null
                }
                noDataMessage="No Projects Found"
                noDataDescription={searchTerm
                  ? `No projects match "${searchTerm}". Try adjusting your search.`
                  : "No projects available yet."}
              />
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 0 && (
          <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateRecipeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        project={selectedProject}
        onConfirm={handleCreateRecipeConfirm}
      />
    </section>
  );
};

export default ApplicationRecipesPage;
