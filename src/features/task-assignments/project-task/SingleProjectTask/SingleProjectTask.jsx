import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BackButton } from "@/components/ui/BackButton";
import MobileSingleProjectTaskList from "./components/MobileSingleProjectTaskList";
import { DesktopSingleProjectTaskTable } from "./components/DesktopSingleProjectTaskTable";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { Plus, Loader2, ChevronRight, Download } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { CreateTaskModal } from "./components/CreateTaskModal";
import { useProjectTasksByProject } from "@/hooks/useProjectTasks";
import { useProject } from "@/hooks/useProjects";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  useDeleteProjectTask,
  useRestoreProjectTask,
  useUpdateProjectTaskStatus,
} from "@/hooks/mutations";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/lib/utils";
import api from "@/lib/api";

// Mobile status options (full list)
const mobileStatusOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Transferred", value: "transferred" },
];

const stateOptions = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
  { label: "All", value: "all" },
];

// Desktop status options (without "All" as first option for pills)
const desktopStatusOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Transferred", value: "transferred" },
];

// Progress/status options for filters
const progressOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Transferred", value: "transferred" },
];

const SingleProjectTask = () => {
  const { taskId: projectId } = useParams(); // taskId param is actually projectId
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgress, setFilterProgress] = useState("all");
  const [selectedState, setSelectedState] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  useEffect(() => {
    setSelectedRowIds([]);
  }, [currentPage, searchTerm, filterProgress, selectedState]);

  // Fetch project details using TanStack Query
  const { data: project } = useProject(projectId);

  // Mutations
  const { mutateAsync: deleteTask } = useDeleteProjectTask();
  const { mutateAsync: restoreTask } = useRestoreProjectTask();
  const { mutateAsync: updateTaskStatus } = useUpdateProjectTaskStatus();

  const isActiveFilter = useMemo(() => {
    if (selectedState === "active") return true;
    if (selectedState === "archived") return false;
    if (selectedState === "all") return "all";
    return true;
  }, [selectedState]);

  // Fetch tasks for this project from API
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useProjectTasksByProject(projectId, {
    searchTerm,
    status: filterProgress,
    isActive: isActiveFilter,
    page: currentPage,
    limit: itemsPerPage,
  });

  const errorMessage = error ? getApiErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  // Extract tasks array and pagination from the query result
  const tasks = tasksData?.data ?? [];
  const pagination = tasksData?.pagination;

  // Calculate pagination from API
  const totalPages = pagination?.totalPages || 1;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = useCallback((value) => {
    setFilterProgress(value);
    setCurrentPage(1);
  }, []);

  const handleProgressChange = useCallback((value) => {
    setFilterProgress(value);
    setCurrentPage(1);
  }, []);

  const handleStateChange = useCallback((value) => {
    setSelectedState(value);
    setCurrentPage(1);
  }, []);

  const filters = useMemo(
    () => [
      {
        id: "progress",
        value: filterProgress,
        onChange: handleProgressChange,
        options: progressOptions,
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
    [filterProgress, selectedState, handleProgressChange, handleStateChange],
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const handleBack = () => {
    navigate("/project-tasks");
  };

  const handleArchiveTask = async (task) => {
    try {
      if (Array.isArray(task)) {
        const results = await Promise.allSettled(
          task.map((r) => deleteTask(r._id || r.id))
        );
        const succeeded = results.filter((res) => res.status === "fulfilled").length;
        const failed = results.filter((res) => res.status === "rejected");
        if (succeeded > 0) toast.success(`${succeeded} task(s) archived successfully`);
        if (failed.length > 0) toast.error(`Failed to archive ${failed.length} task(s)`);
        setSelectedRowIds([]);
      } else {
        const taskId = task._id || task.id;
        await deleteTask(taskId);
        toast.success("Task archived successfully");
      }
    } catch (err) {
      console.error("Failed to archive task:", err);
      toast.error("Failed to archive task");
    }
  };

  const handleRestoreTask = async (task) => {
    try {
      const taskId = task._id || task.id;
      await restoreTask(taskId);
      // Cache is automatically invalidated
    } catch (err) {
      console.error("Failed to restore task:", err);
    }
  };

  const handleUpdateTaskStatus = async (task, newStatus) => {
    try {
      const taskId = task._id || task.id;
      await updateTaskStatus({ id: taskId, status: newStatus });
      // Cache is automatically invalidated
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const { permissions = [] } = useUserPermissions();
  const canExportTasks = hasPermission(permissions, PERMISSIONS.PROJECT_TASK.EXPORT);

  const handleExportTasks = async () => {
    try {
      const params = { projectId };
      const response = await api.get("/project-tasks/export", {
        params,
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const filename = `project-tasks-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export project tasks:", error);
    }
  };

  const handleCreateSuccess = () => {
    // Cache is automatically invalidated by the mutation
  };

  // Keep layout stable when changing filters — show loader inline in the content area
  // instead of returning early and replacing the whole page header/filters.

  const breadcrumbItems = [
    { label: "Project Tasks", onClick: handleBack },
    { label: project?.masterProject?.title || "Project Name" },
  ];

  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
     {/* MOBILE HEADER */}
     <div className="flex items-center justify-between py-4 ms-0 md:hidden">
       <div className="flex items-start gap-3">
         <BackButton onClick={handleBack} className="mt-1" />
         <div className="flex flex-col">
           <span
             className="text-lg font-medium cursor-pointer text-base-color hover:text-primary"
             onClick={handleBack}
           >
             Project Tasks
           </span>
           <div className="flex items-center text-xl font-bold text-nav-highlight -ms-1">
             <ChevronRight size={20} />
             <span className="truncate max-w-[130px]">
               {project?.masterProject?.title || "Project Name"}
             </span>
           </div>
         </div>
       </div>
       <div className="flex items-center gap-2">
         <FloatingButton
           className={"md:hidden static m-0"}
           icon={Plus}
           onClick={() => setIsCreateTaskModalOpen(true)}
         ></FloatingButton>
       </div>
     </div>

     {/* DESKTOP HEADER */}
     <div className="items-center justify-between hidden md:flex ms-0 lg:ms-5">
       <div className="flex items-center gap-3 py-4 md:p-0 md:m-0">
         <BackButton onClick={handleBack} />
         <Breadcrumb items={breadcrumbItems} />
       </div>
       <div className="items-center hidden gap-2 md:flex">
         <SearchInput
           placeholder="Search..."
           value={searchTerm}
           onChange={handleSearchChange}
         />
         <ThemeToggle />
       </div>
     </div>
      {/* Desktop Header with Breadcrumb */}
      {/* <div className="items-center justify-between hidden md:flex ms-5">
        // Breadcrumb
        <div className="flex items-center gap-2 py-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-8 h-8 transition-colors rounded-full bg-primary-shade-2 text-primary hover:bg-primary-shade-2/80"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-heading">
            Project Task
          </h1>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-heading">
            {project?.name || "Loading..."}
          </h2>
        </div>

        // Search & Theme Toggle (Desktop Only)
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <ThemeToggle />
        </div>
      </div> */}

      {/* Mobile Filter Input */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search tasks..."
        filters={filters}
        hideOnDesktop={true}
        defaultFilterValue="active"
      />

      <div className="flex justify-between my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        {/* Desktop Status Filter Pills (above Active/Archived) */}
        <div className="flex-none hidden md:block ms-5 me-5">
          <DesktopFilterPills
            value={filterProgress}
            options={desktopStatusOptions}
            onChange={handleProgressChange}
          />
        </div>

        {/* Desktop Active/Archived Filter + Add Task Button */}
        <div className="flex-none hidden md:block ms-5 me-5">
          <div className="flex items-center justify-between gap-4">
            <DesktopFilterPills
              value={selectedState}
              options={stateOptions}
              onChange={handleStateChange}
            />
            {canExportTasks && (
              <Button
                intent="secondary"
                onClick={handleExportTasks}
                className="lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 px-5 rounded-full border border-primary text-primary hover:bg-primary/10"
              >
                <Download className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 mr-2" />
                Export
              </Button>
            )}
            <Button
              intent="primary"
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 px-5 text-white rounded-full bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full flex flex-col min-h-0">

        {/* Inline loader for empty-state fetches — keeps header/layout stable */}
        {isLoading && !tasks?.length && (
          <div className="flex-none flex items-center justify-center min-h-[200px] md:hidden">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Mobile UI */}
        <div className="md:hidden">
          <MobileSingleProjectTaskList
            tasks={tasks}
            onArchive={handleArchiveTask}
            onRestore={handleRestoreTask}
            onUpdateStatus={handleUpdateTaskStatus}
            searchTerm={searchTerm}
            errorMessage={errorMessage}
            hasError={hasError}
          />
        </div>

        {/* Desktop UI */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
          <DesktopSingleProjectTaskTable
            tasks={tasks}
            isLoading={isLoading}
            selectedRowIds={selectedRowIds}
            onSelectionChange={setSelectedRowIds}
            isArchived={selectedState === "archived"}
            onArchive={handleArchiveTask}
            onRestore={handleRestoreTask}
            onUpdateStatus={handleUpdateTaskStatus}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            noDataMessage="No Tasks Found"
            noDataDescription={searchTerm
              ? `No tasks match "${searchTerm}". Try adjusting your search.`
              : "No tasks available yet."}
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

      {/* Pagination - following invite-access pattern */}
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

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
        projectId={projectId}
        onSuccess={handleCreateSuccess}
      />
    </section>
  );
};

export default SingleProjectTask;
