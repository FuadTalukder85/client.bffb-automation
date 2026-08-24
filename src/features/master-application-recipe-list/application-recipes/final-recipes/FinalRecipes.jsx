import React, { useState, useMemo, useCallback } from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NoData } from "@/components/ui/NoData";
import { useFinalRecipes } from "@/hooks/useRecipes";
import { useProjectFilterOptions } from "@/hooks/useProjectFilters";
import { purposeFilterOptions } from "@/features/project-overview/shared/constants/projectOptions";
import { useDebounce } from "@/hooks/useDebounce";
import { recipeAPI } from "@/services/recipeService";
import DesktopFinalRecipeTable from "./components/DesktopFinalRecipeTable";
import MobileFinalRecipeList from "./components/MobileFinalRecipeList";
import { DesktopFinalRecipeTableSkeleton } from "./components/DesktopFinalRecipeTableSkeleton";
import { MobileFinalRecipeCardSkeleton } from "./components/MobileFinalRecipeCardSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { ArchiveFinalRecipeModal } from "./components/ArchiveFinalRecipeModal";
import { RestoreFinalRecipeModal } from "./components/RestoreFinalRecipeModal";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { Upload, Download, CirclePlus, Loader, Check, PlusCircleIcon } from "lucide-react";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { UploadCSVModal } from "./components/UploadCSVModal";
import { UploadSuccessModal } from "./components/UploadSuccessModal";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import CreateRecipeModal from "@/features/application-lab/application-recipes/components/CreateRecipeModal";
import MobileBulkActionBar from "@/components/ui/MobileBulkActionBar";

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

export default function FinalRecipes() {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadSuccessModalOpen, setIsUploadSuccessModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipeType, setSelectedRecipeType] = useState("all");
  const [selectedState, setSelectedState] = useState("true");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  React.useEffect(() => {
    setSelectedRowIds([]);
  }, [currentPage, searchTerm, selectedRecipeType, selectedState, selectedCategory, selectedSubcategory, selectedSubSubcategory, selectedCreator, selectedPurpose]);

  const [sorting, setSorting] = useState([]);
  const [isCreateRecipeModalOpen, setIsCreateRecipeModalOpen] = useState(false);

  // Persistence from sessionStorage
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const saved = sessionStorage.getItem("finalRecipes_visibility");
    return saved ? JSON.parse(saved) : {};
  });
  const [columnPinning, setColumnPinning] = useState(() => {
    const saved = sessionStorage.getItem("finalRecipes_pinning");
    return saved ? JSON.parse(saved) : {};
  });
  const [columnSizing, setColumnSizing] = useState(() => {
    const saved = sessionStorage.getItem("finalRecipes_sizing");
    return saved ? JSON.parse(saved) : {};
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Persistence effects
  React.useEffect(() => {
    sessionStorage.setItem(
      "finalRecipes_visibility",
      JSON.stringify(columnVisibility)
    );
  }, [columnVisibility]);

  React.useEffect(() => {
    sessionStorage.setItem(
      "finalRecipes_pinning",
      JSON.stringify(columnPinning)
    );
  }, [columnPinning]);

  React.useEffect(() => {
    sessionStorage.setItem("finalRecipes_sizing", JSON.stringify(columnSizing));
  }, [columnSizing]);

  const handleResetStyling = () => {
    setColumnVisibility({});
    setColumnPinning({});
    setColumnSizing({});
    sessionStorage.removeItem("finalRecipes_visibility");
    sessionStorage.removeItem("finalRecipes_pinning");
    sessionStorage.removeItem("finalRecipes_sizing");
  };

  // Convert TanStack Table sorting format to API format
  const sortBy = sorting.length > 0 ? sorting[0].id : "";
  const sortOrder =
    sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "";

  const {
    data: recipesData,
    isLoading,
    error,
    refetch,
  } = useFinalRecipes({
    searchTerm: debouncedSearchTerm,
    recipeType: selectedRecipeType,
    isActive: selectedState,
    category: selectedCategory,
    subCategory: selectedSubcategory,
    subSubCategory: selectedSubSubcategory,
    createdBy: selectedCreator,
    purpose: selectedPurpose,
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
  });

  const { categories, subcategories, subSubcategories, users } = useProjectFilterOptions(selectedCategory, selectedSubcategory, recipesData?.filterOptions);

  // Extract recipes array and pagination from the query result
  const recipes = recipesData?.data ?? [];
  const pagination = recipesData?.pagination;

  const errorMessage = error ? (error?.response?.data?.error || error?.message || "Failed to load recipes") : "";
  const hasError = Boolean(errorMessage);

  const handleSearchChange = (value) => {
    const searchValue =
      typeof value === "object" && value.target ? value.target.value : value;
    setSearchTerm(searchValue);
    setCurrentPage(1);
  };

  const handleRecipeTypeChange = useCallback((value) => {
    setSelectedRecipeType(value);
    setCurrentPage(1);
  }, []);

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

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

  const handleSortingChange = useCallback((newSorting) => {
    setSorting(newSorting);
    setCurrentPage(1);
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
      if (Array.isArray(recipe)) {
        const results = await Promise.allSettled(
          recipe.map((r) => recipeAPI.archiveRecipe(r._id || r.id))
        );
        const succeeded = results.filter((res) => res.status === "fulfilled").length;
        const failed = results.filter((res) => res.status === "rejected");
        if (succeeded > 0) toast.success(`${succeeded} recipe(s) archived successfully`);
        if (failed.length > 0) toast.error(`Failed to archive ${failed.length} recipe(s)`);
        setSelectedRowIds([]);
      } else {
        const response = await recipeAPI.archiveRecipe(recipe._id || recipe.id);
        toast.success(
          getResponseMessage(response, "Final recipe archived successfully")
        );
      }
      setIsArchiveModalOpen(false);
      setSelectedRecipe(null);
      refetch();
    } catch (error) {
      console.error("Failed to archive recipe:", error);
      toast.error(getErrorMessage(error, "Failed to archive final recipe"));
    }
  };

  const handleRestoreConfirm = async (recipe) => {
    try {
      const response = await recipeAPI.restoreRecipe(recipe._id);
      setIsRestoreModalOpen(false);
      setSelectedRecipe(null);
      refetch();
      toast.success(
        getResponseMessage(response, "Final recipe restored successfully")
      );
    } catch (error) {
      console.error("Failed to restore recipe:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to restore final recipe"
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
      icon: <CirclePlus className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
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
    ],
    [
      selectedRecipeType,
      selectedState,
      selectedCategory,
      selectedSubcategory,
      selectedSubSubcategory,
      selectedCreator,
      selectedPurpose,
      categories,
      subcategories,
      subSubcategories,
      users,
      handleRecipeTypeChange,
      handleStateChange,
      handleCategoryChange,
      handleSubcategoryChange,
      handleSubSubcategoryChange,
      handleCreatorChange,
      handlePurposeChange,
    ]
  );

  const handleBackToApplicationRecipes = () => {
    navigate("/application-recipes", { replace: true });
  };

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)] md:overflow-hidden">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <div className="flex items-center gap-3">
          <BackButton onClick={handleBackToApplicationRecipes} />
          <PageHeader
            title="Final Recipes"
            className="py-4 text-heading md:p-0 md:m-0"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Add Button (Mobile Only) */}
          {selectedRecipeType !== "all" && (
            <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full! items-center shadow-sm md:hidden">
              <Button
                size="icon"
                onClick={handleAdd}
                title="Add Recipe"
                className="w-10 h-8 transition-colors bg-transparent border-none shadow-none cursor-pointer rounded-e-full"
              >
                <PlusCircleIcon className="w-5 desktop-page-btn text-background" />
              </Button>
            </div>
          )}

          <div className="items-center hidden gap-2 md:flex">
            <SearchInput
              placeholder="Search final recipes..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <SearchFilterBar
        searchPlaceholder="Search final recipes..."
        hideOnDesktop={true}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
        className="flex-none"
      />

      <div className="hidden md:flex justify-between items-center ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 gap-4">
        {/* Left Side: Category tabs */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto whitespace-nowrap max-w-full scrollbar-none">
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

        {/* Right Side: Active/Archived Filter & Add Button */}
        <div className="flex items-center gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4">
           {selectedRecipeType !== "all" && (
            <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full! items-center shadow-sm">
              <Button
                size="icon"
                onClick={handleAdd}
                title="Add Recipe"
                className="transition-colors bg-transparent border-none shadow-none cursor-pointer rounded-e-full"
              >
                <PlusCircleIcon className="w-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 desktop-page-btn text-background" />
              </Button>
            </div>
          )}
          <DesktopFilterPills
            value={selectedState}
            options={stateOptions}
            onChange={handleStateChange}
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <>
            <div className="mt-6 md:hidden">
              <MobileFinalRecipeCardSkeleton cards={itemsPerPage} />
            </div>
            <div className="hidden px-2 border shadow-sm md:flex-1 md:flex md:flex-col md:min-h-0 bg-background border-border/50">
              <DesktopFinalRecipeTableSkeleton
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
                <MobileFinalRecipeList
                  recipes={recipes}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onRefresh={refetch}
                  isLoading={isLoading}
                  selectedRowIds={selectedRowIds}
                  onSelectChange={setSelectedRowIds}
                />
              ) : hasError ? (
                <div className="py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : (
                <NoData
                  message="No Records Found"
                  description={searchTerm
                    ? `No final recipes match "${searchTerm}". Try adjusting your search.`
                    : "No final recipes available yet."}
                />
              )}
            </div>

            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
              <DesktopFinalRecipeTable
                recipes={recipes || []}
                selectedRowIds={selectedRowIds}
                onSelectionChange={setSelectedRowIds}
                onBulkArchiveClick={() => {
                  const selectedObjects = recipes.filter(r => selectedRowIds.includes(r._id || r.id));
                  setSelectedRecipe(selectedObjects);
                  setIsArchiveModalOpen(true);
                }}
                isArchived={selectedState === "false"}
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
                  console.log(
                    "Final recipe updated locally",
                    rowIndex,
                    columnId,
                    value
                  );
                }}
                noDataMessage="No Records Found"
                noDataDescription={searchTerm
                  ? `No final recipes match "${searchTerm}". Try adjusting your search.`
                  : "No final recipes available yet."}
                errorMessage={errorMessage}
                hasError={hasError}
              />
            </div>
          </>
        )}

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

      <ArchiveFinalRecipeModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        recipe={selectedRecipe}
        onConfirm={handleArchiveConfirm}
      />

      <RestoreFinalRecipeModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        recipe={selectedRecipe}
        onConfirm={handleRestoreConfirm}
      />

      <UploadCSVModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={handleUploadConfirm}
      />

      <UploadSuccessModal
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
      <MobileBulkActionBar
        selectedCount={selectedRowIds.length}
        onCancel={() => setSelectedRowIds([])}
        onAction={() => {
          const selectedObjects = recipes.filter(r => selectedRowIds.includes(r._id || r.id));
          setSelectedRecipe(selectedObjects);
          setIsArchiveModalOpen(true);
        }}
      />
    </section>
  );
}
