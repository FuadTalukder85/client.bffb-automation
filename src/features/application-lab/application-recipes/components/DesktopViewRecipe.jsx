import React from "react";
import { ArrowLeft, Download, CheckCircle, Search, Save, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { GoPlus } from "react-icons/go";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import BasicInformation from "./BasicInformation";
import IngredientsTable from "./IngredientsTable";
import SOPAnalytics from "./SOPAnalytics";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { BackButton } from "@/components/ui/BackButton";
import { STATUS_COLOR_PALETTE } from "@/constants/statusColors";

export default function DesktopViewRecipe({
  project,
  statusSourceProject,
  recipe,
  activeTab,
  setActiveTab,
  currentVersion,
  setCurrentVersion,
  versions,
  searchQuery,
  setSearchQuery,
  formatDate,
  handleEdit,
  handleSave,
  handleCancel,
  handleRecipeChange,
  handleProjectChange,
  handleDownload,
  handleFinalize,
  handleBack,
  handleCreateVersion,
  handleIngredientsChange,
  handleSOPChange,
  tabs,
  isEditMode,
  sopData,
  recipeFormat,
  isFinalized,
  isTypeChangeEligible,
  onChangeRecipeType,
  isSaving,
  canExportRecipe,
  handlePrepareSample,
}) {
  const toUiVersionNumber = (version) => {
    const numericVersion = Number(version);
    return Number.isFinite(numericVersion) ? numericVersion + 1 : version;
  };

  const versionNumbers = React.useMemo(
    () => [...new Set((versions || []).map((item) => item.version))].sort((a, b) => a - b),
    [versions]
  );

  const minVersion = versionNumbers.length ? versionNumbers[0] : currentVersion;
  const maxVersion = versionNumbers.length ? versionNumbers[versionNumbers.length - 1] : currentVersion;

  const pickStatus = (...values) =>
    values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

  const rawStatus = pickStatus(
    statusSourceProject?.masterProject?.status,
    statusSourceProject?.projectStatus,
    statusSourceProject?.developmentStatus,
    statusSourceProject?.applicationDevelopmentStatus,
    statusSourceProject?.applicationLab?.developmentStatus,
    recipe?.project?.masterProject?.status,
    recipe?.project?.projectStatus,
    recipe?.project?.developmentStatus,
    recipe?.project?.applicationDevelopmentStatus,
    recipe?.project?.applicationLab?.developmentStatus,
    project?.masterProject?.status,
    project?.projectStatus,
    project?.developmentStatus,
    project?.applicationDevelopmentStatus,
    project?.applicationLab?.developmentStatus,
    null
  );

  const projectStatusLabel = String(rawStatus || "in-progress")
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-")
    .replace("in-development", "in-progress");

  const normalizedStatus = String(rawStatus || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ");

  const statusPaletteKey = (() => {
    if (!normalizedStatus) return "IN_PROGRESS";
    if (normalizedStatus.startsWith("rework")) return "REWORK";

    const map = {
      "not started": "NOT_STARTED",
      "in progress": "IN_PROGRESS",
      "in development": "IN_PROGRESS",
      "completed": "COMPLETED",
      "approved": "APPROVED",
      "paused": "PAUSED",
      "cancelled": "CANCELLED",
      "canceled": "CANCELLED",
      "adopted": "ADOPTED",
      "lost": "CANCELLED",
      "dropped": "DROPPED",
    };

    return map[normalizedStatus] || "IN_PROGRESS";
  })();

  const statusPalette =
    STATUS_COLOR_PALETTE[statusPaletteKey] || STATUS_COLOR_PALETTE.IN_PROGRESS;

  const creatorLabel = [recipe?.createdBy?.name, recipe?.createdBy?.email]
    .filter(Boolean)
    .join(" | ");

  const refProjectCode =
    recipe?.copiedFromRecipe?.recipeCode ||
    project?.projectCode ||
    project?.masterProject?.code ||
    recipe?.project?.projectCode ||
    recipe?.project?.masterProject?.code ||
    "N/A";
  return (
    <div className="flex flex-col w-full h-full min-h-0 rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl bg-background dark:bg-[#0B0B0F]">
      {/* Header */}
      <div className="flex-1 flex flex-col min-h-0 rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl">
        {/* Top Row */}
        <div className="flex-none flex items-center justify-between px-6 pb-2 lg:pb-2.5 xl:pb-3 2xl:pb-3.5 3xl:pb-4">
          <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton onClick={handleBack} />
            <div>
              <div className="flex items-center gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3">
                <h1 className="text-xs lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-bold text-gray-900 dark:text-white">
                  {recipe?.recipeName || "Recipe Name"}
                </h1>
                <span className="text-xs lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-bold text-primary">
                  {recipe?.recipeCode || "N/A"}
                </span>
                <span className="px-1 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-0.5 xl:py-0.5 2xl:py-1 3xl:py-1 text-[7px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs rounded-full bg-transparent text-primary dark:text-gray-300 border border-primary font-semibold">
                  {recipe?.recipeType?.toLowerCase() || "N/A"}
                </span>
                <span
                  className="px-1 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-0.5 xl:py-0.5 2xl:py-1 3xl:py-1 text-[7px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs rounded-full border"
                  style={{
                    backgroundColor: statusPalette.bgColor,
                    color: statusPalette.textColor,
                    borderColor: statusPalette.bgColor,
                  }}
                >
                  {projectStatusLabel}
                </span>
                {creatorLabel && (
                  <span className="px-1 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-0.5 xl:py-0.5 2xl:py-1 3xl:py-1 text-[7px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs rounded-full border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    {creatorLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ThemeToggle />
        </div>
        </div>

        {/* Reference Row with Action Buttons */}
        <div className="flex-none flex items-center justify-between px-6 pb-4 lg:pb-2.5 xl:pb-3 2xl:pb-3.5 3xl:pb-4">
          <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
            <span className="text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-600 dark:text-gray-400">Ref:</span>
            <span className="px-1 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-0.5 xl:py-0.5 2xl:py-1 3xl:py-1 text-[7px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs rounded-full bg-transparent text-primary dark:text-gray-300 border border-primary font-semibold">
            {refProjectCode}
            </span>
          </div>

          {isEditMode ? (
            <div className="desktop-page-btn-wrapper flex items-center gap-0 rounded-full overflow-hidden shadow-sm border border-border">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                title="Save"
                className="flex items-center gap-2 px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-0 bg-background text-foreground hover:bg-muted border-none rounded-none transition-colors disabled:opacity-50 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                ) : (
                  <Save className="desktop-page-btn m-0!" />
                )}
                {isSaving ? "Saving..." : "Save"}
              </Button>
              
              <div className="w-px h-4 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-border" />
              
              <Button
                onClick={handleCancel}
                title="Cancel"
                className="flex items-center gap-2 px-2 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 py-0 bg-background text-foreground hover:bg-muted border-none rounded-none transition-colors text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
              >
                <X className="desktop-page-btn m-0!" />
                Cancel
              </Button>
            </div>
          ) : (
            <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full items-center shadow-sm">
              <Button
                size="icon"
                onClick={handleEdit}
                disabled={isFinalized}
                title="Edit Recipe"
                className="transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 rounded-s-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="desktop-page-btn text-background" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
              </Button>

              <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />
              
              {canExportRecipe && (
                <>
                  <Button
                    size="icon"
                    onClick={handleDownload}
                    title="Download Recipe"
                    className="transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90"
                  >
                    <Download className="desktop-page-btn text-background" />
                  </Button>
            
                  <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />
                </>
              )}

              <Button
                size="icon"
                onClick={handleFinalize}
                disabled={isFinalized}
                title="Finalize Recipe"
                className="transition-colors bg-transparent border-none shadow-none cursor-pointer hover:bg-primary/90 rounded-e-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="desktop-page-btn text-background" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0 p-5 border border-[#EEEBF4] dark:border-primary/50 overflow-hidden rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl">
          {/* Tabs */}
          <div className="flex-none grid grid-cols-3 mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-2.5 lg:py-1.5 xl:py-[7px] 2xl:py-2 3xl:py-2.5 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-center font-medium transition-colors border border-[#EEEBF4] hover:cursor-pointer",
                  index === 0 && "rounded-l-lg",
                  index === tabs.length - 1 && "rounded-r-lg",
                  activeTab === tab.id
                    ? "bg-[#E8E4F3] text-gray-900 border-[#EEEBF4] dark:bg-primary/35 dark:text-white dark:border-primary/50"
                    : "bg-white text-gray-700 border-[#EEEBF4] dark:bg-[#0B0B0F] dark:text-gray-300 dark:border-primary/50 hover:bg-gray-50 dark:hover:bg-[#111217]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {activeTab === "basic" && (
              <BasicInformation 
                project={project} 
                recipe={recipe} 
                formatDate={formatDate} 
                isEditMode={isEditMode}
                handleRecipeChange={handleRecipeChange}
                handleProjectChange={handleProjectChange}
              />
            )}

            {activeTab === "ingredients" && (
              <IngredientsTable data={recipe} isEditMode={isEditMode} onIngredientsChange={handleIngredientsChange} />
            )}

            {activeTab === "sop" && (
              <SOPAnalytics data={sopData} format={recipeFormat} isEditMode={isEditMode} onChange={handleSOPChange} />
            )}
          </div>
          
          {/* Footer with Version Controls */}
          <div className="flex-none pt-4 border-t border-[#EEEBF4] dark:border-primary/50 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCreateVersion}
                  disabled={isEditMode}
                  className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 px-3 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6 py-1 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-all font-bold text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoPlus className="text-xl lg:text-sm xl:text-md 2xl:text-lg 3xl:text-xl" />
                  Create New Version
                </button>

                <button
                  onClick={handlePrepareSample}
                  disabled={isEditMode || isFinalized}
                  className="px-3 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6 py-1 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 rounded-full border border-primary text-primary hover:bg-primary-shade-2 transition-all font-bold text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prepare Sample
                </button>

                {isTypeChangeEligible ? (
                  <button
                    onClick={onChangeRecipeType}
                    disabled={isEditMode || isFinalized}
                    className="px-3 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6 py-1 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 rounded-full border border-primary text-primary hover:bg-primary-shade-2 transition-all font-bold text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Change Recipe Type
                  </button>
                ) : null}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-gray-600 dark:text-gray-400">Version {toUiVersionNumber(currentVersion)}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentVersion(Math.max(minVersion, currentVersion - 1))}
                    disabled={currentVersion <= minVersion}
                    className="h-6 w-6 lg:h-6 xl:h-7 2xl:h-8 3xl:h-9 lg:w-6 xl:w-7 2xl:w-8 3xl:w-9 flex items-center justify-center rounded-md bg-background border border-table-stroke hover:bg-primary-shade-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 lg:h-3 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-3 xl:w-3.5 2xl:w-4 3xl:w-5 text-foreground" />
                  </button>
                  
                  <div className="flex items-center">
                    {versionNumbers.slice(
                      Math.max(0, versionNumbers.indexOf(currentVersion) - 2),
                      Math.max(0, versionNumbers.indexOf(currentVersion) - 2) + 5
                    ).map((version, index) => {
                      const isActive = version === currentVersion;
                      const showMarginLeft = index > 0;

                      return (
                        <button
                          key={version}
                          onClick={() => setCurrentVersion(version)}
                          className={cn(
                            "h-6 w-6 lg:h-6 xl:h-7 2xl:h-8 3xl:h-9 lg:w-6 xl:w-7 2xl:w-8 3xl:w-9 flex items-center justify-center rounded-md text-xs lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base font-medium transition-colors",
                            isActive
                              ? "bg-primary text-white"
                              : "bg-background border border-table-stroke text-foreground hover:bg-primary-shade-2",
                            showMarginLeft && "ml-2"
                          )}
                        >
                          {toUiVersionNumber(version)}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentVersion(Math.min(maxVersion, currentVersion + 1))}
                    disabled={currentVersion >= maxVersion}
                    className="h-6 w-6 lg:h-6 xl:h-7 2xl:h-8 3xl:h-9 lg:w-6 xl:w-7 2xl:w-8 3xl:w-9 flex items-center justify-center rounded-md ml-1 lg:ml-2 bg-background border border-table-stroke hover:bg-primary-shade-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 lg:h-3 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-3 xl:w-3.5 2xl:w-4 3xl:w-5 text-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


