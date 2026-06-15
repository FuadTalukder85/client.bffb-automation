import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";

export const TASK_RUN_SCOPE_OPTIONS = [
    { label: "Running", value: "running" },
    { label: "Previous", value: "previous" },
    { label: "All", value: "all" },
];

export const PROJECT_TASK_STATUS_OPTIONS = createFilterOptions(
    buildStatusOptions([
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
    ]),
    "All"
);

export const INTERNAL_TASK_STATUS_OPTIONS = createFilterOptions(
    buildStatusOptions([
        { label: "Not Started", value: "pending" },
        { label: "In Progress", value: "in-progress" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
    ]),
    "All"
);

export const PROJECT_TASK_UPDATE_STATUS_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

export const INTERNAL_TASK_UPDATE_STATUS_OPTIONS = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

export const normalizeList = (payload) => {
    const data = payload?.data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(payload)) return payload;
    return [];
};

export const normalizePagination = (payload) => {
    const data = payload?.data;
    if (data?.pagination) return data.pagination;
    if (payload?.pagination) return payload.pagination;
    return null;
};

export const toTitleCase = (value) => {
    if (!value) return "-";
    return `${value}`
        .replace(/_/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

export const normalizeStatus = (status) => `${status || ""}`.toLowerCase().replace(/-/g, "_").trim();

export const statusMatchesFilter = (status, filter) => {
    if (!filter || filter === "all") return true;
    return normalizeStatus(status) === normalizeStatus(filter);
};

export const getProjectTitle = (project) => {
    return (
        project?.masterProject?.title ||
        project?.name ||
        project?.title ||
        "Untitled Project"
    );
};

export const getProjectCode = (project) => {
    return project?.masterProject?.code || project?.code || "-";
};

export const getDisplayName = (user) => {
    if (!user) return "Unknown User";
    return (
        user?.name ||
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.email ||
        "Unknown User"
    );
};

export const getInitials = (text) => {
    if (!text) return "U";
    const parts = text.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

export const getTaskProjectName = (task) => {
    return (
        task?.project?.masterProject?.title ||
        task?.project?.name ||
        task?.project?.title ||
        "-"
    );
};

export const getTaskProjectId = (task) => {
    const project = task?.project;
    if (!project) return null;
    if (typeof project === "string") return project;
    return project?._id || null;
};

export const getCommentSnippet = (comment) => {
    if (!comment?.content) return "No messages yet";
    const cleaned = comment.content.replace(/\s+/g, " ").trim();
    if (cleaned.length <= 62) return cleaned;
    return `${cleaned.slice(0, 62)}...`;
};

export const getCommentActorHandle = (comment) => {
    const actorName =
        comment?.createdBy?.name ||
        comment?.author?.name ||
        comment?.user?.name ||
        comment?.createdBy?.email ||
        comment?.author?.email ||
        comment?.user?.email ||
        "user";

    const normalizedHandle = `${actorName}`
        .split("@")[0]
        .replace(/\s+/g, "")
        .toLowerCase();

    return `@${normalizedHandle || "user"}`;
};

export const extractPayloadData = (payload) => payload?.data?.data || payload?.data || payload;

const normalizeRouteKey = (value) => {
    if (!value) return "";
    return `${value}`
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-")
        .replace(/-+/g, "-");
};

const TASK_MODULE_DEFAULT_ROUTES = {
    "project-overview": "/project-overview",
    "application-lab": "/application-lab/application-recipes",
    sensory: "/sensory-testing/sensory-forms",
    "shelf-life-testing": "/shelf-life-testing/test-records",
    cleaning: "/cleaning/cleaning-status",
    maintenance: "/maintenance/maintenance-calendar",
};

const TASK_SUBMODULE_ROUTES = {
    "project-overview": "/project-overview",
    "product-development": "/project-overview/product-development",
    "master-project-schedule": "/project-overview/master-project-schedule",
    "manage-recipe": "/application-lab/application-recipes",
    "sample-preparation": "/application-lab/sample-preparation-and-packaging",
    "sample-preparation-and-packaging": "/application-lab/sample-preparation-and-packaging",
    "lab-records": "/application-lab/application-lab-records",
    "application-lab-records": "/application-lab/application-lab-records",
    "sensory-form": "/sensory-testing/sensory-forms",
    "sensory-forms": "/sensory-testing/sensory-forms",
    "sensory-top-sheet": "/sensory-testing/sensory-top-sheet",
    "test-records": "/shelf-life-testing/test-records",
    "monitoring-history": "/shelf-life-testing/monitoring-history",
    "cleanliness-items": "/cleaning/cleanliness-items-list",
    "cleanliness-items-list": "/cleaning/cleanliness-items-list",
    "cleaning-status": "/cleaning/cleaning-status",
    "maintenance-items": "/maintenance/maintenance-items-list",
    "maintenance-items-list": "/maintenance/maintenance-items-list",
    "maintenance-calendar": "/maintenance/maintenance-calendar",
    "production-schedule": "/application-lab/production-schedule",
    "raw-materials-price-list": "/application-lab/raw-materials-price-list",
    "packaging-types": "/application-lab/packaging-types",
};

const PROJECT_SCOPED_SUBMODULES = new Set([
    "product-development",
    "master-project-schedule",
    "manage-recipe",
    "sample-preparation",
    "sample-preparation-and-packaging",
    "sensory-form",
    "sensory-forms",
    "sensory-top-sheet",
    "test-records",
]);

export const getTaskRedirectPath = (task) => {
    const projectId = getTaskProjectId(task);
    const fallbackPath = projectId ? `/project-tasks/${projectId}` : "/project-tasks";

    const moduleKey = normalizeRouteKey(task?.module);
    const subModuleKey = normalizeRouteKey(task?.subModule || task?.submodule);
    const basePath = TASK_SUBMODULE_ROUTES[subModuleKey] || TASK_MODULE_DEFAULT_ROUTES[moduleKey];

    if (!basePath) return fallbackPath;
    if (projectId && PROJECT_SCOPED_SUBMODULES.has(subModuleKey)) {
        return `${basePath}/${projectId}`;
    }
    return basePath;
};
