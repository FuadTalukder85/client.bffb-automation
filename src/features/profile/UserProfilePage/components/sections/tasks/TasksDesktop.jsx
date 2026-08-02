import React, { useMemo } from "react";
import { ExternalLink, RefreshCcw } from "lucide-react";
import { AiOutlineFileDone } from "react-icons/ai";
import { PaginatedTable, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import StatusBadge from "@/components/ui/StatusBadge";
import { useUserProfile, PROFILE_TABS, TASK_MODAL_TYPES } from "../../../UserProfileContext";
import {
  PROJECT_TASK_STATUS_OPTIONS,
  INTERNAL_TASK_STATUS_OPTIONS,
  TASK_RUN_SCOPE_OPTIONS,
  toTitleCase,
  normalizePagination,
  statusMatchesFilter,
  getTaskProjectId,
  getTaskProjectName,
  getDisplayName,
  getInitials,
  normalizeStatus,
  getTaskRedirectPath,
} from "../../../utils";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { formatDate, DATE_FORMATS } from "@/utils/dateFormatter";
import api from "@/lib/api";
import { resolveAvatarUrl } from "@/utils/avatarUrl";

const TabButton = ({ id, label, isActive, count, onClick }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`relative 3xl:w-[140px] 2xl:w-[120px] xl:w-[100px] lg:w-[80px] w-[65px] shrink-0 3xl:px-2 2xl:px-1.5 xl:px-1 lg:px-0.5 px-0.5 3xl:py-2 2xl:py-1.5 xl:py-1 lg:py-0.5 py-0.5 3xl:text-[14px] 2xl:text-[12px] xl:text-[10px] lg:text-[8px] text-[6.5px] font-semibold transition-colors ${isActive
        ? "bg-primary-shade-2 text-nav-highlight"
        : "bg-transparent text-lighter-text hover:text-foreground"
        }`}
    >
      <span className="truncate">{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="absolute top- right-.5 3xl:min-w-3.5 2xl:min-w-3 lg:min-w-2 min-w-2 3xl:h-3.5 2xl:h-3 lg:h-2.5 h-2 3xl:px-1 2xl:px-0.5 xl:px-0.5 lg:px-0.5 rounded-md bg-primary text-white 3xl:text-[10px] 2xl:text-[9px] xl:text-[8px] lg:text-[7px] text-[5.5px] 3xl:leading-4 2xl:leading-3.5 xl:leading-3 lg:leading-2.5 leading-2 font-medium">
          {count}
        </span>
      ) : null}
    </button>
  );
};

const TaskStatusFilters = ({ options, selectedValue, onChange }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-0.5 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 border-b border-border">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`3xl:px-4 2xl:px-3.5 xl:px-3 lg:px-2.5 px-2 3xl:py-2 2xl:py-1.5 xl:py-1 lg:py-0.5 py-0.5 3xl:text-[14px] 2xl:text-[12px] xl:text-[10px] lg:text-[8px] text-[6.5px] font-medium transition-colors border-b-2 whitespace-nowrap ${isSelected ? "" : "border-transparent text-lighter-text hover:text-foreground"
                }`}
              style={{
                color: isSelected ? option.textColor : undefined,
                borderBottomColor: isSelected ? option.textColor : "transparent",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TasksDesktop = () => {
  const {
    activeProfileTab,
    setActiveProfileTab,
    projectTasks,
    internalTasks,
    notifications,
    projectTasksResponse,
    internalTasksResponse,
    projectTaskStatusFilter,
    setProjectTaskStatusFilter,
    internalTaskStatusFilter,
    setInternalTaskStatusFilter,
    taskRunScope,
    setTaskRunScope,
    taskCurrentPage,
    setTaskCurrentPage,
    taskItemsPerPage,
    setTaskItemsPerPage,
    notificationCurrentPage,
    setNotificationCurrentPage,
    notificationItemsPerPage,
    setNotificationItemsPerPage,
    memberProjects,
    setSelectedProject,
    setActiveTab,
    setStatusModalState,
    userId,
    queryClient,
    notificationsResponse = null,
    debouncedSearch,
    unreadNotificationCount,
    incompleteProjectTaskCount,
    incompleteInternalTaskCount,
  } = useUserProfile();

  const noDataMessage = "No Tasks Found";
  const noDataDescription = debouncedSearch
    ? `No tasks match "${debouncedSearch}". Try adjusting your search.`
    : "No tasks available yet.";

  const handleOpenStatusModal = (task, taskType) => {
    const isProject = taskType === TASK_MODAL_TYPES.PROJECT;
    const options = isProject ? [
      { label: "Pending", value: "pending" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ] : [
      { label: "Pending", value: "pending" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ];

    const normalizedCurrentStatus = normalizeStatus(task?.status);
    const fallbackStatus = options[0]?.value || "pending";
    const nextStatus = options.some((option) => option.value === normalizedCurrentStatus)
      ? normalizedCurrentStatus
      : fallbackStatus;

    setStatusModalState({
      open: true,
      taskType,
      task,
      status: nextStatus,
      error: "",
    });
  };

  const handleOpenTaskAction = (task) => {
    window.location.href = getTaskRedirectPath(task);
  };

  const handleOpenInternalTaskAction = () => {
    window.location.href = "/internal-tasks";
  };

  const handleOpenProjectChat = (project) => {
    setSelectedProject(project);
    setActiveTab("chat");
  };

  const handleOpenNotification = async (notification) => {
    if (!notification?.id) return;
    if (!notification.read) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        queryClient.invalidateQueries({ queryKey: ["profile", "notifications", userId] });
      } catch { }
    }
    if (notification.type === "task_assigned") {
      if (notification.projectTaskId) {
        setActiveProfileTab(PROFILE_TABS.PROJECT_TASKS);
      } else if (notification.internalTaskId) {
        setActiveProfileTab(PROFILE_TABS.INTERNAL_TASKS);
      }
      return;
    }
    if (notification.projectId) {
      const matchedProject = memberProjects.find((p) => `${p._id}` === `${notification.projectId}`);
      if (matchedProject) {
        handleOpenProjectChat(matchedProject);
        return;
      }
      handleOpenProjectChat({
        _id: notification.projectId,
        masterProject: {
          title: notification.projectTitle || "Project",
          code: notification.projectCode || "-",
        },
      });
    }
  };

  const projectNamesById = useMemo(() => {
    const map = new Map();
    memberProjects.forEach((p) => {
      if (p?._id) map.set(`${p._id}`, getProjectTitle(p));
    });
    return map;
  }, [memberProjects]);

  function getProjectTitle(project) {
    return project?.masterProject?.title || project?.name || project?.title || "Untitled Project";
  }

  const resolveTaskProjectName = (task) => {
    const projectId = getTaskProjectId(task);
    if (!projectId) return getTaskProjectName(task);
    return projectNamesById.get(`${projectId}`) || getTaskProjectName(task);
  };

  const filteredProjectTasks = useMemo(
    () => projectTasks.filter((task) => statusMatchesFilter(task?.status, projectTaskStatusFilter)),
    [projectTasks, projectTaskStatusFilter]
  );

  const filteredInternalTasks = useMemo(
    () => internalTasks.filter((task) => statusMatchesFilter(task?.status, internalTaskStatusFilter)),
    [internalTasks, internalTaskStatusFilter]
  );

  const taskTotalPages = useMemo(() => {
    const response = activeProfileTab === PROFILE_TABS.PROJECT_TASKS ? projectTasksResponse : internalTasksResponse;
    const pagination = normalizePagination(response);
    if (pagination?.pages) return pagination.pages;
    const total = pagination?.total ?? (activeProfileTab === PROFILE_TABS.PROJECT_TASKS ? projectTasks.length : internalTasks.length);
    const limit = pagination?.limit ?? taskItemsPerPage;
    return Math.max(1, Math.ceil(total / limit));
  }, [activeProfileTab, projectTasksResponse, internalTasksResponse, projectTasks.length, internalTasks.length, taskItemsPerPage]);

  const pagedProjectTasks = filteredProjectTasks;
  const pagedInternalTasks = filteredInternalTasks;
  const pagedNotifications = notifications;
  const notificationTotalPages = useMemo(() => {
    const pagination = normalizePagination(notificationsResponse);
    if (pagination?.pages) return pagination.pages;
    const total = pagination?.total ?? notifications.length;
    const limit = pagination?.limit ?? notificationItemsPerPage;
    return Math.max(1, Math.ceil(total / limit));
  }, [notificationsResponse, notifications.length, notificationItemsPerPage]);

  const projectTaskColumns = [
    {
      id: "sl",
      header: "SL",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-5 lg:size-5 xl:size-6.5 2xl:size-8 3xl:size-10 p-1.5 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 bg-primary/10 rounded-full mx-auto">
          <span className="text-nav-highlight">{(taskCurrentPage - 1) * taskItemsPerPage + row.index + 1}</span>
        </div>
      ),
      size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
    },
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row }) => <span className="font-medium text-nav-highlight">{row.original?.title || "-"}</span>,
      size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
    },
    {
      id: "description",
      header: "Description",
      cell: ({ row }) => <span className="font-medium text-nav-highlight">{row.original?.description || "-"}</span>,
      size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
    },
    {
      id: "projectName",
      header: "Project Name",
      cell: ({ row }) => <span className="font-medium text-nav-highlight">{resolveTaskProjectName(row.original)}</span>,
      size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
    },
    {
      id: "module",
      header: "Module",
      cell: ({ row }) => <span className="font-medium text-nav-highlight">{row.original?.module || "-"}</span>,
      size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
    },
    {
      id: "subModule",
      header: "Sub-Module",
      cell: ({ row }) => <span className="font-medium text-nav-highlight">{row.original?.subModule || "-"}</span>,
      size: getResponsiveSize({ lg: 85, xl: 114, '2xl': 128, '3xl': 160 }),
    },
    {
      id: "startDate",
      header: "Start Date",
      cell: ({ row }) => formatDate(row.original?.startDate, DATE_FORMATS.DEFAULT, "-"),
      size: getResponsiveSize({ lg: 59, xl: 78, '2xl': 88, '3xl': 110 }),
    },
    {
      id: "dueDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original?.dueDate, DATE_FORMATS.DEFAULT, "-"),
      size: getResponsiveSize({ lg: 59, xl: 78, '2xl': 88, '3xl': 110 }),
    },
    {
      id: "status",
      header: "Task Status",
      cell: ({ row }) => <StatusBadge status={toTitleCase(row.original?.status)} />,
      size: getResponsiveSize({ lg: 74, xl: 99, '2xl': 112, '3xl': 140 }),
    },

    {
      id: "completedDate",
      header: "Completed Date",
      cell: ({ row }) => row.original?.completedAt ? formatDate(row.original?.completedAt, DATE_FORMATS.DEFAULT, "N/A") : "N/A",
      size: getResponsiveSize({ lg: 59, xl: 78, '2xl': 88, '3xl': 110 }),
    },
    {
      id: "actions",
      header: "Actions",
      enablePinning: true,
      cell: ({ row }) => (
        <div className="flex items-center justify-center 3xl:gap-2 2xl:gap-1.5 xl:gap-1 lg:gap-0.5 gap-0.5">
          <button onClick={() => handleOpenTaskAction(row.original)} className="size-3.5 lg:size-4.5 xl:size-5.5 2xl:size-6.5 3xl:size-8 3xl:rounded-md 2xl:rounded-md xl:rounded-sm lg:rounded-sm rounded-xs border border-nav-highlight/20 bg-primary-shade-2 text-nav-highlight inline-flex items-center justify-center">
            <ExternalLink className="size-2 lg:size-2.5 xl:size-3 2xl:size-3.5 3xl:size-4" />
          </button>
          <button onClick={() => handleOpenStatusModal(row.original, TASK_MODAL_TYPES.PROJECT)} className="size-3.5 lg:size-4.5 xl:size-5.5 2xl:size-6.5 3xl:size-8 3xl:rounded-md 2xl:rounded-md xl:rounded-sm lg:rounded-sm rounded-xs border border-nav-highlight/20 bg-background text-nav-highlight inline-flex items-center justify-center">
            <AiOutlineFileDone className="size-2 lg:size-2.5 xl:size-3 2xl:size-3.5 3xl:size-4" />
          </button>
        </div>
      ),
      size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }),
    },
  ];

  const internalTaskColumns = [
    {
      id: "sl",
      header: "SL",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-5 lg:size-5 xl:size-6.5 2xl:size-8 3xl:size-10 p-1.5 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 bg-primary/10 rounded-full mx-auto">
          <span className="text-nav-highlight">{(taskCurrentPage - 1) * taskItemsPerPage + row.index + 1}</span>
        </div>
      ),
      size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
    },
    { accessorKey: "title", header: "Task", cell: ({ row }) => <span className="font-medium text-nav-highlight">{row.original?.title || "-"}</span>, size: getResponsiveSize({ lg: 128, xl: 171, '2xl': 192, '3xl': 240 }) },
    { id: "details", header: "Details", cell: ({ row }) => <span className="truncate inline-block max-w-[260px] text-muted-foreground">{row.original?.description || "-"}</span>, size: getResponsiveSize({ lg: 149, xl: 199, '2xl': 224, '3xl': 280 }) },
    { id: "module", header: "Module", cell: ({ row }) => row.original?.team?.name || "-", size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }) },
    { id: "startDate", header: "Start Date", cell: ({ row }) => formatDate(row.original?.startDate, DATE_FORMATS.DEFAULT, "-"), size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }) },
    { id: "endDate", header: "End Date", cell: ({ row }) => formatDate(row.original?.dueDate, DATE_FORMATS.DEFAULT, "-"), size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }) },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={toTitleCase(row.original?.status)} />, size: getResponsiveSize({ lg: 91, xl: 121, '2xl': 136, '3xl': 170 }) },

    { id: "completedDate", header: "Completed Date", cell: ({ row }) => row.original?.status === "completed" ? formatDate(row.original?.completedAt, DATE_FORMATS.DEFAULT, "N/A") : "N/A", size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 }) },
    {
      id: "actions", header: "Actions", enablePinning: true, cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handleOpenInternalTaskAction()} className="size-4.5 lg:size-4.5 xl:size-5.5 2xl:size-6.5 3xl:size-8 3xl:rounded-md 2xl:rounded-md xl:rounded-sm lg:rounded-sm rounded-sm border border-nav-highlight/20 bg-primary-shade-2 text-nav-highlight inline-flex items-center justify-center">
            <ExternalLink className="size-2.5 lg:size-2.5 xl:size-3 2xl:size-3.5 3xl:size-4" />
          </button>
          <button onClick={() => handleOpenStatusModal(row.original, TASK_MODAL_TYPES.INTERNAL)} className="size-4.5 lg:size-4.5 xl:size-5.5 2xl:size-6.5 3xl:size-8 rounded-md border border-nav-highlight/20 bg-background text-nav-highlight inline-flex items-center justify-center">
            <AiOutlineFileDone className="size-2.5 lg:size-2.5 xl:size-3 2xl:size-3.5 3xl:size-4" />
          </button>
        </div>
      ), size: getResponsiveSize({ lg: 69, xl: 92, '2xl': 104, '3xl': 130 })
    },
  ];

  const notificationColumns = [
    {
      id: "sl",
      header: "SL",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-5 lg:size-5 xl:size-6.5 2xl:size-8 3xl:size-10 p-1.5 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 bg-primary/10 rounded-full mx-auto">
          <span className="text-nav-highlight">{(notificationCurrentPage - 1) * notificationItemsPerPage + row.index + 1}</span>
        </div>
      ),
      size: getResponsiveSize({ lg: 43, xl: 57, '2xl': 64, '3xl': 80 })
    },
    {
      id: "notification", header: "Notifications", cell: ({ row }) => {
        const item = row.original;
        const actorName = getDisplayName(item.actor);
        return (
          <div className={`flex items-start gap-3 min-w-0 w-full px-3 py-2 rounded-lg ${!item.read ? "bg-primary-shade-2/25" : ""}`}>
            <div className="3xl:size-8 2xl:size-6.5 xl:size-5.5 lg:size-4.5 rounded-full bg-primary-shade-2 text-nav-highlight text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold flex items-center justify-center shrink-0 overflow-hidden">
              {item?.actor?.avatar ? <img src={resolveAvatarUrl(item.actor.avatar)} className="w-full h-full object-cover" /> : getInitials(actorName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{item.message || "-"}</p>
              <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground mt-0.5">{formatDate(item.createdAt, DATE_FORMATS.WITH_TIME, "-")}</p>
            </div>
            <span className={`inline-flex size-2 lg:size-1 xl:size-1.5 2xl:size-1.5 3xl:size-2 rounded-full mt-2 shrink-0 ${item.read ? "bg-transparent border border-nav-highlight" : "bg-nav-highlight"}`} />
          </div>
        );
      }, size: getResponsiveSize({ lg: 459, xl: 612, '2xl': 688, '3xl': 860 })
    },
    { id: "actions", header: "Actions", enablePinning: true, cell: ({ row }) => <button onClick={() => handleOpenNotification(row.original)} className="3xl:size-8 2xl:size-6.5 xl:size-5.5 lg:size-4.5 3xl:rounded-md 2xl:rounded-md xl:rounded-sm lg:rounded-sm border border-nav-highlight/20 bg-primary-shade-2 text-nav-highlight inline-flex items-center justify-center"><ExternalLink className="3xl:w-4 3xl:h-4 2xl:w-3.5 2xl:h-3.5 xl:w-3 xl:h-3 lg:w-2.5 lg:h-2" /></button>, size: getResponsiveSize({ lg: 59, xl: 78, '2xl': 88, '3xl': 110 }) }
  ];


  return (
    <div className="flex flex-col rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl border border-table-stroke  overflow-hidden flex-1 min-h-0 h-full">
      <div className="3xl:px-4 2xl:px-3 xl:px-2 lg:px-1 px-1 pt-1 lg:pt-1.5 xl:pt-2 2xl:pt-2.5 3xl:pt-3 border-b border-table-stroke shrink-0 sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="inline-flex items-stretch rounded-full border border-table-stroke bg-background/60 overflow-hidden divide-x divide-table-stroke/80 mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">
          <TabButton id={PROFILE_TABS.PROJECT_TASKS} label="Your Tasks" count={incompleteProjectTaskCount} isActive={activeProfileTab === PROFILE_TABS.PROJECT_TASKS} onClick={setActiveProfileTab} />
          <TabButton id={PROFILE_TABS.INTERNAL_TASKS} label="Internal Tasks" count={incompleteInternalTaskCount} isActive={activeProfileTab === PROFILE_TABS.INTERNAL_TASKS} onClick={setActiveProfileTab} />
          <TabButton id={PROFILE_TABS.NOTIFICATIONS} label="Notifications" count={unreadNotificationCount} isActive={activeProfileTab === PROFILE_TABS.NOTIFICATIONS} onClick={setActiveProfileTab} />
        </div>

        {(activeProfileTab === PROFILE_TABS.PROJECT_TASKS || activeProfileTab === PROFILE_TABS.INTERNAL_TASKS) && (
          <div className="pb-3 flex items-end justify-between gap-4">
            <TaskStatusFilters
              options={activeProfileTab === PROFILE_TABS.PROJECT_TASKS ? PROJECT_TASK_STATUS_OPTIONS : INTERNAL_TASK_STATUS_OPTIONS}
              selectedValue={activeProfileTab === PROFILE_TABS.PROJECT_TASKS ? projectTaskStatusFilter : internalTaskStatusFilter}
              onChange={activeProfileTab === PROFILE_TABS.PROJECT_TASKS ? setProjectTaskStatusFilter : setInternalTaskStatusFilter}
            />
            <DesktopFilterPills value={taskRunScope} options={TASK_RUN_SCOPE_OPTIONS} onChange={setTaskRunScope} variant="pills" />
          </div>
        )}
      </div>

      <div className="overflow-hidden flex-1 flex flex-col min-h-0">
        {activeProfileTab === PROFILE_TABS.PROJECT_TASKS && (
          <div className="overflow-hidden h-full flex-1 flex flex-col min-h-0">
            <PaginatedTable
              data={pagedProjectTasks}
              columns={projectTaskColumns}
              currentPage={taskCurrentPage}
              totalPages={taskTotalPages}
              onPageChange={setTaskCurrentPage}
              itemsPerPage={taskItemsPerPage}
              onItemsPerPageChange={(value) => {
                setTaskItemsPerPage(value);
                setTaskCurrentPage(1);
              }}
              className="flex-1 min-h-0 h-full"
              rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
              bodyCellClassName="first:pl-6 last:pr-6 py-0"
              noDataMessage={noDataMessage}
              noDataDescription={noDataDescription}
              enablePinning={true}
              defaultColumnPinning={{ right: ["actions"] }}
            />
          </div>
        )}
        {activeProfileTab === PROFILE_TABS.INTERNAL_TASKS && (
          <div className="overflow-hidden flex-1 flex flex-col min-h-0">
            <PaginatedTable
              data={pagedInternalTasks}
              columns={internalTaskColumns}
              currentPage={taskCurrentPage}
              totalPages={taskTotalPages}
              onPageChange={setTaskCurrentPage}
              itemsPerPage={taskItemsPerPage}
              onItemsPerPageChange={(value) => {
                setTaskItemsPerPage(value);
                setTaskCurrentPage(1);
              }}
              className="flex-1 min-h-0 h-full"
              rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
              bodyCellClassName="first:pl-6 last:pr-6 py-0"
              noDataMessage={noDataMessage}
              noDataDescription={noDataDescription}
              enablePinning={true}
              defaultColumnPinning={{ right: ["actions"] }}
            />
          </div>
        )}
        {activeProfileTab === PROFILE_TABS.NOTIFICATIONS && (
          <div className="overflow-hidden flex-1 flex flex-col min-h-0">
            <PaginatedTable
              data={pagedNotifications}
              columns={notificationColumns}
              currentPage={notificationCurrentPage}
              totalPages={notificationTotalPages}
              onPageChange={setNotificationCurrentPage}
              itemsPerPage={notificationItemsPerPage}
              onItemsPerPageChange={(value) => {
                setNotificationItemsPerPage(value);
                setNotificationCurrentPage(1);
              }}
              className="flex-1 min-h-0 h-full"
              rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
              bodyCellClassName="first:pl-6 last:pr-6 py-0"
              enablePinning={true}
              defaultColumnPinning={{ right: ["actions"] }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksDesktop;
