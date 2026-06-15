import React, { useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination } from "@/components/ui/Pagination";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { Plus } from "lucide-react";
import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";
import { useDebounce } from "@/hooks/useDebounce";
import { useInternalTasks } from "@/hooks/useInternalTasks";
import { DesktopInternalTaskTable } from "./components/DesktopInternalTaskTable";
import { MobileInternalTaskList } from "./components/MobileInternalTaskList";
import { CreateInternalTaskModal } from "./components/CreateInternalTaskModal";
import { TaskAddedModal } from "./components/TaskAddedModal";
import { EditInternalTaskModal } from "./components/EditInternalTaskModal";
import { ArchiveInternalTaskModal } from "./components/ArchiveInternalTaskModal";
import { TaskUpdatedModal } from "./components/TaskUpdatedModal";
import { RestoreInternalTaskModal } from "./components/RestoreInternalTaskModal";
import { formatDate, getDurationInDays } from "@/utils/dateFormatter";

const statusOptions = createFilterOptions(
  buildStatusOptions([
    { label: "Not Started", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ]),
  "All"
);

const stateOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

const toTitleCase = (text) => {
  if (!text) return "-";
  return `${text}`
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const normalizeInternalTask = (task) => {
  const assignedName =
    task?.assignedTo?.name ||
    task?.assignedTo?.username ||
    task?.assignedTo?.email ||
    "-";

  const assignedAdditional =
    task?.assignedTo?.email && task?.assignedTo?.email !== assignedName
      ? task.assignedTo.email
      : undefined;

  return {
    id: task?._id || task?.id,
    task: task?.title || "-",
    assignedTo: {
      name: assignedName,
      additional: assignedAdditional,
      avatar: null,
    },
    team: task?.team?.name || "-",
    status: toTitleCase(task?.status),
    duration: getDurationInDays(task?.startDate, task?.dueDate),
    startDate: formatDate(task?.startDate),
    endDate: task?.dueDate ? formatDate(task?.dueDate) : "-",
    reoccurring: task?.isRecurring ? "Yes" : "No",
    frequency: task?.frequency ? toTitleCase(task.frequency) : "-",
    isActive: task?.isActive !== undefined ? task.isActive : true,
  };
};

const InternalTask = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedState, setSelectedState] = useState("active"); // Active vs Archived
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTaskAddedModalOpen, setIsTaskAddedModalOpen] = useState(false);
  const [addedTaskName, setAddedTaskName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isTaskUpdatedModalOpen, setIsTaskUpdatedModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForEdit, setTaskForEdit] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useInternalTasks({
    searchTerm: debouncedSearchTerm,
    status: selectedStatus,
    isActive: selectedState,
    page: currentPage,
    limit: itemsPerPage,
  });

  const errorMessage = error
    ? error?.response?.data?.error || error?.message || "Failed to load tasks"
    : "";
  const hasError = Boolean(errorMessage);

  // Extract serverTasks array and pagination from the query result
  const serverTasks = tasksData?.data ?? [];
  const pagination = tasksData?.pagination;

  const normalizedTasks = useMemo(() => {
    return (serverTasks || []).map(normalizeInternalTask);
  }, [serverTasks]);

  const totalPages = pagination?.totalPages ?? 0;
  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No tasks match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  }, []);

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

  const filters = useMemo(
    () => [
      {
        id: "status",
        value: selectedStatus,
        onChange: handleStatusChange,
        options: statusOptions,
        placeholder: "All",
      },
      {
        id: "state",
        value: selectedState,
        onChange: handleStateChange,
        options: stateOptions,
        placeholder: "Active",
      },
    ],
    [selectedStatus, selectedState, handleStatusChange, handleStateChange]
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const findServerTaskById = useCallback(
    (taskId) =>
      (serverTasks || []).find(
        (serverTask) =>
          (serverTask?._id || serverTask?.id)?.toString() === taskId?.toString()
      ),
    [serverTasks]
  );

  const handleEditTask = (task) => {
    const originalTask = findServerTaskById(task?.id);
    setTaskForEdit(originalTask || task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (task) => {
    // This is called when opening the archive modal
    setSelectedTask(task);
    setIsArchiveModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsTaskUpdatedModalOpen(true);
    refetch();
  };

  const handleArchiveConfirm = () => {
    // The API call is handled in ArchiveInternalTaskModal
    // Just refetch the list after confirmation
    refetch();
  };

  const handleAddTask = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = (taskName) => {
    // console.log("Task created successfully:", taskName);
    setAddedTaskName(taskName);
    setIsTaskAddedModalOpen(true);
    refetch?.();
  };

  const handleRestore = (task) => {
    // Open the restore confirmation modal
    setSelectedTask(task);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = () => {
    // The API call is handled in RestoreInternalTaskModal
    // Just refetch the list after confirmation
    refetch();
  };

  const handleEditModalToggle = (open) => {
    setIsEditModalOpen(open);
    if (!open) {
      setTaskForEdit(null);
    }
  };

  return (
    <section className=" flex flex-col px-0  page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Page Header & Search & Theme Toggle(Desktop Only) */}
      <div className="flex-none flex items-center justify-between ms-0 lg:ms-5">
        <PageHeader
          title="Internal Tasks"
          className={"text-heading py-4 md:p-0 md:m-0"}
        />

        <FloatingButton
          className={"md:hidden static m-0"}
          icon={Plus}
          onClick={handleAddTask}
        >
          Add Task
        </FloatingButton>

        {/* Search & Theme Toggle(Desktop Only) */}
        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Filter Input */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search..."
        filters={filters}
        hideOnDesktop={true}
        defaultFilterValue="active"
      />

      {/* Desktop Filter Input */}
      <div className="flex-none hidden md:block ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        <div className="flex justify-between">
          {/* Top Row: Status Filters & Add Task Button */}
          <div className="">
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
           
          </div>

          {/* Bottom Row: State Filters (Active/Archived) */}
          <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
            <DesktopFilterPills
              value={selectedState}
              options={stateOptions}
              onChange={handleStateChange}
            />
             <FloatingButton
              className={"hidden md:flex md:static px-4 lg:py-1.5 xl:py-2 2xl:py-2.5"}
              icon={Plus}
              onClick={handleAddTask}
            >
              Add Task
            </FloatingButton>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Mobile UI */}
        <MobileInternalTaskList
          tasks={normalizedTasks}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onRestore={handleRestore}
          isLoading={isLoading}
          refetch={refetch}
          noDataMessage={noDataMessage}
          noDataDescription={noDataDescription}
          errorMessage={errorMessage}
          hasError={hasError}
        />

        {/* Desktop UI */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
          <DesktopInternalTaskTable
            tasks={normalizedTasks}
            isLoading={isLoading}
            selectedFilter={selectedStatus}
            searchTerm={debouncedSearchTerm}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onRestore={handleRestore}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            refetch={refetch}
            emptyState={
              hasError ? (
                <div className="py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : null
            }
          />
        </div>
      </div>

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}

      {/* Create Internal Task Modal */}
      <CreateInternalTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Task Added Success Modal */}
      <TaskAddedModal
        open={isTaskAddedModalOpen}
        onOpenChange={setIsTaskAddedModalOpen}
        taskName={addedTaskName}
      />

      {/* Edit Internal Task Modal */}
      <EditInternalTaskModal
        open={isEditModalOpen}
        onOpenChange={handleEditModalToggle}
        task={taskForEdit}
        onSuccess={handleEditSuccess}
      />

      {/* Archive Internal Task Modal */}
      <ArchiveInternalTaskModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        task={selectedTask}
        onConfirm={handleArchiveConfirm}
      />

      {/* Task Updated Success Modal */}
      <TaskUpdatedModal
        open={isTaskUpdatedModalOpen}
        onOpenChange={setIsTaskUpdatedModalOpen}
      />

      {/* Restore Internal Task Modal */}
      <RestoreInternalTaskModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        task={selectedTask}
        onConfirm={handleRestoreConfirm}
      />
    </section>
  );
};

export default InternalTask;
