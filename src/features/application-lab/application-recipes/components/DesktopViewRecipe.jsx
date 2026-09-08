import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, GitFork, GitCompare, LogOut } from "lucide-react";
import { toast } from "sonner";
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
  handleSample,
  handleViewDownloadHistory,
}) {
  const [isSelectingForCompare, setIsSelectingForCompare] = useState(false);
  const [isCompareConfirmed, setIsCompareConfirmed] = useState(false);
  const [selectedCompareVersionIds, setSelectedCompareVersionIds] = useState([]);
  const [selectedScaleBatchVersionId, setSelectedScaleBatchVersionId] = useState(null);

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

  const activeScaleBatchVersion = React.useMemo(() => {
    if (!isCompareConfirmed) return null;
    return versions?.find((v) => (v._id ?? v.version) === selectedScaleBatchVersionId) || null;
  }, [isCompareConfirmed, versions, selectedScaleBatchVersionId]);

  const activeVersionToHighlight = isCompareConfirmed
    ? (activeScaleBatchVersion?.version ?? currentVersion)
    : currentVersion;

  const paginationContainerRef = useRef(null);
  const tableContainerRef = useRef(null);

  const currentVersionIndex = React.useMemo(() => {
    return versionNumbers.findIndex((v) => v === activeVersionToHighlight);
  }, [versionNumbers, activeVersionToHighlight]);

  const paginationItems = React.useMemo(() => {
    if (!versionNumbers.length) return [];

    const totalCount = versionNumbers.length;
    if (totalCount <= 4) {
      return versionNumbers.map((v) => ({ type: "page", value: v, key: `page-${v}` }));
    }

    const currentIndex = versionNumbers.findIndex((v) => v === activeVersionToHighlight);
    const activeIdx = currentIndex >= 0 ? currentIndex : 0;

    // Near start (e.g. Version 1 or Version 2)
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

    // Near end (e.g. Version 6 or Version 7 of 7)
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

    // Middle (Reference Image 1: 1 ••• 4 5 6 ••• 100)
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

  const scrollPaginationButtonIntoView = useCallback((v) => {
    if (v === undefined || v === null) return;
    const container = paginationContainerRef.current;
    if (!container) return;

    const targetBtn = container.querySelector(`[data-version-btn="${v}"]`);
    if (!targetBtn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();

    const isVisible = btnRect.left >= containerRect.left - 2 && btnRect.right <= containerRect.right + 2;
    if (isVisible) return;

    if (btnRect.left < containerRect.left) {
      container.scrollBy({ left: btnRect.left - containerRect.left, behavior: "smooth" });
    } else if (btnRect.right > containerRect.right) {
      container.scrollBy({ left: btnRect.right - containerRect.right, behavior: "smooth" });
    }
  }, []);

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

    const stickyLeft = container.querySelector("[data-table-sticky-left]");
    const stickyWidth = stickyLeft ? stickyLeft.getBoundingClientRect().width : 340;

    const visibleLeft = containerRect.left + stickyWidth;
    const visibleRight = containerRect.right;

    const isVisible = colRect.left >= visibleLeft - 4 && colRect.right <= visibleRight + 4;
    if (isVisible) return;

    // Position the selected column right beside the sticky left header
    const targetScrollLeft = Math.max(0, container.scrollLeft + (colRect.left - visibleLeft));

    if (Math.abs(container.scrollLeft - targetScrollLeft) > 6) {
      container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    }
  }, []);

  const handleSelectVersion = useCallback(
    (v) => {
      if (isCompareActive) return;
      setCurrentVersion?.(v);

      const triggerScroll = () => {
        scrollPaginationButtonIntoView(v);
        scrollTableColumnIntoView(v);
      };

      requestAnimationFrame(triggerScroll);
      setTimeout(triggerScroll, 60);
      setTimeout(triggerScroll, 200);
    },
    [isCompareActive, setCurrentVersion, scrollPaginationButtonIntoView, scrollTableColumnIntoView]
  );

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

  useEffect(() => {
    if (activeVersionToHighlight !== undefined && activeVersionToHighlight !== null) {
      const triggerScroll = () => {
        scrollPaginationButtonIntoView(activeVersionToHighlight);
        scrollTableColumnIntoView(activeVersionToHighlight);
      };

      const rafId = requestAnimationFrame(triggerScroll);
      const t1 = setTimeout(triggerScroll, 60);
      const t2 = setTimeout(triggerScroll, 200);
      const t3 = setTimeout(triggerScroll, 500);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [activeVersionToHighlight, scrollPaginationButtonIntoView, scrollTableColumnIntoView]);

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
            {/* Left: Version Pagination (Image 1 & 2) */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-normal text-gray-900 dark:text-gray-100 select-none mr-1.5">
                Version
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevVersion}
                  disabled={
                    isCompareActive ||
                    (currentVersion ?? 0) <= minVersion ||
                    (currentVersionIndex !== -1 && currentVersionIndex <= 0)
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-[6px] bg-[#F0EDF6] dark:bg-[#1E192B] text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-[#E5DFEF] dark:hover:bg-[#2B233D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex-none"
                  aria-label="Previous version"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[1.8]" />
                </button>

                <div
                  ref={paginationContainerRef}
                  className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5"
                >
                  {paginationItems.length > 0 ? (
                    paginationItems.map((item) => {
                      if (item.type === "ellipsis") {
                        return (
                          <div
                            key={item.key}
                            className="flex items-center gap-1 px-1.5 select-none pointer-events-none flex-none"
                            aria-hidden="true"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#542790] dark:bg-purple-400 flex-none" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#542790] dark:bg-purple-400 flex-none" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#542790] dark:bg-purple-400 flex-none" />
                          </div>
                        );
                      }

                      const v = item.value;
                      const isActive = v === activeVersionToHighlight;

                      return (
                        <button
                          key={item.key}
                          data-version-btn={v}
                          type="button"
                          onClick={() => handleSelectVersion(v)}
                          disabled={isCompareActive}
                          className={cn(
                            "min-w-[32px] h-8 px-2 flex items-center justify-center rounded-[6px] text-sm font-medium transition-colors flex-none",
                            isCompareActive ? "cursor-not-allowed opacity-40 hover:bg-transparent" : "cursor-pointer",
                            isActive
                              ? "bg-[#542790] text-white font-medium shadow-none"
                              : "bg-[#F0EDF6] dark:bg-[#1E192B] text-gray-900 dark:text-gray-100 hover:bg-[#E5DFEF] dark:hover:bg-[#2B233D]"
                          )}
                        >
                          {toUiVersionNumber(v)}
                        </button>
                      );
                    })
                  ) : (
                    <button
                      type="button"
                      className="min-w-[32px] h-8 px-2 flex items-center justify-center rounded-[6px] bg-[#542790] text-white font-medium text-sm flex-none"
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
                  className="w-8 h-8 flex items-center justify-center rounded-[6px] bg-[#F0EDF6] dark:bg-[#1E192B] text-gray-700 dark:text-gray-300 hover:bg-[#E5DFEF] dark:hover:bg-[#2B233D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex-none"
                  aria-label="Next version"
                >
                  <ChevronRight className="w-4 h-4 stroke-[1.8]" />
                </button>
              </div>
            </div>

            {/* Middle: Selection Counter (Image 1 & 2) */}
            {(isSelectingForCompare || isCompareConfirmed) && (
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Selected {selectedCompareVersionIds.length}/3
              </div>
            )}

            {/* Right: Actions */}
            {isSelectingForCompare ? (
              /* Selection Mode Buttons (Image 1) */
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancelCompare}
                  className="px-5 py-2 rounded-xl border border-[#9079BC] dark:border-primary/40 bg-[#FCFBFD] dark:bg-[#151221] text-[#4B208B] dark:text-purple-300 font-bold text-xs hover:bg-[#EFEAF9] transition-all shadow-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCompare}
                  disabled={selectedCompareVersionIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            ) : isCompareConfirmed ? (
              /* Confirmed Comparison Mode Buttons (Image 2) */
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectRecipeBack}
                  className="px-4 py-2 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Select Recipe
                </button>

                <button
                  type="button"
                  onClick={handleLeaveCompare}
                  className="px-4 py-2 rounded-xl border border-[#D8CBF2] dark:border-primary/40 bg-purple-50/50 dark:bg-primary/20 text-[#4B208B] dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-primary/30 transition-all shadow-sm cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Comparison
                </button>
              </div>
            ) : (
              /* Default Standard Mode Buttons */
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
                  onClick={handleStartCompare}
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
            )}
          </div>

          {/* The Multi-Section Recipe Details Table & Versions Content */}
          <RecipeDetailsTable
            tableContainerRef={tableContainerRef}
            data={recipe}
            versions={versions}
            currentVersion={activeVersionToHighlight}
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
        </div>
      </div>
    </div>
  );
}

