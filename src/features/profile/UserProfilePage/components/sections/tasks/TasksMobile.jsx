import React, { useMemo } from "react";
import { ExternalLink, RefreshCcw } from "lucide-react";
import { AiOutlineFileDone } from "react-icons/ai";
import { useUserProfile, PROFILE_TABS, TASK_MODAL_TYPES } from "../../../UserProfileContext";
import { 
  PROJECT_TASK_STATUS_OPTIONS, 
  INTERNAL_TASK_STATUS_OPTIONS,
  TASK_RUN_SCOPE_OPTIONS,
    toTitleCase,
  statusMatchesFilter,
  getTaskProjectId,
  getTaskProjectName,
  getDisplayName,
  getInitials,
  normalizeStatus,
    normalizePagination,
    getTaskRedirectPath,
} from "../../../utils";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { FilterInput } from "@/components/ui/FilterInput/FilterInput";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, DATE_FORMATS } from "@/utils/dateFormatter";
import api from "@/lib/api";
import { resolveAvatarUrl } from "@/utils/avatarUrl";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

const TabsHeader = ({ activeTab, onTabChange, counts }) => {
    const tabs = [
        { id: PROFILE_TABS.PROJECT_TASKS, label: "Your Tasks" },
        { id: PROFILE_TABS.INTERNAL_TASKS, label: "Internal Tasks" },
        { id: PROFILE_TABS.NOTIFICATIONS, label: "Notifications" },
    ];

    return (
        <div className="flex w-full items-stretch rounded-md border border-table-stroke overflow-hidden divide-x divide-table-stroke/80">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "relative flex-1 min-w-0 px-2 py-2 text-[11px] font-semibold transition-colors",
                            isActive
                                ? "bg-[#EEEBF4] dark:bg-primary-shade-2 text-nav-highlight"
                                : "bg-transparent text-lighter-text"
                        )}
                    >
                        <span className="truncate">{tab.label}</span>
                        {counts[tab.id] > 0 && (
                            <span className="absolute top-1 right-1 min-w-3.5 h-3.5 px-1 rounded-md bg-primary text-white text-[9px] leading-4 font-medium">
                                {counts[tab.id]}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

import { NoData } from "@/components/ui/NoData";

const EmptyState = ({ message, description }) => (
    <NoData
        message={message}
        description={description}
    />
);


const TasksMobile = ({ stickyTopClass = "top-0" }) => {
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
        setStatusModalState,
        setSelectedProject,
        setActiveTab,
        memberProjects,
        queryClient,
        userId,
        searchTerm,
        setSearchTerm,
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

    const pagedProjectTasks = projectTasks;
    const pagedInternalTasks = internalTasks;
    const pagedNotifications = notifications;

    const counts = {
        [PROFILE_TABS.PROJECT_TASKS]: incompleteProjectTaskCount,
        [PROFILE_TABS.INTERNAL_TASKS]: incompleteInternalTaskCount,
        [PROFILE_TABS.NOTIFICATIONS]: unreadNotificationCount,
    };
    const taskListTotals = {
        [PROFILE_TABS.PROJECT_TASKS]: normalizePagination(projectTasksResponse)?.total ?? projectTasks.length,
        [PROFILE_TABS.INTERNAL_TASKS]: normalizePagination(internalTasksResponse)?.total ?? internalTasks.length,
        [PROFILE_TABS.NOTIFICATIONS]: normalizePagination(notificationsResponse)?.total ?? notifications.length,
    };

    const notificationTotalPages = useMemo(() => {
        const pagination = normalizePagination(notificationsResponse);
        if (pagination?.pages) return pagination.pages;
        const total = taskListTotals[PROFILE_TABS.NOTIFICATIONS] || 0;
        return Math.max(1, Math.ceil(total / notificationItemsPerPage));
    }, [notificationsResponse, taskListTotals, notificationItemsPerPage]);

    const taskTotalPages = useMemo(() => {
        const response = (activeProfileTab === PROFILE_TABS.PROJECT_TASKS) ? projectTasksResponse : internalTasksResponse;
        const pagination = normalizePagination(response);
        if (pagination?.pages) return pagination.pages;
        const total = taskListTotals[activeProfileTab] || 0;
        return Math.max(1, Math.ceil(total / taskItemsPerPage));
    }, [activeProfileTab, projectTasksResponse, internalTasksResponse, taskListTotals, taskItemsPerPage]);

    const totalPages = activeProfileTab === PROFILE_TABS.NOTIFICATIONS ? notificationTotalPages : taskTotalPages;

    const handleOpenStatusModal = (task, taskType) => {
        const isProject = taskType === TASK_MODAL_TYPES.PROJECT;
        const normalizedCurrentStatus = normalizeStatus(task?.status);
        const options = isProject ? PROJECT_TASK_STATUS_OPTIONS : INTERNAL_TASK_STATUS_OPTIONS;
        const fallbackStatus = "pending";
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
        window.location.assign(getTaskRedirectPath(task));
    };

    const handleOpenProjectChat = (project) => {
        setSelectedProject(project);
        setActiveTab("chat");
        // Scroll to sidebar is implicit because it's mobile
    };

    const handleOpenNotification = async (notification) => {
        if (!notification?.id) return;
        if (!notification.read) {
            try {
                await api.patch(`/notifications/${notification.id}/read`);
                queryClient.invalidateQueries({ queryKey: ["profile", "notifications", userId] });
            } catch {
                // ignore read error and continue
            }
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
                },
            });
        }
    };

    const filteredProjectTasks = useMemo(() =>
        projectTasks.filter((task) => statusMatchesFilter(task?.status, projectTaskStatusFilter)),
    [projectTasks, projectTaskStatusFilter]);

    const filteredInternalTasks = useMemo(() =>
        internalTasks.filter((task) => statusMatchesFilter(task?.status, internalTaskStatusFilter)),
    [internalTasks, internalTaskStatusFilter]);

    const statusOptions = activeProfileTab === PROFILE_TABS.PROJECT_TASKS ? PROJECT_TASK_STATUS_OPTIONS : INTERNAL_TASK_STATUS_OPTIONS;

    const getTaskDetails = (task) => {
        return task?.description || task?.details || task?.summary || "-";
    };

    const projectNamesById = useMemo(() => {
        const map = new Map();
        memberProjects.forEach((p) => {
            if (p?._id) map.set(`${p._id}`, p?.masterProject?.title || p?.name || p?.title || "Untitled Project");
        });
        return map;
    }, [memberProjects]);

    const resolveTaskProjectName = (task) => {
        const projectId = getTaskProjectId(task);
        if (!projectId) return getTaskProjectName(task);
        return projectNamesById.get(`${projectId}`) || getTaskProjectName(task);
    };

    const getTaskModule = (task) => {
        if (activeProfileTab === PROFILE_TABS.PROJECT_TASKS) {
            return task?.module || "-";
        }
        return task?.team?.name || task?.project?.department?.name || task?.department?.name || "-";
    };

    return (
        <div className="space-y-4">
            <div className={cn("sticky z-10 bg-white dark:bg-background py-10 p-3 rounded-lg", stickyTopClass)}>
                <div className="flex flex-wrap items-center gap-3">
                    <TabsHeader activeTab={activeProfileTab} onTabChange={setActiveProfileTab} counts={counts} />
                </div>
                <div className="mt-3">
                    {activeProfileTab === PROFILE_TABS.NOTIFICATIONS ? (
                        <SearchInput
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full"
                        />
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            <SearchInput
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="col-span-1"
                            />
                            <FilterInput
                                className="col-span-1"
                                config={{
                                    options: statusOptions,
                                    value: activeProfileTab === PROFILE_TABS.PROJECT_TASKS ? projectTaskStatusFilter : internalTaskStatusFilter,
                                    onValueChange: (value) =>
                                        (activeProfileTab === PROFILE_TABS.PROJECT_TASKS ? setProjectTaskStatusFilter : setInternalTaskStatusFilter)(value),
                                    placeholder: "All",
                                    defaultValue: "all",
                                }}
                            />
                            <FilterInput
                                className="col-span-1"
                                config={{
                                    options: TASK_RUN_SCOPE_OPTIONS,
                                    value: taskRunScope,
                                    onValueChange: setTaskRunScope,
                                    placeholder: "Running",
                                    defaultValue: "running",
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {activeProfileTab === PROFILE_TABS.PROJECT_TASKS && (
                    <>
                        {filteredProjectTasks.length === 0 ? (
                            <EmptyState message={noDataMessage} description={noDataDescription} />
                        ) : (
                            filteredProjectTasks.map((item, index) => (
                                <ExpandableCard
                                    key={item._id || index}
                                    className="p-3 rounded-xl bg-background border border-table-stroke"
                                >
                                    <ExpandableCard.Content initialHeight={140}>
                                        <InfoTable>
                                            <InfoTable.Row
                                                label={
                                                    <div className="min-w-10 min-h-8 rounded-lg bg-primary-shade-2 flex items-center justify-center">
                                                        <p className="text-nav-highlight text-xs font-semibold">{(taskCurrentPage - 1) * taskItemsPerPage + index + 1}</p>
                                                    </div>
                                                }
                                                valueClassName="text-base font-semibold text-foreground"
                                            >
                                                <div className="text-right text-base font-semibold text-foreground">
                                                    {item.title || "Untitled Task"}
                                                </div>
                                            </InfoTable.Row>

                                            <InfoTable.Row label="Description" valueClassName="text-right text-sm text-foreground font-semibold whitespace-normal break-words">
                                                {getTaskDetails(item)}
                                            </InfoTable.Row>

                                            <InfoTable.Row label="Project Name" valueClassName="text-right text-sm text-foreground font-semibold">
                                                {resolveTaskProjectName(item)}
                                            </InfoTable.Row>

                                            <InfoTable.Row label="Module" valueClassName="text-right text-sm text-foreground font-semibold">
                                                {getTaskModule(item)}
                                            </InfoTable.Row>

                                            <InfoTable.Row
                                                label={
                                                    <span className="text-xs text-lighter-text">
                                                        Start: <span className="text-foreground font-semibold">{formatDate(item.startDate, DATE_FORMATS.DEFAULT, "-")}</span>
                                                    </span>
                                                }
                                                valueClassName="text-right text-xs text-lighter-text"
                                            >
                                                Due: <span className="text-foreground font-semibold">{formatDate(item.dueDate, DATE_FORMATS.DEFAULT, "-")}</span>
                                            </InfoTable.Row>

                                            <InfoTable.Row label="Task Status">
                                                <div className="flex justify-end">
                                                    <StatusBadge status={toTitleCase(item?.status)} />
                                                </div>
                                            </InfoTable.Row>



                                            <InfoTable.Row label="Completed Date" valueClassName="text-right text-sm text-foreground font-semibold">
                                                {item?.completedAt ? formatDate(item?.completedAt, DATE_FORMATS.DEFAULT, "N/A") : "N/A"}
                                            </InfoTable.Row>
                                        </InfoTable>
                                    </ExpandableCard.Content>

                                    <ExpandableCard.Footer className="pt-2">
                                        <ExpandableCard.FooterLeft>
                                            <ButtonGroup
                                                gap="gap-0"
                                                buttons={[
                                                    {
                                                        key: "open",
                                                        icon: ExternalLink,
                                                        onClick: () => handleOpenTaskAction(item),
                                                        title: "Open",
                                                        className:
                                                            "rounded-r-none text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                                                        iconSize: "w-4 h-4",
                                                    },
                                                    {
                                                        key: "status",
                                                        icon: AiOutlineFileDone,
                                                        onClick: () => handleOpenStatusModal(item, TASK_MODAL_TYPES.PROJECT),
                                                        title: "Status",
                                                        className:
                                                            "rounded-l-none text-base-color hover:bg-gray-50 bg-background border border-nav-highlight/15 border-l-table-stroke",
                                                        iconSize: "w-4 h-4",
                                                    },
                                                ]}
                                            />
                                        </ExpandableCard.FooterLeft>
                                        <ExpandableCard.FooterRight>
                                            <ExpandableCard.ToggleButton
                                                expandedText="See less"
                                                collapsedText="See more"
                                            />
                                        </ExpandableCard.FooterRight>
                                    </ExpandableCard.Footer>
                                </ExpandableCard>
                            ))
                        )}
                    </>
                )}

                {activeProfileTab === PROFILE_TABS.INTERNAL_TASKS && (
                    <>
                        {filteredInternalTasks.length === 0 ? (
                            <EmptyState message={noDataMessage} description={noDataDescription} />
                        ) : (
                            filteredInternalTasks.map((item, index) => (
                                <ExpandableCard
                                    key={item._id || index}
                                    className="p-3 rounded-xl bg-background border border-table-stroke"
                                >
                                    <ExpandableCard.Content initialHeight={140}>
                                        <InfoTable>
                                            <InfoTable.Row
                                                label={
                                                    <div className="min-w-10 min-h-8 rounded-lg bg-primary-shade-2 flex items-center justify-center">
                                                        <p className="text-nav-highlight text-xs font-semibold">{(taskCurrentPage - 1) * taskItemsPerPage + index + 1}</p>
                                                    </div>
                                                }
                                                valueClassName="text-base font-semibold text-foreground"
                                            >
                                                <div className="text-right text-base font-semibold text-foreground">
                                                    {item.title || "Untitled Task"}
                                                </div>
                                            </InfoTable.Row>

                                            <InfoTable.Row label="Description" valueClassName="text-right text-sm text-foreground font-semibold whitespace-normal break-words">
                                                {getTaskDetails(item)}
                                            </InfoTable.Row>

                                            <InfoTable.Row label="Module" valueClassName="text-right text-sm text-foreground font-semibold">
                                                {getTaskModule(item)}
                                            </InfoTable.Row>

                                            <InfoTable.Row
                                                label={
                                                    <span className="text-xs text-lighter-text">
                                                        Start: <span className="text-foreground font-semibold">{formatDate(item.startDate, DATE_FORMATS.DEFAULT, "-")}</span>
                                                    </span>
                                                }
                                                valueClassName="text-right text-xs text-lighter-text"
                                            >
                                                Due: <span className="text-foreground font-semibold">{formatDate(item.dueDate, DATE_FORMATS.DEFAULT, "-")}</span>
                                            </InfoTable.Row>

                                            <InfoTable.Row label="Task Status">
                                                <div className="flex justify-end">
                                                    <StatusBadge status={toTitleCase(item?.status)} />
                                                </div>
                                            </InfoTable.Row>



                                            <InfoTable.Row label="Completed Date" valueClassName="text-right text-sm text-foreground font-semibold">
                                                {item?.completedAt ? formatDate(item?.completedAt, DATE_FORMATS.DEFAULT, "N/A") : "N/A"}
                                            </InfoTable.Row>
                                        </InfoTable>
                                    </ExpandableCard.Content>

                                    <ExpandableCard.Footer className="pt-2">
                                        <ExpandableCard.FooterLeft>
                                            <ButtonGroup
                                                gap="gap-0"
                                                buttons={[
                                                    {
                                                        key: "open",
                                                        icon: ExternalLink,
                                                        onClick: () => window.location.assign("/internal-tasks"),
                                                        title: "Open",
                                                        className:
                                                            "rounded-r-none text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                                                        iconSize: "w-4 h-4",
                                                    },
                                                    {
                                                        key: "status",
                                                        icon: AiOutlineFileDone,
                                                        onClick: () => handleOpenStatusModal(item, TASK_MODAL_TYPES.INTERNAL),
                                                        title: "Status",
                                                        className:
                                                            "rounded-l-none text-base-color hover:bg-gray-50 bg-background border border-nav-highlight/15 border-l-table-stroke",
                                                        iconSize: "w-4 h-4",
                                                    },
                                                ]}
                                            />
                                        </ExpandableCard.FooterLeft>
                                        <ExpandableCard.FooterRight>
                                            <ExpandableCard.ToggleButton
                                                expandedText="See less"
                                                collapsedText="See more"
                                            />
                                        </ExpandableCard.FooterRight>
                                    </ExpandableCard.Footer>
                                </ExpandableCard>
                            ))
                        )}
                    </>
                )}
                {activeProfileTab === PROFILE_TABS.NOTIFICATIONS && (
                    <>
                        {notifications.length === 0 ? (
                            <EmptyState />
                        ) : (
                            notifications.map((item, index) => (
                                <ExpandableCard
                                    key={item.id || index}
                                    className="p-3 rounded-xl bg-background border border-table-stroke"
                                >
                                    <ExpandableCard.Content initialHeight={140}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="size-8 rounded-full overflow-hidden shrink-0 bg-primary-shade-2 text-nav-highlight text-xs font-semibold flex items-center justify-center">
                                                {item?.actor?.avatar ? (
                                                    <img src={resolveAvatarUrl(item.actor.avatar)} className="w-full h-full object-cover" />
                                                ) : (
                                                    getInitials(getDisplayName(item.actor))
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-foreground truncate">{item.message || "Notification"}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(item.createdAt, DATE_FORMATS.WITH_TIME, "-")}</p>
                                            </div>
                                            {!item.read && <span className="size-2 rounded-full bg-nav-highlight" />}
                                        </div>
                                        {item.projectTitle ? (
                                            <span className="text-[10px] bg-primary-shade-2/50 self-start px-2 py-0.5 rounded text-nav-highlight font-bold uppercase">
                                                {item.projectTitle}
                                            </span>
                                        ) : null}
                                    </ExpandableCard.Content>
                                    <ExpandableCard.Footer className="pt-2">
                                        <ExpandableCard.FooterLeft>
                                            <button
                                                onClick={() => handleOpenNotification(item)}
                                                className="w-10 h-9 rounded-md border border-primary-shade-2 bg-primary-shade-2 text-nav-highlight inline-flex items-center justify-center"
                                                aria-label="Open notification"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </ExpandableCard.FooterLeft>
                                        <ExpandableCard.FooterRight>
                                            <ExpandableCard.ToggleButton
                                                expandedText="See less"
                                                collapsedText="See more"
                                            />
                                        </ExpandableCard.FooterRight>
                                    </ExpandableCard.Footer>
                                </ExpandableCard>
                            ))
                        )}
                    </>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center w-full mt-10 pb-12">
                    <Pagination
                        currentPage={activeProfileTab === PROFILE_TABS.NOTIFICATIONS ? notificationCurrentPage : taskCurrentPage}
                        totalPages={totalPages}
                        onPageChange={activeProfileTab === PROFILE_TABS.NOTIFICATIONS ? setNotificationCurrentPage : setTaskCurrentPage}
                        itemsPerPage={activeProfileTab === PROFILE_TABS.NOTIFICATIONS ? notificationItemsPerPage : taskItemsPerPage}
                        onItemsPerPageChange={(val) => {
                            if (activeProfileTab === PROFILE_TABS.NOTIFICATIONS) {
                                setNotificationItemsPerPage?.(val);
                                setNotificationCurrentPage(1);
                            } else {
                                setTaskItemsPerPage?.(val);
                                setTaskCurrentPage(1);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default TasksMobile;
