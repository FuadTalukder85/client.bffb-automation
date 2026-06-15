import React, { useState, useMemo, useCallback } from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NoData } from "@/components/ui/NoData";
import { useInDevelopmentRecipes } from "@/hooks/useRecipes";
import { useDebounce } from "@/hooks/useDebounce";
import { recipeAPI } from "@/services/recipeService";
import DesktopInDevelopmentRecipeTable from "./components/DesktopInDevelopmentRecipeTable";
import MobileInDevelopmentRecipeList from "./components/MobileInDevelopmentRecipeList";
import { DesktopInDevelopmentRecipeTableSkeleton } from "./components/DesktopInDevelopmentRecipeTableSkeleton";
import { MobileInDevelopmentRecipeCardSkeleton } from "./components/MobileInDevelopmentRecipeCardSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { ArchiveInDevelopmentRecipeModal } from "./components/ArchiveInDevelopmentRecipeModal";
import { RestoreInDevelopmentRecipeModal } from "./components/RestoreInDevelopmentRecipeModal";
import { UploadInDevelopmentCSVModal } from "./components/UploadInDevelopmentCSVModal";
import { UploadInDevelopmentSuccessModal } from "./components/UploadInDevelopmentSuccessModal";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Loader, Check, Upload, Download, CirclePlus } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import CreateRecipeModal from "@/features/application-lab/application-recipes/components/CreateRecipeModal";

const recipeTypeOptions = [
  { label: "All", value: "all" },
  { label: "Bakery", value: "bakery" },
  { label: "Beverage", value: "beverage" },
  { label: "Beverage PSD", value: "beveragePsd" },
  { label: "Confectionary", value: "confectionary" },
];

const stateOptions = [
  { label: "Active", value: "true" },
  { label: "Archived", value: "false" },
  { label: "All", value: "all" },
];

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export default function IndevelopmentRecipes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipeType, setSelectedRecipeType] = useState("all");
  const [selectedState, setSelectedState] = useState("true");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const saved = sessionStorage.getItem("inDevelopmentRecipes_visibility");
    return saved ? JSON.parse(saved) : {};
  });
  const [columnPinning, setColumnPinning] = useState(() => {
    const saved = sessionStorage.getItem("inDevelopmentRecipes_pinning");
    return saved ? JSON.parse(saved) : {};
  });
  const [columnSizing, setColumnSizing] = useState(() => {
    const saved = sessionStorage.getItem("inDevelopmentRecipes_sizing");
    return saved ? JSON.parse(saved) : {};
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadSuccessModalOpen, setIsUploadSuccessModalOpen] =
    useState(false);
  const [isCreateRecipeModalOpen, setIsCreateRecipeModalOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Persistence effects
  React.useEffect(() => {
    sessionStorage.setItem(
      "inDevelopmentRecipes_visibility",
      JSON.stringify(columnVisibility)
    );
  }, [columnVisibility]);

  React.useEffect(() => {
    sessionStorage.setItem(
      "inDevelopmentRecipes_pinning",
      JSON.stringify(columnPinning)
    );
  }, [columnPinning]);

  React.useEffect(() => {
    sessionStorage.setItem(
      "inDevelopmentRecipes_sizing",
      JSON.stringify(columnSizing)
    );
  }, [columnSizing]);

  // const handleResetStyling = () => {
  //   setColumnVisibility({});
  //   setColumnPinning({});
  //   setColumnSizing({});
  //   sessionStorage.removeItem("inDevelopmentRecipes_visibility");
  //   sessionStorage.removeItem("inDevelopmentRecipes_pinning");
  //   sessionStorage.removeItem("inDevelopmentRecipes_sizing");
  // };

  // Convert TanStack Table sorting format to API format
  const sortBy = sorting.length > 0 ? sorting[0].id : "";
  const sortOrder =
    sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

  const {
    data: recipesData,
    isLoading,
    error,
    refetch,
  } = useInDevelopmentRecipes({
    searchTerm: debouncedSearchTerm,
    recipeType: selectedRecipeType,
    isActive: selectedState,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  // Extract recipes array and pagination from the query result
  const recipes = recipesData?.data ?? [];
  const pagination = recipesData?.pagination;

  const errorMessage = error ? (error?.response?.data?.error || error?.message || "Failed to load recipes") : "";
  const hasError = Boolean(errorMessage);

  const handleSearchChange = (value) => {
    // Handle both event objects and direct values
    const searchValue =
      typeof value === "object" && value.target ? value.target.value : value;
    setSearchTerm(searchValue);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRecipeTypeChange = useCallback((value) => {
    setSelectedRecipeType(value);
    setCurrentPage(1);
  }, []);

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

  const handleSortingChange = useCallback((newSorting) => {
    setSorting(newSorting);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, []);

  const handleColumnVisibilityChange = useCallback((updater) => {
    setColumnVisibility((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  const handleColumnPinningChange = useCallback((updater) => {
    setColumnPinning((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  const handleColumnSizingChange = useCallback((updater) => {
    setColumnSizing((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top of the list when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const handleArchiveRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setIsArchiveModalOpen(true);
  };

  const handleRestoreRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setIsRestoreModalOpen(true);
  };

  const handleArchiveConfirm = async (recipe) => {
    try {
      const response = await recipeAPI.archiveRecipe(recipe._id);
      setIsArchiveModalOpen(false);
      setSelectedRecipe(null);
      refetch();
      toast.success(
        getResponseMessage(response, "In-development recipe archived successfully")
      );
    } catch (error) {
      console.error("Failed to archive recipe:", error);
      toast.error(getErrorMessage(error, "Failed to archive in-development recipe"));
    }
  };

  const handleRestoreConfirm = async (recipe) => {
    try {
      const response = await recipeAPI.restoreRecipe(recipe._id);
      setIsRestoreModalOpen(false);
      setSelectedRecipe(null);
      refetch();
      toast.success(
        getResponseMessage(response, "In-development recipe restored successfully")
      );
    } catch (error) {
      console.error("Failed to restore recipe:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to restore in-development recipe"
      );
    }
  };

  const handleExport = () => {
    if (isExporting || exportSuccess) return;

    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);

      // Reset success state after 3 seconds
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    }, 2000);
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleAdd = () => {
    setIsCreateRecipeModalOpen(true);
  };

  const handleUploadConfirm = () => {
    setIsUploadModalOpen(false);
    setIsUploadSuccessModalOpen(true);
  };

  const actionButtons = [];

  if (selectedRecipeType !== "all") {
    actionButtons.push({
      icon: <CirclePlus className="w-2 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-2 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
      onClick: handleAdd,
      label: "Add",
    });
  }

  const filters = useMemo(
    () => [
      {
        id: "recipeType",
        value: selectedRecipeType,
        onChange: handleRecipeTypeChange,
        options: recipeTypeOptions,
        placeholder: "All",
      },
      {
        id: "state",
        value: selectedState,
        onChange: handleStateChange,
        options: stateOptions,
        placeholder: "All",
      },
    ],
    [
      selectedRecipeType,
      selectedState,
      handleRecipeTypeChange,
      handleStateChange,
    ]
  );

  const handleBackToApplicationRecipes = () => {
    navigate("/application-recipes", { replace: true });
  };

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)] md:overflow-hidden">
      {/* Page Header & Search & Theme Toggle(Desktop Only) */}
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <div className="flex items-center gap-3">
          <BackButton onClick={handleBackToApplicationRecipes} />

          <PageHeader
            title="In-Development Recipes"
            className=":max-w-full py-4 text-heading md:p-0 md:m-0 "
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Search & Theme Toggle(Desktop Only) */}
          <div className="items-center hidden gap-2 md:flex">
            <SearchInput
              placeholder="Search in-development recipes..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {actionButtons.length > 0 && <ActionButtonsGroup actions={actionButtons} />}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Desktop Header Content (Filters) */}
      <div className="hidden md:flex justify-between ms-5">
        <div className="">
          <div className="flex items-center gap-2 border-b border-border my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
            {recipeTypeOptions.map((tab) => {
              const isSelected = selectedRecipeType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleRecipeTypeChange(tab.value)}
                  className={`px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px ${
                    isSelected
                      ? ""
                      : "border-transparent text-lighter-text hover:text-foreground"
                  }`}
                  style={{
                    color: isSelected ? tab.textColor || "currentColor" : undefined,
                    borderBottomColor: isSelected
                      ? tab.textColor || "currentColor"
                      : "transparent",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="hidden md:flex justify-between items-center mt-1 lg:mt-1.5 xl:mt-2 2xl:mt-2.5 3xl:mt-3">
            <DesktopFilterPills
              value={selectedState}
              options={stateOptions}
              onChange={handleStateChange}
            />
          </div>
      </div>

      {/* Mobile Filter Input */}
      <SearchFilterBar
        searchPlaceholder="Search in-development recipes..."
        hideOnDesktop={true}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
        className="flex-none"
      />

      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden">
              <MobileInDevelopmentRecipeCardSkeleton cards={itemsPerPage} />
            </div>
            <div className="hidden px-2 border shadow-sm md:flex-1 md:flex md:flex-col md:min-h-0 bg-background border-border/50">
              <DesktopInDevelopmentRecipeTableSkeleton
                rows={itemsPerPage}
                columnVisibility={columnVisibility}
                columnPinning={columnPinning}
                columnSizing={columnSizing}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 md:hidden">
              {recipes && recipes.length > 0 ? (
                <MobileInDevelopmentRecipeList
                  recipes={recipes}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onRefresh={refetch}
                  isLoading={isLoading}
                />
              ) : hasError ? (
                <div className="py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : (
                <NoData
                  message="No Records Found"
                  description={searchTerm
                    ? `No in-development recipes match "${searchTerm}". Try adjusting your search.`
                    : "No in-development recipes available yet."}
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopInDevelopmentRecipeTable
                recipes={recipes || []}
                refetch={refetch}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                onArchive={handleArchiveRecipe}
                onRestore={handleRestoreRecipe}
                sorting={sorting}
                onSortingChange={handleSortingChange}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={handleColumnVisibilityChange}
                columnPinning={columnPinning}
                onColumnPinningChange={handleColumnPinningChange}
                columnSizing={columnSizing}
                onColumnSizingChange={handleColumnSizingChange}
                onCellEdit={(rowIndex, columnId, value) => {
                  // Optional: additional local handling
                  console.log(
                    "Recipe updated locally",
                    rowIndex,
                    columnId,
                    value
                  );
                }}
                noDataMessage="No Records Found"
                noDataDescription={searchTerm
                  ? `No in-development recipes match "${searchTerm}". Try adjusting your search.`
                  : "No in-development recipes available yet."}
                errorMessage={errorMessage}
                hasError={hasError}
              />
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages >= 1 && (
          <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>

      {/* Archive Recipe Modal */}
      <ArchiveInDevelopmentRecipeModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        recipe={selectedRecipe}
        onConfirm={handleArchiveConfirm}
      />

      {/* Restore Recipe Modal */}
      <RestoreInDevelopmentRecipeModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        recipe={selectedRecipe}
        onConfirm={handleRestoreConfirm}
      />

      {/* Upload CSV Modal */}
      <UploadInDevelopmentCSVModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={handleUploadConfirm}
      />

      {/* Upload Success Modal */}
      <UploadInDevelopmentSuccessModal
        open={isUploadSuccessModalOpen}
        onOpenChange={setIsUploadSuccessModalOpen}
      />

      <CreateRecipeModal
        isOpen={isCreateRecipeModalOpen}
        onClose={() => setIsCreateRecipeModalOpen(false)}
        project={null}
        isIndependentRecipe={true}
        preSelectedFormat={
          selectedRecipeType === 'beveragePsd' 
            ? 'beverage-psd' 
            : selectedRecipeType === 'confectionary' 
            ? 'confectionery' 
            : selectedRecipeType !== 'all' 
            ? selectedRecipeType 
            : null
        }
      />
    </section>
  );
}
