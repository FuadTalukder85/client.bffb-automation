import React from "react";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Pagination } from "@/components/ui/Pagination";
import { Plus as PlusIcon, Download, Upload } from "lucide-react";
import DesktopProjectTable from "./components/DesktopProjectTable";
import MobileProjectCard from "./components/MobileProjectCard";
import { ProjectTableSkeleton } from "./components/ProjectTableSkeleton";
import { MobileProjectCardSkeleton } from "./components/MobileProjectCardSkeleton";
import { ProjectModal } from "./components/Modals/ProjectModal";
import { DesktopCreateProjectWithMemberModal } from "./components/Modals/DesktopCreateProjectWithMember";
import { ArchiveProjectModal } from "./components/Modals/ArchiveProjectModal";
import { RestoreProjectModal } from "./components/Modals/RestoreProjectModal";
import { UploadCSVModal } from "./components/Modals/UploadCSVModal";
import { UploadSuccessModal } from "./components/Modals/UploadSuccessModal";
import { ExportProjectsModal } from "./components/Modals/ExportProjectsModal";
import MobileBulkActionBar from "@/components/ui/MobileBulkActionBar";
import { useMasterProjectsLogic } from "./hooks/useMasterProjectsLogic";
import { stateOptions, masterProjectStatusFilterOptions as statusOptions } from "./constants/projectOptions";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PlusCircleIcon } from "lucide-react";
import { NoData } from "@/components/ui/NoData";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import PERMISSIONS from "@/constants/permissions";
import { hasPermission } from "@/lib/utils";

export default function MasterProjects() {
    const isMobile = useIsMobile();
    const { permissions } = useUserPermissions();
    const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
    const [exportLimit, setExportLimit] = React.useState(20);
    const [exportPage, setExportPage] = React.useState(1);

    const {
        searchTerm,
        selectedState,
        selectedStatus,
        dateFrom,
        dateTo,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        sorting,
        setSorting,
        isProjectModalOpen,
        setIsProjectModalOpen,
        projectModalMode,
        isArchiveModalOpen,
        setIsArchiveModalOpen,
        isRestoreModalOpen,
        setIsRestoreModalOpen,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isUploadSuccessModalOpen,
        setIsUploadSuccessModalOpen,
        selectedProject,
        setSelectedProject,
        selectedProjectIds,
        setSelectedProjectIds,
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
        handleStateChange,
        handleStatusChange,
        handleDateFromChange,
        handleDateToChange,
        handleAddProject,
        handleEditProject,
        handleArchiveProject,
        handleRestoreProject,
        handleViewProjectDetails,
        handleExportProjects,
        handleImportProjects,
        handleProjectConfirm,
        handleArchiveConfirm,
        handleRestoreConfirm,
        filters,
        isExportingProjects,
        isImportingProjects,
        importProjectsResult,
        importProjectsError,
    } = useMasterProjectsLogic();

    const canImportProjects = hasPermission(permissions, PERMISSIONS.PROJECT.IMPORT);
    const canExportProjects = hasPermission(permissions, PERMISSIONS.PROJECT.EXPORT);

    const getErrorMessage = (error) =>
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load projects";

    const errorMessage = error ? getErrorMessage(error) : "";
    const hasError = Boolean(errorMessage);

    const handleOpenExportModal = () => {
        if (isExportingProjects) return;
        setIsExportModalOpen(true);
    };

    const handleExportConfirm = async () => {
        try {
            const resolvedExportLimit =
                exportLimit === "all"
                    ? Math.max(pagination?.total || 0, 1)
                    : exportLimit;

            const resolvedExportPage = exportLimit === "all" ? 1 : exportPage;

            await handleExportProjects(resolvedExportPage, resolvedExportLimit);
            setIsExportModalOpen(false);
        } catch (err) {
            console.error("Failed to export projects:", err);
        }
    };

    // Action buttons for mobile header
    const actionButtons = [];

    if (canImportProjects) {
        actionButtons.push({
            icon: <Upload className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
            onClick: () => {
                setIsUploadModalOpen(true);
            },
            label: "Import",
        });
    }

    if (canExportProjects) {
        actionButtons.push({
            icon: <Download className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
            onClick: handleOpenExportModal,
            label: isExportingProjects ? "Exporting" : "Export",
        });
    }

    actionButtons.push({
        icon: <PlusIcon className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
        onClick: handleAddProject,
        label: "Add Project",
    });

    return (
        <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
            <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
                <PageHeader
                    title="Master Projects Module"
                    className="py-4 text-heading md:p-0 md:m-0"
                />

                <div className="flex items-center gap-2 md:hidden">
                    <ActionButtonsGroup actions={actionButtons} />
                </div>

                {/* <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex"> */}
                <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
                    <div className="shrink-0 w-96">
                        <DateRangeFilter
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onDateFromChange={handleDateFromChange}
                            onDateToChange={handleDateToChange}
                        />
                    </div>
                    <SearchInput
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    <ThemeToggle className="shrink-0" />
                </div>
            </div>
            <SearchFilterBar
                searchTerm={searchTerm}
                onSearchChange={(e) => handleSearchChange(e.target.value)}
                searchPlaceholder="Search projects..."
                filters={filters}
                dateRange={{
                    dateFrom,
                    dateTo,
                    onDateFromChange: handleDateFromChange,
                    onDateToChange: handleDateToChange,
                }}
                hideOnDesktop={true}
                defaultFilterValue="true"
            />

            <div className="flex-none hidden  md:block my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 ms-5">
                <div className="flex items-center gap-2 border-b border-border">
                    {statusOptions.map((tab) => {
                        const isSelected = selectedStatus === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => handleStatusChange(tab.value)}
                                className={`px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-body font-medium transition-colors border-b-2 -mb-px ${isSelected
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
            </div>

            <div className="flex-none hidden mb-2 lg:mb-2 xl:mb-2.5 2xl:mb-3.5 3xl:mb-4 md:block ms-5">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start justify-start gap-4">
                        <DesktopFilterPills
                            value={selectedState}
                            options={stateOptions}
                            onChange={handleStateChange}
                        />
                    </div>


                    <div className="bg-primary flex desktop-page-btn-wrapper w-fit rounded-full! items-center shadow-sm">
                        {canImportProjects && (
                            <Button
                                size="icon"
                                onClick={() => setIsUploadModalOpen(true)}
                                title="Import projects from Excel"
                                className="transition-colors bg-transparent border-none shadow-none cursor-pointer rounded-s-full"
                            >
                                <Upload className="desktop-page-btn text-background" />
                            </Button>
                        )}

                        {canImportProjects && canExportProjects && (
                            <div className="z-10 w-px lg:h-5 xl:h-full bg-background" />
                        )}

                        {canExportProjects && (
                            <Button
                                size="icon"
                                onClick={handleOpenExportModal}
                                disabled={isExportingProjects}
                                title="Export Projects"
                                className="transition-colors bg-transparent border-none shadow-none cursor-pointer rounded-none disabled:opacity-70"
                            >
                                <Download className="desktop-page-btn text-background" />
                            </Button>
                        )}

                        {(canImportProjects || canExportProjects) && (
                            <div className="z-10 w-px lg:h-5 xl:h-5/6 bg-background" />
                        )}

                        <Button
                            size="icon"
                            onClick={handleAddProject}
                            title="Add Project"
                            className="transition-colors bg-transparent border-none shadow-none cursor-pointer rounded-e-full"
                        >
                            <PlusCircleIcon className="w-5 desktop-page-btn text-background" />
                        </Button>
                    </div>


                </div>
            </div>

            <div className="flex flex-col flex-1 w-full min-h-0">
                {isLoading ? (
                    <>
                        <div className="mt-6 md:hidden ">
                            <MobileProjectCardSkeleton cards={5} />
                        </div>
                        <div className="hidden px-2 border shadow-sm md:flex-1 md:flex md:flex-col md:min-h-0 bg-background border-border/50">
                            <ProjectTableSkeleton
                                rows={5}
                                columnVisibility={columnVisibility}
                                columnPinning={columnPinning}
                                columnSizing={columnSizing}
                            />
                        </div>
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
                                    <MobileProjectCard
                                        key={project._id}
                                        project={project}
                                        serialNumber={(currentPage - 1) * itemsPerPage + index + 1}
                                        onEdit={handleEditProject}
                                        onArchive={handleArchiveProject}
                                        onRestore={handleRestoreProject}
                                        onViewDetails={handleViewProjectDetails}
                                        selectedProjectIds={selectedProjectIds}
                                        onSelectChange={setSelectedProjectIds}
                                        canArchive={hasPermission(permissions, PERMISSIONS.PROJECT.DELETE)}
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

                        <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0 ">
                            <DesktopProjectTable
                                projects={projects}
                                selectedProjectIds={selectedProjectIds}
                                onSelectChange={setSelectedProjectIds}
                                onBulkArchiveClick={() => {
                                    const selectedObjects = projects.filter(p => selectedProjectIds.includes(p._id));
                                    setSelectedProject(selectedObjects);
                                    setIsArchiveModalOpen(true);
                                }}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                                totalPages={pagination?.totalPages || 1}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(val) => {
                                    setItemsPerPage(val);
                                    setCurrentPage(1);
                                }}
                                onEdit={handleEditProject}
                                onArchive={handleArchiveProject}
                                onRestore={handleRestoreProject}
                                onViewDetails={handleViewProjectDetails}
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

            {/* Mobile Modal - ProjectModal */}
            {isMobile && (
                <ProjectModal
                    open={isProjectModalOpen}
                    onOpenChange={setIsProjectModalOpen}
                    project={selectedProject}
                    mode={projectModalMode}
                    onConfirm={handleProjectConfirm}
                />
            )}

            {/* Desktop Modal - DesktopCreateProjectWithMemberModal */}
            {!isMobile && projectModalMode === "create" && (
                <DesktopCreateProjectWithMemberModal
                    open={isProjectModalOpen}
                    onOpenChange={setIsProjectModalOpen}
                    onConfirm={handleProjectConfirm}
                />
            )}

            {/* Desktop Edit Mode - Still use ProjectModal */}
            {!isMobile && projectModalMode === "update" && (
                <ProjectModal
                    open={isProjectModalOpen}
                    onOpenChange={setIsProjectModalOpen}
                    project={selectedProject}
                    mode={projectModalMode}
                    onConfirm={handleProjectConfirm}
                />
            )}

            <ArchiveProjectModal
                open={isArchiveModalOpen}
                onOpenChange={setIsArchiveModalOpen}
                project={selectedProject}
                onConfirm={handleArchiveConfirm}
            />

            <RestoreProjectModal
                open={isRestoreModalOpen}
                onOpenChange={setIsRestoreModalOpen}
                project={selectedProject}
                onConfirm={handleRestoreConfirm}
            />

            <UploadCSVModal
                open={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                onUpload={async (file) => {
                    await handleImportProjects(file);
                    setIsUploadModalOpen(false);
                    setIsUploadSuccessModalOpen(true);
                }}
                isLoading={isImportingProjects}
                uploadError={importProjectsError}
            />

            <UploadSuccessModal
                open={isUploadSuccessModalOpen}
                onOpenChange={setIsUploadSuccessModalOpen}
                result={importProjectsResult}
            />

            <ExportProjectsModal
                open={isExportModalOpen}
                onOpenChange={setIsExportModalOpen}
                selectedLimit={exportLimit}
                onLimitChange={setExportLimit}
                selectedPage={exportPage}
                onPageChange={setExportPage}
                totalItems={pagination?.total || 0}
                onConfirm={handleExportConfirm}
                isLoading={isExportingProjects}
            />

            <MobileBulkActionBar
                selectedCount={selectedProjectIds.length}
                onCancel={() => setSelectedProjectIds([])}
                onAction={() => {
                    const selectedObjects = projects.filter(p => selectedProjectIds.includes(p._id));
                    setSelectedProject(selectedObjects);
                    setIsArchiveModalOpen(true);
                }}
            />
        </section>
    );
}
