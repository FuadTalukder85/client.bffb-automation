import React, { useState } from "react";
import { Edit, Download, CheckCircle, Search, ChevronLeft, ChevronRight, Save, X, Loader2, Clock } from "lucide-react";
import { GoPlus } from "react-icons/go";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { Pagination } from "@/components/ui/Pagination";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { cn } from "@/lib/utils";
import { STATUS_COLOR_PALETTE } from "@/constants/statusColors";
import MobileBasicInformation from "./MobileBasicInformation";
import MobileIngredientsTable from "./MobileIngredientsTable";
import MobileSOPAnalytics from "./MobileSOPAnalytics";
import { FinalizeRecipeModal } from "./FinalizeRecipeModal";

export default function MobileViewRecipe({
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
  handleViewDownloadHistory,
}) {
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

  const versionNumbers = [...new Set((versions || []).map((item) => item.version))].sort((a, b) => a - b);
  const currentVersionPage = Math.max(1, versionNumbers.indexOf(currentVersion) + 1);
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

  const viewActions = [
    { icon: <Edit className="w-3.5 h-3.5" />, onClick: handleEdit, label: "Edit", disabled: isFinalized },
    { icon: <Download className="w-3.5 h-3.5" />, onClick: handleDownload, label: "Download", show: canExportRecipe },
    { icon: <Clock className="w-3.5 h-3.5" />, onClick: handleViewDownloadHistory, label: "History", show: canExportRecipe },
    { icon: <CheckCircle className="w-3.5 h-3.5" />, onClick: () => setIsFinalizeModalOpen(true), label: "Finalize", disabled: isFinalized }
  ].filter(action => action.show !== false);

  const editActions = [
    { 
      icon: isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />, 
      onClick: handleSave, 
      label: isSaving ? "Saving..." : "Save",
      disabled: isSaving,
      loading: isSaving
    },
    { icon: <X className="w-3.5 h-3.5" />, onClick: handleCancel, label: "Cancel", disabled: isSaving }
  ];

  return (
    <div className="flex flex-col flex-1 w-full text-foreground">
      {/* STICKY TOP NAVIGATION (Header, Search, and Tabs) */}
      <div className="sticky -top-5 z-50 bg-white/95 dark:bg-background/95 backdrop-blur-sm -mx-5 px-5 pt-5 shadow-sm border-b border-border/10">
        <div className="space-y-4 px-1 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0 overflow-hidden">
              <div className="pt-1.5 shrink-0">
                <BackButton onClick={handleBack} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xl font-bold leading-tight text-base-color truncate">
                  {recipe?.recipeName || recipe?.name || "Recipe Name"}
                </span>
                <div className="flex items-center gap-1 pt-0.5">
                  <ChevronRight className="w-4 h-4 text-nav-highlight shrink-0" />
                  <span className="text-xl font-bold leading-tight text-nav-highlight truncate">
                    {recipe?.recipeCode || "N/A"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-0.5 text-[10px] font-medium rounded-full border border-nav-highlight/30 text-nav-highlight">
                    {recipe.recipeType?.toLowerCase() || "bakery"}
                  </span>
                  <span
                    className="px-3 py-0.5 text-[10px] font-medium rounded-full border"
                    style={{
                      backgroundColor: statusPalette.bgColor,
                      color: statusPalette.textColor,
                      borderColor: statusPalette.bgColor,
                    }}
                  >
                    {projectStatusLabel}
                  </span>
                  {creatorLabel && (
                    <span className="px-3 py-0.5 text-[10px] font-medium rounded-full border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      {creatorLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <ActionButtonsGroup 
                actions={isEditMode ? editActions : viewActions} 
                className="px-0.5 py-0.5" 
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-base-color">Ref:</span>
              <span className="px-3 py-1 text-xs font-semibold border rounded-full border-nav-highlight/30 text-nav-highlight whitespace-nowrap">
                {refProjectCode}
              </span>
            </div>
            <div className="relative flex-1">
                <Search className="absolute w-4 h-4 text-lighter-text/50 -translate-y-1/2 right-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 text-xs border rounded-lg bg-primary-shade-2 border-nav-highlight/30 text-base-color placeholder:text-lighter-text/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
          </div>
        </div>

        {/* Tabs - Now sticky with the header but NOT part of the card */}
        <div className="grid grid-cols-3 -mx-5 border-t border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-2 py-3 text-[10px] text-center font-bold transition-colors border-b-2",
                activeTab === tab.id
                  ? "bg-primary-shade-2 text-base-color border-primary"
                  : "bg-transparent text-lighter-text border-transparent hover:bg-primary-shade-2/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SINGLE CONTENT CARD (Tables, Summary, and Pagination) */}
      <div className="flex flex-col flex-1 bg-background rounded-2xl shadow-xl mt-6 mb-10 overflow-visible border border-border/50">
        <div className="flex-1 p-2">
          {activeTab === "basic" && (
            <MobileBasicInformation 
              project={project} 
              recipe={recipe} 
              formatDate={formatDate} 
              isEditMode={isEditMode}
              handleRecipeChange={handleRecipeChange}
              handleProjectChange={handleProjectChange}
            />
          )}

          {activeTab === "ingredients" && (
            <MobileIngredientsTable data={recipe} isEditMode={isEditMode} onIngredientsChange={handleIngredientsChange} />
          )}

          {activeTab === "sop" && (
            <MobileSOPAnalytics data={sopData} format={recipeFormat} isEditMode={isEditMode} onChange={handleSOPChange} />
          )}

          {/* VERSION CONTROL FOOTER (Inside the Card at the very bottom) */}
          <div className="py-8 mt-12 border-t border-border/50">
            <div className="flex flex-col items-center gap-6">
              <div className="flex justify-center w-full">
                <Pagination
                  currentPage={currentVersionPage}
                  totalPages={versionNumbers.length || 1}
                  onPageChange={(page) => {
                    const selectedVersion = versionNumbers[page - 1];
                    if (selectedVersion !== undefined) {
                      setCurrentVersion(selectedVersion);
                    }
                  }}
                  itemsPerPage={1}
                  onItemsPerPageChange={() => {}}
                />
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-xs font-bold text-nav-highlight whitespace-nowrap">Version {currentVersion + 1}</span>
                  
                  {isTypeChangeEligible ? (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={handleCreateVersion}
                        disabled={isEditMode}
                        className="flex items-center gap-1 px-2 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <GoPlus className="w-4 h-4" />
                        Create
                      </button>

                      <button
                        onClick={onChangeRecipeType}
                        disabled={isEditMode || isFinalized}
                        className="px-2 py-2 rounded-full border border-primary text-primary hover:bg-primary-shade-2 transition-all font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Change Recipe Type
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={handleCreateVersion}
                        disabled={isEditMode}
                        className="flex items-center gap-1 px-2 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <GoPlus className="w-4 h-4" />
                        Create new
                      </button>

                      <button
                        onClick={handlePrepareSample}
                        disabled={isEditMode || isFinalized}
                        className="px-2 py-2 rounded-full border border-primary text-primary hover:bg-primary-shade-2 transition-all font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Prepare Sample
                      </button>
                    </div>
                  )}
                </div>

                {isTypeChangeEligible && (
                  <div className="flex justify-end w-full">
                    <button
                      onClick={handlePrepareSample}
                      disabled={isEditMode || isFinalized}
                      className="px-2 py-2 rounded-full border border-primary text-primary hover:bg-primary-shade-2 transition-all font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prepare Sample
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FinalizeRecipeModal
        open={isFinalizeModalOpen}
        onOpenChange={setIsFinalizeModalOpen}
        onConfirm={handleFinalize}
      />
    </div>
  );
}
