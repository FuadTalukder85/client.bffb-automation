import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Plus } from "lucide-react";
import { statusOptions } from "./constants/projectOptions";
import DesktopSampleDetailTable from "./components/DesktopSampleDetailTable";
import MobileSampleDetailCard from "./components/MobileSampleDetailCard";
import { SamplePreparationTableSkeleton } from "./components/SamplePreparationTableSkeleton";
import { MobileSamplePreparationCardSkeleton } from "./components/MobileSamplePreparationCardSkeleton";
import { useSamplePreparationDetailLogic } from "./hooks/useSamplePreparationDetailLogic";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ActionButtonsGroup } from "@/components/ui/ActionButtonsGroup";
import { Pagination } from "@/components/ui/Pagination";
import PageHeader from "@/components/common/page-header";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { SampleModal } from "./components/Modals/SampleModal";
import { ArchiveSampleModal } from "./components/Modals/ArchiveSampleModal";
import { RestoreSampleModal } from "./components/Modals/RestoreSampleModal";
import { useCreateSample, useUpdateSample, useDeleteSample, useRestoreSample } from "@/hooks/useSamples";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { useCreateProjectTask } from "@/hooks/mutations/useProjectTaskMutations";
import { AssignTaskModal, TaskAssignedModal } from "@/features/project-overview/components/TaskAutomationModals";

const activeOptions = [
    // { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Archive", value: "archived" },
];

const ADD_SAMPLE_TASKS = [
    {
        title: "HOD Approval",
        responsibility: "HOD Approval",
        module: "application-lab",
        subModule: "lab-records",
    },
];

const SamplePreparationDetailPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    // Modal states
    const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
    const [sampleModalMode, setSampleModalMode] = useState("create");
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);

    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [assignedTasksList, setAssignedTasksList] = useState([]);
    const [pendingSampleData, setPendingSampleData] = useState(null);

    const { data: projectMembers = [] } = useProjectMembers(projectId);
    const { mutateAsync: createProjectTask } = useCreateProjectTask();

    // Use the hook to fetch samples from API
    const {
        projectTitle,
        projectCode,
        samples: filteredSamples,
        searchTerm,
        selectedStatus,
        selectedPeriod,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        sorting,
        setSorting,
        columnVisibility,
        setColumnVisibility,
        columnPinning,
        setColumnPinning,
        columnSizing,
        setColumnSizing,
        isLoading,
        error,
        handleSearchChange,
        handleStatusChange,
        handlePeriodChange,
    } = useSamplePreparationDetailLogic(projectId);

    // Mutations
    const createSampleMutation = useCreateSample();
    const updateSampleMutation = useUpdateSample();
    const deleteSampleMutation = useDeleteSample();
    const restoreSampleMutation = useRestoreSample();

    const filters = useMemo(() => [
        {
            id: "active-toggle",
            label: "Toggle",
            value: selectedPeriod,
            options: activeOptions,
            onChange: handlePeriodChange,
        },
        {
            id: "status-filter",
            label: "Status",
            value: selectedStatus,
            options: statusOptions,
            onChange: handleStatusChange,
        },
    ], [selectedPeriod, selectedStatus, handlePeriodChange, handleStatusChange]);

    const actionButtons = useMemo(() => [
        {
            label: "Add Sample",
            icon: <Plus className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />,
            onClick: () => {
                setSampleModalMode("create");
                setSelectedSample(null);
                setPendingSampleData(null);
                setIsSampleModalOpen(true);
            },
            className: "bg-primary text-white",
        },
    ], []);

    const errorMessage = error ? (error?.response?.data?.error || error?.response?.data?.message || error?.message || "Failed to load samples") : "";
    const hasError = Boolean(errorMessage);

    const handleEdit = (sample) => {
        setSampleModalMode("update");
        setSelectedSample(sample);
        setIsSampleModalOpen(true);
    };

    const handleDelete = (sample) => {
        setSelectedSample(sample);
        setIsArchiveModalOpen(true);
    };

    const handleRestore = (sample) => {
        setSelectedSample(sample);
        setIsRestoreModalOpen(true);
    };

    const handleRestoreConfirm = async (sample) => {
        try {
            await restoreSampleMutation.mutateAsync(sample._id);
            setIsRestoreModalOpen(false);
        } catch (error) {
            console.error("Error restoring sample:", error);
        }
    };

    const noDataDescription = searchTerm?.trim()
        ? `No samples match "${searchTerm.trim()}". Try adjusting your search.`
        : "No samples match your current filters. Try adjusting your search or filter criteria.";

    const handleSampleConfirm = async (formData) => {
        try {
            if (sampleModalMode === "create") {
                setPendingSampleData(formData);
                setSelectedSample(formData);
                setIsSampleModalOpen(false);
                setIsAssignOpen(true);
            } else {
                await updateSampleMutation.mutateAsync({ id: selectedSample._id, data: formData });
                setIsSampleModalOpen(false);
            }
        } catch (error) {
            console.error("Error saving sample:", error);
            // Handle error (could show toast or something)
        }
    };

    const handleAssignConfirm = async (taskAssignments) => {
        try {
            // 1. Create the sample first
            if (pendingSampleData) {
                await createSampleMutation.mutateAsync(pendingSampleData);
            }

            // 2. Create the project tasks
            const createdTasksSummary = [];
            for (const task of ADD_SAMPLE_TASKS) {
                const assignment = taskAssignments[task.title];
                if (!assignment || !Array.isArray(assignment.assignedTo) || assignment.assignedTo.length === 0) continue;

                const assigneeNames = [];
                for (const userId of assignment.assignedTo) {
                    const member = projectMembers.find((m) => m.user?._id === userId || m.user === userId);
                    const assigneeName = member ? (member.user?.name || "Unknown") : "Unknown User";
                    assigneeNames.push(assigneeName);

                    const taskPayload = {
                        title: task.title,
                        description: assignment.description || "",
                        project: projectId,
                        assignedTo: userId,
                        module: task.module,
                        subModule: task.subModule,
                        startDate: assignment.startDate || null,
                        dueDate: assignment.dueDate || null,
                    };

                    await createProjectTask(taskPayload);
                }

                createdTasksSummary.push({
                    title: task.title,
                    assigneeName: assigneeNames.join(", "),
                    startDate: assignment.startDate,
                    dueDate: assignment.dueDate,
                });
            }

            setAssignedTasksList(createdTasksSummary);
            setIsAssignOpen(false);
            setIsSuccessOpen(true);
            setPendingSampleData(null);
            setSelectedSample(null);
        } catch (error) {
            console.error("Failed to complete task assignments:", error);
            alert(error.message || "Failed to complete task assignments. Please try again.");
        }
    };

    const handleAssignBack = () => {
        setIsAssignOpen(false);
        setIsSampleModalOpen(true);
    };

    const handleSuccessClose = () => {
        setIsSuccessOpen(false);
        setAssignedTasksList([]);
        setPendingSampleData(null);
        setSelectedSample(null);
    };

    const handleArchiveConfirm = async (sample) => {
        try {
            await deleteSampleMutation.mutateAsync(sample._id);
            setIsArchiveModalOpen(false);
        } catch (error) {
            console.error("Error archiving sample:", error);
        }
    };

    return (
        <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
            {/* Header Section */}
            <div className="flex justify-between flex-none ms-0 lg:ms-5">
                <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
                    <BackButton 
                        onClick={() => navigate("/application-lab/sample-preparation-and-packaging")} 
                        className="md:flex"
                    />
                    <PageHeader 
                        title={projectTitle || "Sample Details"} 
                        subTitle={projectCode || ""}
                        className="text-heading"
                    />
                </div>

                <div className="hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
                       <Button
                        onClick={actionButtons[0].onClick}
                        className="flex items-center justify-center gap-1 lg:gap-0.5 xl:gap-0.5 2xl:gap-[3px] 3xl:gap-1 h-8 lg:h-5.5 xl:h-6.5 2xl:h-7.5 3xl:h-9 px-3 lg:px-2 xl:px-3 2xl:px-3.5 3xl:px-4 text-white bg-primary rounded-xl text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
                    >
                        <span className="text-lg lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg leading-none">+</span>
                        {/* <Plus className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" /> */}
                        Add Sample
                    </Button>
                   <div>
                     <SearchInput
                        placeholder="Search samples..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                   </div>
                    <ThemeToggle />
                </div>

                <div className="md:hidden">
                    {isMobile && (
                    <ActionButtonsGroup 
                        actions={actionButtons}
                    />
                )}
                </div>
            </div>

            {/* Mobile Search & Filters */}
            <SearchFilterBar
                searchTerm={searchTerm}
                onSearchChange={(e) => handleSearchChange(e.target.value)}
                searchPlaceholder="Search samples..."
                hideOnDesktop={true}
                filters={filters}
            />

            {/* Desktop Filters Section */}
            <div className="flex-none hidden mb-4 md:block ms-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* <DesktopFilterPills
                            value={selectedStatus}
                            options={statusOptions}
                            onChange={handleStatusChange}
                            variant="tabs"
                        /> */}
                    </div>

                    <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
                        <DesktopFilterPills
                            value={selectedPeriod}
                            options={activeOptions}
                            onChange={handlePeriodChange}
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-1 w-full min-h-0">
                {isLoading ? (
                    <div className="flex-none">
                        {isMobile ? (
                            <MobileSamplePreparationCardSkeleton count={5} />
                        ) : (
                            <SamplePreparationTableSkeleton />
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table (Desktop only) */}
                        {!isMobile && (
                            <div className="hidden px-2 md:flex-1 md:flex md:flex-col md:min-h-0">
                                <DesktopSampleDetailTable
                                    samples={filteredSamples}
                                    currentPage={currentPage}
                                    itemsPerPage={itemsPerPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={(val) => {
                                        setItemsPerPage(val);
                                        setCurrentPage(1);
                                    }}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRestore={handleRestore}
                                    sorting={sorting}
                                    onSortingChange={setSorting}
                                    columnVisibility={columnVisibility}
                                    onColumnVisibilityChange={setColumnVisibility}
                                    columnPinning={columnPinning}
                                    onColumnPinningChange={setColumnPinning}
                                    columnSizing={columnSizing}
                                    onColumnSizingChange={setColumnSizing}
                                    noDataMessage="No Samples Found"
                                    noDataDescription={noDataDescription}
                                    emptyState={
                                        hasError ? (
                                            <div className="py-10 text-center text-red-500">{errorMessage}</div>
                                        ) : null
                                    }
                                />
                            </div>
                        )}

                        {/* Mobile View (Listing + Pagination) */}
                        {isMobile && (
                            <div className="md:hidden">
                                {filteredSamples.length > 0 ? (
                                    <>
                                        <div className="space-y-3">
                                            {filteredSamples.map((sample, index) => (
                                                <MobileSampleDetailCard
                                                    key={sample._id}
                                                    sample={sample}
                                                    serialNumber={
                                                        (currentPage - 1) * itemsPerPage +
                                                        (index + 1)
                                                    }
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                    onRestore={handleRestore}
                                                />
                                            ))}
                                        </div>

                                        <div className="px-4 pb-2 mt-6 text-center">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                                isMobile={true}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        {hasError ? (
                                            <div className="text-red-500">{errorMessage}</div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-muted">
                                                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="mb-2 text-lg font-semibold">
                                                    No Samples Found
                                                </h3>
                                                <p className="max-w-sm text-sm text-muted-foreground">
                                                    {noDataDescription}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <SampleModal
                open={isSampleModalOpen}
                onOpenChange={setIsSampleModalOpen}
                mode={sampleModalMode}
                sample={selectedSample}
                projectId={projectId}
                onConfirm={handleSampleConfirm}
            />

            <ArchiveSampleModal
                open={isArchiveModalOpen}
                onOpenChange={setIsArchiveModalOpen}
                sample={selectedSample}
                onConfirm={handleArchiveConfirm}
            />

            <RestoreSampleModal
                open={isRestoreModalOpen}
                onOpenChange={setIsRestoreModalOpen}
                sample={selectedSample}
                onConfirm={handleRestoreConfirm}
            />

            <AssignTaskModal
                open={isAssignOpen}
                onOpenChange={handleAssignBack}
                tasks={ADD_SAMPLE_TASKS}
                projectMembers={projectMembers}
                onConfirm={handleAssignConfirm}
                onBack={handleAssignBack}
                title="Assign Task"
            />

            <TaskAssignedModal
                open={isSuccessOpen}
                onClose={handleSuccessClose}
                assignedTasks={assignedTasksList}
                projectName={projectTitle || "Project"}
            />
        </section>
    );
};

export default SamplePreparationDetailPage;
