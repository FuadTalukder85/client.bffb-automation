import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, GitFork, GitCompare, LogOut, ChevronDown, ChevronUp, Search, CheckCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/BackButton";
import { cn } from "@/lib/utils";
import BasicInformation from "./BasicInformation";
import BenchmarkCard from "./BenchmarkCard";
import MobileRecipeDetailsTable from "./MobileRecipeDetailsTable";
import { FinalizeRecipeModal } from "./FinalizeRecipeModal";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/Modal";

export default function MobileViewRecipe({
  project,
  statusSourceProject,
  recipe,
  currentVersion,
  setCurrentVersion,
  versions = [],
  searchQuery,
  setSearchQuery,
  formatDate = (d) => d || "-",
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
  recipeFormat = "bakery",
  isFinalized = false,
  isTypeChangeEligible,
  onChangeRecipeType,
  isSaving,
  canExportRecipe,
  handlePrepareSample,
  handleSample,
  handleViewDownloadHistory,
}) {
  const [isSelectingForCompare, setIsSelectingForCompare] = useState(false);
  const [isCompareConfirmed, setIsCompareConfirmed] = useState(false);
  const [selectedCompareVersionIds, setSelectedCompareVersionIds] = useState([]);
  const [selectedScaleBatchVersionId, setSelectedScaleBatchVersionId] = useState(null);

  // Accordion states for Basic Information and Benchmark
  const [isBasicExpanded, setIsBasicExpanded] = useState(false);
  const [isBenchmarkExpanded, setIsBenchmarkExpanded] = useState(false);
  const [isDescriptionsOpen, setIsDescriptionsOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

  const toUiVersionNumber = (version) => {
    const numericVersion = Number(version);
    return Number.isFinite(numericVersion) ? numericVersion + 1 : version;
  };

  const versionNumbers = useMemo(
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
    "Sadman Chowdhury";

  const refProjectCode =
    recipe?.copiedFromRecipe?.recipeCode ||
    project?.projectCode ||
    project?.masterProject?.code ||
    recipe?.project?.projectCode ||
    recipe?.project?.masterProject?.code ||
    "AKB 28042304";

  const currentRecipeCode = recipe?.recipeCode || "CKB 17042401R10";
  const formatLabel = (recipeFormat || recipe?.recipeType || "bakery").toLowerCase();

  const isCompareActive = isSelectingForCompare || isCompareConfirmed;

  // Compare Recipe Handlers
  const handleStartCompare = () => {
    setIsSelectingForCompare(true);
    setIsCompareConfirmed(false);
    setSelectedCompareVersionIds([]);
  };

  const handleCancelCompare = () => {
    setIsSelectingForCompare(false);
    setIsCompareConfirmed(false);
    setSelectedCompareVersionIds([]);
  };

  const handleConfirmCompare = () => {
    if (selectedCompareVersionIds.length === 0) {
      toast.error("Please select at least one version to compare");
      return;
    }
    setIsSelectingForCompare(false);
    setIsCompareConfirmed(true);
    const firstSelectedId = selectedCompareVersionIds[0];
    if (!selectedScaleBatchVersionId || !selectedCompareVersionIds.includes(selectedScaleBatchVersionId)) {
      setSelectedScaleBatchVersionId(firstSelectedId);
    }
  };

  const handleSelectRecipeBack = () => {
    setIsSelectingForCompare(true);
    setIsCompareConfirmed(false);
  };

  const handleLeaveCompare = () => {
    setIsSelectingForCompare(false);
    setIsCompareConfirmed(false);
    setSelectedCompareVersionIds([]);
  };

  const handleToggleSelectCompareVersion = (vItem) => {
    const vId = vItem._id ?? vItem.version;
    setSelectedCompareVersionIds((prev) => {
      if (prev.includes(vId)) {
        return prev.filter((id) => id !== vId);
      }
      if (prev.length >= 3) {
        toast.error("You can select a maximum of 3 versions");
        return prev;
      }
      return [...prev, vId];
    });
  };

  const handleSelectScaleBatchVersion = (vItem) => {
    const vId = vItem._id ?? vItem.version;
    setSelectedScaleBatchVersionId(vId);
  };

  const activeScaleBatchVersion = useMemo(() => {
    if (!isCompareConfirmed) return null;
    return versions?.find((v) => (v._id ?? v.version) === selectedScaleBatchVersionId) || null;
  }, [isCompareConfirmed, versions, selectedScaleBatchVersionId]);

  const activeVersionToHighlight = isCompareConfirmed
    ? (activeScaleBatchVersion?.version ?? currentVersion)
    : currentVersion;

  const currentVersionIndex = useMemo(() => {
    return versionNumbers.findIndex((v) => v === activeVersionToHighlight);
  }, [versionNumbers, activeVersionToHighlight]);

  // Pagination items (1 • 4 5 6 •• 100) matching Image 1 exactly
  const paginationItems = useMemo(() => {
    if (!versionNumbers.length) return [];

    const totalCount = versionNumbers.length;
    if (totalCount <= 4) {
      return versionNumbers.map((v) => ({ type: "page", value: v, key: `page-${v}` }));
    }

    const currentIndex = versionNumbers.findIndex((v) => v === activeVersionToHighlight);
    const activeIdx = currentIndex >= 0 ? currentIndex : 0;

    if (activeIdx <= 2) {
      const count = Math.min(3, totalCount - 2);
      const startPages = versionNumbers.slice(0, Math.max(count, activeIdx + 2)).map((v) => ({
        type: "page",
        value: v,
        key: `page-${v}`,
      }));
      return [
        ...startPages,
        { type: "ellipsis", key: "ellipsis-end" },
        { type: "page", value: versionNumbers[totalCount - 1], key: `page-${versionNumbers[totalCount - 1]}` },
      ];
    }

    if (activeIdx >= totalCount - 3) {
      const endStartIndex = Math.min(activeIdx - 1, totalCount - 3);
      const endPages = versionNumbers.slice(endStartIndex).map((v) => ({
        type: "page",
        value: v,
        key: `page-${v}`,
      }));
      return [
        { type: "page", value: versionNumbers[0], key: `page-${versionNumbers[0]}` },
        { type: "ellipsis", key: "ellipsis-start" },
        ...endPages,
      ];
    }

    return [
      { type: "page", value: versionNumbers[0], key: `page-${versionNumbers[0]}` },
      { type: "ellipsis", key: "ellipsis-start" },
      { type: "page", value: versionNumbers[activeIdx - 1], key: `page-${versionNumbers[activeIdx - 1]}` },
      { type: "page", value: versionNumbers[activeIdx], key: `page-${versionNumbers[activeIdx]}` },
      { type: "page", value: versionNumbers[activeIdx + 1], key: `page-${versionNumbers[activeIdx + 1]}` },
      { type: "ellipsis", key: "ellipsis-end" },
      { type: "page", value: versionNumbers[totalCount - 1], key: `page-${versionNumbers[totalCount - 1]}` },
    ];
  }, [versionNumbers, activeVersionToHighlight]);

  const tableContainerRef = useRef(null);

  const scrollTableColumnIntoView = useCallback((v) => {
    if (v === undefined || v === null) return;
    const container = tableContainerRef.current;
    if (!container) return;

    const targetCol =
      container.querySelector(`[data-version-col="${v}"]`) ||
      container.querySelector(`[data-version-num="${Number(v) + 1}"]`) ||
      container.querySelector(`[data-version-num="${v}"]`) ||
      container.querySelector(`[data-version-id="${v}"]`) ||
      container.querySelector(`#version-column-${v}`);
    if (!targetCol) return;

    const containerRect = container.getBoundingClientRect();
    const colRect = targetCol.getBoundingClientRect();

    if (containerRect.width === 0 || colRect.width === 0) return;

    const isVisible = colRect.left >= containerRect.left - 4 && colRect.right <= containerRect.right + 4;
    if (isVisible) return;

    const targetScrollLeft = Math.max(0, container.scrollLeft + (colRect.left - containerRect.left));
    if (Math.abs(container.scrollLeft - targetScrollLeft) > 4) {
      container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    }
  }, []);

  const handleSelectVersion = useCallback(
    (v) => {
      if (isCompareActive) return;
      setCurrentVersion?.(v);
      requestAnimationFrame(() => scrollTableColumnIntoView(v));
      setTimeout(() => scrollTableColumnIntoView(v), 60);
      setTimeout(() => scrollTableColumnIntoView(v), 200);
    },
    [isCompareActive, setCurrentVersion, scrollTableColumnIntoView]
  );

  useEffect(() => {
    if (activeVersionToHighlight !== undefined && activeVersionToHighlight !== null) {
      const triggerScroll = () => {
        scrollTableColumnIntoView(activeVersionToHighlight);
      };
      const rafId = requestAnimationFrame(triggerScroll);
      const t1 = setTimeout(triggerScroll, 60);
      const t2 = setTimeout(triggerScroll, 200);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeVersionToHighlight, scrollTableColumnIntoView]);

  const handlePrevVersion = () => {
    if (isCompareActive) return;
    if (currentVersionIndex > 0) {
      handleSelectVersion(versionNumbers[currentVersionIndex - 1]);
    } else if ((currentVersion ?? 0) > minVersion) {
      handleSelectVersion(Math.max(minVersion, (currentVersion ?? 0) - 1));
    }
  };

  const handleNextVersion = () => {
    if (isCompareActive) return;
    if (currentVersionIndex >= 0 && currentVersionIndex < versionNumbers.length - 1) {
      handleSelectVersion(versionNumbers[currentVersionIndex + 1]);
    } else if ((currentVersion ?? 0) < maxVersion) {
      handleSelectVersion(Math.min(maxVersion, (currentVersion ?? 0) + 1));
    }
  };

  // Active Version Card Information
  const activeVersionNumberStr = String(Number(activeVersionToHighlight ?? 0) + 1).padStart(2, "0");
  const activeVersionObj = useMemo(() => {
    return versions.find((v) => v.version === activeVersionToHighlight) || recipe || {};
  }, [versions, activeVersionToHighlight, recipe]);

  const isVersionApproved =
    ["final", "approved", "finalized"].includes(String(activeVersionObj?.recipeStatus || recipe?.recipeStatus || "").toLowerCase()) ||
    isFinalized;

  return (
    <div className="flex flex-col flex-1 w-full text-foreground space-y-3 pb-12">
      {/* ================= STICKY TOP NAVIGATION HEADER (Matching bff.mp4 Video 00:00) ================= */}
      <div className="sticky -top-5 z-30 bg-background/95 backdrop-blur-md -mx-5 px-5 pt-3 pb-3 border-b border-[#EEEBF4] dark:border-primary/20 shadow-xs">
        <div className="flex flex-col gap-2.5">
          {/* Search Input Box with Left Magnifying Glass (bff.mp4 00:00) */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-[#0D0B14] border border-[#EEEBF4] dark:border-primary/40 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4B208B] dark:focus:border-primary transition-colors"
            />
          </div>

          {/* Navigation & Recipe Title Row with "View descriptions" Button (bff.mp4 00:00) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#F0EDF6] dark:bg-primary/20 text-[#542790] dark:text-purple-300 hover:bg-[#E5DFEF] transition-colors shrink-0 cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
              </button>

              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                {recipe?.recipeName || recipe?.name || "Chocolate Muffin"}
              </h1>
            </div>

            {/* View descriptions Button (bff.mp4 00:00) */}
            <button
              type="button"
              onClick={() => setIsDescriptionsOpen(true)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#0D0B14] border border-[#D8CBF2] dark:border-primary/40 text-[#4B208B] dark:text-purple-300 font-semibold text-[11px] flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-primary/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View descriptions</span>
            </button>
          </div>

          {/* Ref & Format Metadata Row (bff.mp4 00:00) */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
              <span>Ref:</span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-[11px]">
                {refProjectCode}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
              <span>Format:</span>
              <span className="px-2.5 py-0.5 rounded-full border border-[#4B208B] text-[#4B208B] dark:text-purple-300 font-bold text-[11px]">
                {formatLabel}
              </span>
            </div>
          </div>

          {/* Created By Row (bff.mp4 00:00) */}
          <div className="text-xs text-gray-700 dark:text-gray-300">
            Created By <span className="font-bold text-gray-900 dark:text-white">{creatorName}</span>
          </div>

          {/* Comparison Mode Status Bar (When active) */}
          {isSelectingForCompare && (
            <div className="flex items-center justify-between pt-1 border-t border-[#EEEBF4] dark:border-primary/20">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Selected {selectedCompareVersionIds.length}/3
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelCompare}
                  className="px-3 py-1 rounded-full border border-[#9079BC] bg-[#FCFBFD] dark:bg-[#151221] text-[#4B208B] dark:text-purple-300 font-bold text-xs cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCompare}
                  disabled={selectedCompareVersionIds.length === 0}
                  className="px-3.5 py-1 rounded-full bg-[#4B208B] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {isCompareConfirmed && (
            <div className="flex items-center justify-between pt-1 border-t border-[#EEEBF4] dark:border-primary/20">
              <button
                type="button"
                onClick={handleSelectRecipeBack}
                className="px-3 py-1 rounded-full bg-[#4B208B] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <GitCompare className="w-3.5 h-3.5" />
                Select Recipe
              </button>
              <button
                type="button"
                onClick={handleLeaveCompare}
                className="px-3 py-1 rounded-full border border-[#D8CBF2] bg-purple-50/50 dark:bg-primary/20 text-[#4B208B] dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                Leave Comparison
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= ACCORDIONS: BASIC INFORMATION & BENCHMARK ================= */}
      <div className="flex flex-col gap-2.5">
        {/* Accordion 1: Basic Information */}
        <div className="bg-white dark:bg-[#0D0B14] border border-[#EEEBF4] dark:border-primary/40 rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setIsBasicExpanded((prev) => !prev)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left select-none cursor-pointer"
          >
            <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Basic Information
            </span>
            {isBasicExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
            )}
          </button>

          {isBasicExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-[#EEEBF4] dark:border-primary/20">
              <BasicInformation
                project={project}
                recipe={recipe}
                formatDate={formatDate}
                onSaveSpecificFields={onSaveSpecificFields}
                handleRecipeChange={handleRecipeChange}
                isFinalized={isFinalized}
                isExpanded={true}
                onToggleExpand={setIsBasicExpanded}
              />
            </div>
          )}
        </div>

        {/* Accordion 2: Benchmark */}
        <div className="bg-white dark:bg-[#0D0B14] border border-[#EEEBF4] dark:border-primary/40 rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setIsBenchmarkExpanded((prev) => !prev)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left select-none cursor-pointer"
          >
            <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Benchmark
            </span>
            {isBenchmarkExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
            )}
          </button>

          {isBenchmarkExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-[#EEEBF4] dark:border-primary/20">
              <BenchmarkCard
                sopData={sopData}
                recipe={recipe}
                onSaveSpecificFields={onSaveSpecificFields}
                onChange={handleSOPChange}
                isFinalized={isFinalized}
                isExpanded={true}
                onToggleExpand={setIsBenchmarkExpanded}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= VERSION PAGINATION & ACTION BUTTONS ================= */}
      <div className="flex flex-col gap-2.5 pt-0.5">
        {/* Row 1: Version Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 select-none mr-1">
              Version
            </span>

            <button
              type="button"
              onClick={handlePrevVersion}
              disabled={
                isCompareActive ||
                (currentVersion ?? 0) <= minVersion ||
                (currentVersionIndex !== -1 && currentVersionIndex <= 0)
              }
              className="w-7 h-7 flex items-center justify-center rounded-md bg-[#F0EDF6] dark:bg-primary/20 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous version"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
              {paginationItems.length > 0 ? (
                paginationItems.map((item) => {
                  if (item.type === "ellipsis") {
                    return (
                      <div
                        key={item.key}
                        className="flex items-center gap-0.5 px-1 select-none pointer-events-none flex-none"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#542790] dark:bg-purple-400" />
                        <span className="w-1 h-1 rounded-full bg-[#542790] dark:bg-purple-400" />
                      </div>
                    );
                  }

                  const v = item.value;
                  const isActive = v === activeVersionToHighlight;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectVersion(v)}
                      disabled={isCompareActive}
                      className={cn(
                        "min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-md text-xs font-semibold transition-colors flex-none",
                        isCompareActive ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                        isActive
                          ? "bg-[#542790] text-white"
                          : "bg-[#F0EDF6] dark:bg-primary/20 text-gray-800 dark:text-gray-200"
                      )}
                    >
                      {toUiVersionNumber(v)}
                    </button>
                  );
                })
              ) : (
                <button
                  type="button"
                  className="min-w-[28px] h-7 px-1.5 flex items-center justify-center rounded-md bg-[#542790] text-white text-xs font-semibold"
                >
                  1
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNextVersion}
              disabled={
                isCompareActive ||
                (currentVersion ?? 0) >= maxVersion ||
                (currentVersionIndex !== -1 && currentVersionIndex >= versionNumbers.length - 1)
              }
              className="w-7 h-7 flex items-center justify-center rounded-md bg-[#F0EDF6] dark:bg-primary/20 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next version"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Action Buttons */}
        {!isCompareActive && (
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
            <button
              type="button"
              onClick={handleCreateVersion}
              disabled={isEditMode}
              className="px-3.5 py-1.5 rounded-full border border-[#D8CBF2] dark:border-primary/40 bg-purple-50/50 dark:bg-primary/20 text-[#4B208B] dark:text-purple-300 font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Version
            </button>

            <button
              type="button"
              onClick={handleStartCompare}
              className="px-4 py-1.5 rounded-full bg-[#4B208B] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <GitFork className="w-3.5 h-3.5 rotate-90" />
              Compare Recipe
            </button>

            <button
              type="button"
              onClick={onChangeRecipeType}
              disabled={isEditMode || !isTypeChangeEligible}
              className="px-3.5 py-1.5 rounded-full border border-[#D8CBF2] dark:border-primary/40 bg-purple-50/50 dark:bg-primary/20 text-[#4B208B] dark:text-purple-300 font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 3 4 4-4 4"/>
                <path d="M20 7H4"/>
                <path d="m8 21-4-4 4-4"/>
                <path d="M4 17h16"/>
              </svg>
              Change Recipe
            </button>
          </div>
        )}
      </div>

      {/* ================= INGREDIENT TABLE & BATCH SUMMARY (Images 2, 3, 4, 5) ================= */}
      <MobileRecipeDetailsTable
        tableContainerRef={tableContainerRef}
        data={recipe}
        versions={versions}
        currentVersion={activeVersionToHighlight}
        onIngredientsChange={handleIngredientsChange}
        onRecipeChange={handleRecipeChange}
        sopData={sopData}
        onSOPChange={handleSOPChange}
        onSaveSpecificFields={onSaveSpecificFields}
        onFinalizeVersion={handleOpenFinalizeModal || handleFinalize}
        onFullDownload={handleExportTypeInternal || handleDownload}
        onClientDownload={handleExportTypeForClient || handleDownload}
        onPrepareSample={handlePrepareSample}
        onSample={handleSample}
        formatDate={formatDate}
        recipeFormat={recipeFormat}
        isFinalized={isFinalized}
        isSelectingForCompare={isSelectingForCompare}
        isCompareConfirmed={isCompareConfirmed}
        selectedCompareVersionIds={selectedCompareVersionIds}
        onToggleSelectCompareVersion={handleToggleSelectCompareVersion}
        selectedScaleBatchVersionId={selectedScaleBatchVersionId}
        onSelectScaleBatchVersion={handleSelectScaleBatchVersion}
      />

      {/* Finalize Recipe Modal */}
      <FinalizeRecipeModal
        open={isFinalizeModalOpen}
        onOpenChange={setIsFinalizeModalOpen}
        onConfirm={handleFinalize}
        isLoading={isSaving}
      />

      {/* View Descriptions Modal (Opened via "View descriptions" button in header) */}
      <Modal open={isDescriptionsOpen} onOpenChange={setIsDescriptionsOpen}>
        <ModalContent showCloseButton={true} className="max-w-md w-full p-4 max-h-[85vh] overflow-y-auto">
          <ModalHeader className="pb-2 border-b border-[#EEEBF4] dark:border-primary/20 text-left">
            <ModalTitle className="text-base font-bold text-gray-900 dark:text-white">
              Recipe Descriptions
            </ModalTitle>
            <ModalDescription className="text-xs text-gray-500">
              Basic Information, Benchmark & Actions
            </ModalDescription>
          </ModalHeader>

          {/* Quick Actions in Modal */}
          <div className="flex items-center gap-2 py-2 overflow-x-auto [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => {
                handleCreateVersion?.();
                setIsDescriptionsOpen(false);
              }}
              disabled={isEditMode}
              className="px-3 py-1.5 rounded-full border border-[#D8CBF2] dark:border-primary/40 bg-purple-50/50 dark:bg-primary/20 text-[#4B208B] dark:text-purple-300 font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Version
            </button>

            <button
              type="button"
              onClick={() => {
                handleStartCompare();
                setIsDescriptionsOpen(false);
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#4B208B] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <GitFork className="w-3.5 h-3.5 rotate-90" />
              Compare Recipe
            </button>

            <button
              type="button"
              onClick={() => {
                onChangeRecipeType?.();
                setIsDescriptionsOpen(false);
              }}
              disabled={isEditMode || !isTypeChangeEligible}
              className="px-3 py-1.5 rounded-full border border-[#D8CBF2] dark:border-primary/40 bg-purple-50/50 dark:bg-primary/20 text-[#4B208B] dark:text-purple-300 font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 3 4 4-4 4"/>
                <path d="M20 7H4"/>
                <path d="m8 21-4-4 4-4"/>
                <path d="M4 17h16"/>
              </svg>
              Change Recipe
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <BasicInformation
              project={project}
              recipe={recipe}
              formatDate={formatDate}
              onSaveSpecificFields={onSaveSpecificFields}
              handleRecipeChange={handleRecipeChange}
              isFinalized={isFinalized}
              isExpanded={true}
              onToggleExpand={() => {}}
            />

            <BenchmarkCard
              sopData={sopData}
              recipe={recipe}
              onSaveSpecificFields={onSaveSpecificFields}
              onChange={handleSOPChange}
              isFinalized={isFinalized}
              isExpanded={true}
              onToggleExpand={() => {}}
            />
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
