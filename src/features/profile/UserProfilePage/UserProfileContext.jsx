import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useSearchParams } from "react-router";
import { useUpdateInternalTaskStatus, useUpdateProjectTaskStatus } from "@/hooks/mutations";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { useInternalTasksByUser } from "@/hooks/useInternalTasks";
import { useDebounce } from "@/hooks/useDebounce";
import { extractPayloadData, normalizeList, normalizePagination, normalizeStatus } from "./utils";
import { useProjectActivityStore } from "@/features/project-overview/project-activity-sidebar/stores/ProjectActivityStore";

const UserProfileContext = createContext(null);
const INCOMPLETE_TASK_STATUSES = ["pending", "in_progress"];

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) throw new Error("useUserProfile must be used within UserProfileProvider");
  return context;
};

export const PROFILE_TABS = {
  PROJECT_TASKS: "project_tasks",
  INTERNAL_TASKS: "internal_tasks",
  NOTIFICATIONS: "notifications",
};

export const TASK_MODAL_TYPES = {
  PROJECT: "project",
  INTERNAL: "internal",
};

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

export const UserProfileProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const { activeTab: activityTab, setActiveTab } = useProjectActivityStore();
  const fileInputRef = useRef(null);

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeProfileTab, setActiveProfileTab] = useState(() => {
    if (initialTab && Object.values(PROFILE_TABS).includes(initialTab)) {
      return initialTab;
    }
    return PROFILE_TABS.PROJECT_TASKS;
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && Object.values(PROFILE_TABS).includes(tabParam)) {
      setActiveProfileTab(tabParam);
    }
  }, [searchParams]);
  const [taskRunScope, setTaskRunScope] = useState("running");
  const [taskCurrentPage, setTaskCurrentPage] = useState(1);
  const [taskItemsPerPage, setTaskItemsPerPage] = useState(20);
  const [notificationCurrentPage, setNotificationCurrentPage] = useState(1);
  const [notificationItemsPerPage, setNotificationItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [projectTaskStatusFilter, setProjectTaskStatusFilter] = useState("all");
  const [internalTaskStatusFilter, setInternalTaskStatusFilter] = useState("all");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const handleToggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
  const [statusModalState, setStatusModalState] = useState({
    open: false,
    taskType: TASK_MODAL_TYPES.PROJECT,
    task: null,
    status: "pending",
    error: "",
  });
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    department: "",
    email: "",
    role: "",
  });
  const [avatarDraftFile, setAvatarDraftFile] = useState(null);
  const [avatarDraftPreviewUrl, setAvatarDraftPreviewUrl] = useState(null);
  const [removeAvatarOnSave, setRemoveAvatarOnSave] = useState(false);

  const { mutateAsync: updateProjectTaskStatus, isPending: isUpdatingProjectTaskStatus } = useUpdateProjectTaskStatus();
  const { mutateAsync: updateInternalTaskStatus, isPending: isUpdatingInternalTaskStatus } = useUpdateInternalTaskStatus();

  const userId = user?.userId || user?._id || user?.id || null;
  const debouncedSearch = useDebounce(searchTerm, 350);

  const {
    data: authProfileData,
    isLoading: isAuthProfileLoading,
    error: authProfileError,
  } = useQuery({
    queryKey: ["profile", "me", userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const response = await api.get("/auth/me", { signal });
      return response?.data?.data || response?.data;
    },
    onSuccess: (data) => {
      if (data && typeof data === "object") {
        setUser((previous) => ({ ...previous, ...data }));
      }
    },
  });

  useEffect(() => {
    setProfileDraft({
      name: user?.name || "",
      department: user?.department || "",
      email: user?.email || "",
      role:
        user?.activeRole?.roleName ||
        user?.role ||
        user?.designation ||
        user?.jobTitle ||
        "",
    });
  }, [user]);

  const {
    data: projectTasksResponse,
    isLoading: isProjectTasksLoading,
    error: projectTasksError,
  } = useProjectTasks({
    assignedTo: userId,
    status: projectTaskStatusFilter,
    searchTerm: debouncedSearch,
    page: taskCurrentPage,
    limit: taskItemsPerPage,
  });

  const {
    data: internalTasksResponse,
    isLoading: isInternalTasksLoading,
    error: internalTasksError,
  } = useInternalTasksByUser(userId, {
    status: internalTaskStatusFilter,
    searchTerm: debouncedSearch,
    page: taskCurrentPage,
    limit: taskItemsPerPage,
  });

  const {
    data: memberProjects = [],
    isLoading: isMemberProjectsLoading,
    error: memberProjectsError,
  } = useQuery({
    queryKey: ["profile", "member-projects", userId],
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    queryFn: async () => {
      const projectsResponse = await api.get("/projects", {
        params: {
          page: 1,
          limit: 200,
        },
      });

      const allProjects = normalizeList(projectsResponse.data);
      if (allProjects.length === 0) return [];

      const membershipResponse = await api.get(`/project-members/user/${userId}/projects`);
      const projectIds = membershipResponse?.data?.data?.projectIds || membershipResponse?.data?.projectIds || [];

      const memberProjectIdSet = new Set(projectIds.map((id) => `${id}`));
      const userProjects = allProjects.filter((project) => memberProjectIdSet.has(`${project?._id}`));

      const projectsWithLatestComment = await Promise.all(
        userProjects.map(async (project) => {
          try {
            const latestCommentResponse = await api.post(`/comments/project/${project._id}`, {
              page: 1,
              limit: 1,
            });

            const latestComments = normalizeList(latestCommentResponse.data);
            const latestComment = latestComments[0] || null;

            return {
              ...project,
              latestComment,
            };
          } catch {
            return {
              ...project,
              latestComment: null,
            };
          }
        })
      );

      return projectsWithLatestComment.sort((a, b) => {
        const aTime = a?.latestComment?.createdAt ? new Date(a.latestComment.createdAt).getTime() : 0;
        const bTime = b?.latestComment?.createdAt ? new Date(b.latestComment.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    },
  });

  const {
    data: notificationsResponse,
    isLoading: isNotificationsLoading,
    error: notificationsError,
  } = useQuery({
    queryKey: ["profile", "notifications", userId, notificationCurrentPage, notificationItemsPerPage],
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
    queryFn: async () => {
      const response = await api.get("/notifications", {
        params: {
          page: notificationCurrentPage,
          limit: notificationItemsPerPage,
        },
      });

      return response.data;
    },
  });

  const projectTasks = useMemo(() => normalizeList(projectTasksResponse), [projectTasksResponse]);
  const internalTasks = useMemo(() => normalizeList(internalTasksResponse), [internalTasksResponse]);
  const notifications = useMemo(() => normalizeList(notificationsResponse), [notificationsResponse]);
  const unreadNotificationCount = useMemo(
    () => notificationsResponse?.data?.unreadCount ?? notificationsResponse?.unreadCount ?? 0,
    [notificationsResponse]
  );

  const {
    data: incompleteProjectTaskCount = 0,
  } = useQuery({
    queryKey: ["profile", "project-tasks", "count", userId, "incomplete"],
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
    queryFn: async () => {
      const responses = await Promise.all(
        INCOMPLETE_TASK_STATUSES.map((status) =>
          api.get("/project-tasks", {
            params: {
              assignedTo: userId,
              status,
              page: 1,
              limit: 1,
            },
          })
        )
      );

      return responses.reduce((sum, response) => {
        const pagination = normalizePagination(response.data);
        const items = normalizeList(response.data);
        return sum + (pagination?.total ?? items.length);
      }, 0);
    },
  });

  const {
    data: incompleteInternalTaskCount = 0,
  } = useQuery({
    queryKey: ["profile", "internal-tasks", "count", userId, "incomplete"],
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
    queryFn: async () => {
      const responses = await Promise.all(
        INCOMPLETE_TASK_STATUSES.map((status) =>
          api.get(`/internal-tasks/user/${userId}`, {
            params: {
              status,
              page: 1,
              limit: 1,
            },
          })
        )
      );

      return responses.reduce((sum, response) => {
        const pagination = normalizePagination(response.data);
        const items = normalizeList(response.data);
        return sum + (pagination?.total ?? items.length);
      }, 0);
    },
  });

  const filteredMemberProjects = useMemo(() => {
    if (!debouncedSearch) return memberProjects;
    const lowerSearch = debouncedSearch.toLowerCase();
    return memberProjects.filter((p) => {
      const title = (p?.masterProject?.title || p?.name || p?.title || "").toLowerCase();
      const code = (p?.masterProject?.code || p?.code || "").toLowerCase();
      return title.includes(lowerSearch) || code.includes(lowerSearch);
    });
  }, [memberProjects, debouncedSearch]);

  const value = {
    user,
    setUser,
    activeProfileTab,
    setActiveProfileTab,
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
    searchTerm,
    setSearchTerm,
    selectedProject,
    setSelectedProject,
    isEditingProfile,
    setIsEditingProfile,
    isSavingProfile,
    setIsSavingProfile,
    isEditingAvatar,
    setIsEditingAvatar,
    isSavingAvatar,
    setIsSavingAvatar,
    projectTaskStatusFilter,
    setProjectTaskStatusFilter,
    internalTaskStatusFilter,
    setInternalTaskStatusFilter,
    statusModalState,
    setStatusModalState,
    profileDraft,
    setProfileDraft,
    avatarDraftFile,
    setAvatarDraftFile,
    avatarDraftPreviewUrl,
    setAvatarDraftPreviewUrl,
    removeAvatarOnSave,
    setRemoveAvatarOnSave,
    projectTasks,
    isProjectTasksLoading,
    projectTasksError,
    internalTasks,
    isInternalTasksLoading,
    internalTasksError,
    memberProjects: filteredMemberProjects,
    isMemberProjectsLoading,
    memberProjectsError,
    notifications,
    unreadNotificationCount,
    incompleteProjectTaskCount,
    incompleteInternalTaskCount,
    isNotificationsLoading,
    notificationsError,
    projectTasksResponse,
    internalTasksResponse,
    notificationsResponse,
    fileInputRef,
    activityTab,
    setActiveTab,
    updateProjectTaskStatus,
    isUpdatingProjectTaskStatus,
    updateInternalTaskStatus,
    isUpdatingInternalTaskStatus,
    queryClient,
    userId,
    isSidebarExpanded,
    handleToggleSidebar,
    debouncedSearch,
    authProfileData,
    isAuthProfileLoading,
    authProfileError,
    MAX_AVATAR_SIZE_BYTES,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};
