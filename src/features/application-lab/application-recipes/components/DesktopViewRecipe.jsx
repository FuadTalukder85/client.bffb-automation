import React from "react";
import { ChevronLeft, ChevronRight, Plus, GitFork } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import BasicInformation from "./BasicInformation";
import BenchmarkCard from "./BenchmarkCard";
import RecipeDetailsTable from "./RecipeDetailsTable";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { BackButton } from "@/components/ui/BackButton";

export default function DesktopViewRecipe({
  project,
  statusSourceProject,
  recipe,
  currentVersion,
  setCurrentVersion,
  versions = [],
  searchQuery,
  setSearchQuery,
  formatDate,
  handleEdit,
  handleSave,
  handleCancel,
  handleRecipeChange,
  handleProjectChange,
  handleDownload,
  handleExportTypeInternal,
  handleExportTypeForClient,
  handleFinalize,
  handleOpenFinalizeModal,
  onSaveSpecificFields,
  handleBack,
  handleCreateVersion,
  handleIngredientsChange,
  handleSOPChange,
  isEditMode,
  sopData,
  recipeFormat,
  isFinalized,
  isTypeChangeEligible,
  onChangeRecipeType,
  isSaving,
  canExportRecipe,
  handlePrepareSample,
  handleViewDownloadHistory,
}) {
  const toUiVersionNumber = (version) => {
    const numericVersion = Number(version);
    return Number.isFinite(numericVersion) ? numericVersion + 1 : version;
  };

  const versionNumbers = React.useMemo(
    () => [...new Set((versions || []).map((item) => item.version))].sort((a, b) => a - b),
    [versions]
  );

  const minVersion = versionNumbers.length ? versionNumbers[0] : currentVersion ?? 0;
  const maxVersion = versionNumbers.length ? versionNumbers[versionNumbers.length - 1] : currentVersion ?? 0;

  const creatorName =
    recipe?.createdBy?.name ||
    recipe?.creator?.name ||
    recipe?.createdBy ||
    project?.raisedBy ||
    "-";

  const refProjectCode =
    recipe?.copiedFromRecipe?.recipeCode ||
    project?.projectCode ||
    project?.masterProject?.code ||
    recipe?.project?.projectCode ||
    recipe?.project?.masterProject?.code ||
    "-";

  const currentRecipeCode = recipe?.recipeCode || "-";
  const formatLabel = (recipeFormat || recipe?.recipeType || "bakery").toLowerCase();

  return (
    <div className="flex flex-col w-full min-h-full space-y-6">
      {/* Top Header (Image 1 & 2) */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Back + Title + Recipe Code + Search + Theme */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton onClick={handleBack} />

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {recipe?.recipeName || recipe?.name || "-"}
            </h1>

            {currentRecipeCode !== "-" && (
              <span className="px-3 py-0.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-xs">
                {currentRecipeCode}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
            />
            <ThemeToggle />
          </div>
        </div>

        {/* Row 2: Ref + Format + Created By */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
            <span>Ref:</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold">
              {refProjectCode}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
            <span>Format:</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold">
              {formatLabel}
            </span>
          </div>

          <div className="text-gray-700 dark:text-gray-300">
            Created By <span className="font-bold text-gray-900 dark:text-white">{creatorName}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-white dark:bg-[#0D0B14] border border-[#EEEBF4] dark:border-primary/40 rounded-3xl p-6 shadow-sm">
        {/* Expandable Cards Row: Basic Information & Benchmark (Side-by-side, initially collapsed as in Image 1) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <BasicInformation
            project={project}
            recipe={recipe}
            formatDate={formatDate}
            onSaveSpecificFields={onSaveSpecificFields}
            handleRecipeChange={handleRecipeChange}
            isFinalized={isFinalized}
          />

          <BenchmarkCard
            sopData={sopData}
            recipe={recipe}
            onSaveSpecificFields={onSaveSpecificFields}
            onChange={handleSOPChange}
            isFinalized={isFinalized}
          />
        </div>

        {/* Main Bottom Container: Version Toolbar + Ingredient Table & Additional Sections (Image 1 & 4) */}
        <div className="pt-5">
          {/* Version Toolbar Row */}
          <div className="flex items-center justify-between pb-6 mb-2 border-b border-[#EEEBF4] dark:border-primary/40">
            {/* Left: Version Pagination */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Version</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentVersion?.(Math.max(minVersion, (currentVersion ?? 0) - 1))}
                  disabled={(currentVersion ?? 0) <= minVersion}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FCFBFD] dark:bg-[#151221] border border-[#EEEBF4] dark:border-primary/40 text-gray-700 dark:text-gray-300 hover:bg-[#EFEAF9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {versionNumbers.length > 0 ? (
                    versionNumbers.map((v) => {
                      const isActive = v === currentVersion;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setCurrentVersion?.(v)}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer",
                            isActive
                              ? "bg-[#4B208B] text-white shadow-sm"
                              : "bg-[#FCFBFD] dark:bg-[#151221] border border-[#EEEBF4] dark:border-primary/40 text-gray-700 dark:text-gray-300 hover:bg-[#EFEAF9]"
                          )}
                        >
                          {toUiVersionNumber(v)}
                        </button>
                      );
                    })
                  ) : (
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#4B208B] text-white font-bold text-xs shadow-sm"
                    >
                      1
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentVersion?.(Math.min(maxVersion, (currentVersion ?? 0) + 1))}
                  disabled={(currentVersion ?? 0) >= maxVersion}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FCFBFD] dark:bg-[#151221] border border-[#EEEBF4] dark:border-primary/40 text-gray-700 dark:text-gray-300 hover:bg-[#EFEAF9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Actions (Version, Compare Recipe, Change Recipe Format) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCreateVersion}
                disabled={isEditMode}
                className="px-4 py-2 rounded-full border border-[#D8CBF2] dark:border-primary/40 bg-purple-50/50 dark:bg-primary/20 text-[#4B208B] dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-primary/30 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Version
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded-full bg-[#4B208B] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#3E1B77] transition-all shadow-sm cursor-pointer"
              >
                <GitFork className="w-3.5 h-3.5 rotate-90" />
                Compare Recipe
              </button>

              <button
                type="button"
                onClick={onChangeRecipeType}
                disabled={isEditMode || !isTypeChangeEligible}
                className="px-4 py-2 rounded-full border border-gray-200 dark:border-primary/30 bg-gray-100/50 dark:bg-[#121019] text-gray-400 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Change Recipe Format
              </button>
            </div>
          </div>

          {/* The Multi-Section Recipe Details Table & Versions Content */}
          <RecipeDetailsTable
            data={recipe}
            versions={versions}
            currentVersion={currentVersion}
            isEditMode={isEditMode}
            onIngredientsChange={handleIngredientsChange}
            onRecipeChange={handleRecipeChange}
            sopData={sopData}
            onSOPChange={handleSOPChange}
            onSaveSpecificFields={onSaveSpecificFields}
            onFinalizeVersion={handleOpenFinalizeModal || handleFinalize}
            onFullDownload={handleExportTypeInternal || handleDownload}
            onClientDownload={handleExportTypeForClient || handleDownload}
            onPrepareSample={handlePrepareSample}
            formatDate={formatDate}
            recipeFormat={recipeFormat}
            isFinalized={isFinalized}
          />
        </div>
      </div>
    </div>
  );
}
