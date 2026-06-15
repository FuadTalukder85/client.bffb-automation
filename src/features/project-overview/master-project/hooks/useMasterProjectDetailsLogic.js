import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useMasterProject } from "@/hooks/useMasterProject";
import {
    useUpdateProject,
    useInitiateProject,
    useExportProjects,
} from "@/hooks/mutations/useProjectMutations";
import { useUsers } from "@/hooks/useUsers";
import { useProjectFieldPermissions } from "@/hooks/useProjectFieldPermissions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthStore } from "@/store/useAuthStore";
import { projectFieldGroups } from "../constants/projectFieldGroups";

export const useMasterProjectDetailsLogic = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedFieldsForHistory, setSelectedFieldsForHistory] = useState([]);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [updatingFields, setUpdatingFields] = useState(new Set());
    const [sidebarExpanded, setSidebarExpanded] = useLocalStorage('master-project-sidebar-expanded', false);
    const [isExporting, setIsExporting] = useState(false);

    const { data: projectResponse, isLoading, error: queryError } = useMasterProject(projectId, { view: 'master-projects' });
    const { mutateAsync: updateProject } = useUpdateProject();
    const { mutateAsync: initiateProject } = useInitiateProject();
    const exportProjectsMutation = useExportProjects();
    const { data: allUsers = [] } = useUsers({ activeOnly: true });
    const { canReadField, canUpdateField, allowedReadSections, allowedUpdateSections, loading: permissionsLoading, permissions } = useProjectFieldPermissions();
    const { user } = useAuthStore();

    const handleBack = () => {
        navigate("/project-overview/master-projects");
    };

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);

        try {
            const projectCode = projectResponseData?.masterProject?.code;
            const isActive = projectResponseData?.masterProject?.isActive;

            await exportProjectsMutation.mutateAsync({
                search: projectCode,
                isActive: isActive === false ? "false" : "true",
                page: 1,
                limit: 1,
            });
            setIsExporting(false);
            showSuccess("Project data exported successfully");
        } catch (err) {
            setIsExporting(false);
            showError(err?.message || "Failed to export project. Please try again.");
        }
    };

    const handleInitiate = () => {
        showSuccess("Project initiation process started");
    };

    const handleInitiateUpdate = async (data) => {
        clearMessages();
        let successMessage = "Project initiated successfully";

        switch (data?.action) {
            case "send_to_product_development":
                successMessage = "Project initiated successfully to Product Development";
                break;
            case "send_to_application_lab":
                successMessage = "Project initiated successfully to Application Lab";
                break;
            case "not_feasible":
                successMessage = "Project marked as not feasible";
                break;
            default:
                successMessage = "Project initiated successfully";
        }
        try {
            await initiateProject({
                id: projectId,
                data: { action: data.action, brief: data.brief },
                successMessage,
            });
            showSuccess(successMessage);
        } catch (err) {
            showError(err.message || "Failed to initiate project. Please try again.");
        }
    };

    const handleToggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const showError = (message) => {
        setError(message);
        setSuccess(null);
        setTimeout(() => setError(null), 5000);
    };

    const showSuccess = (message) => {
        setSuccess(message);
        setError(null);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleSave = (fieldPath) => async (value) => {
        clearMessages();
        setUpdatingFields(prev => new Set(prev).add(fieldPath));
        try {
            await updateProject({ id: projectId, data: { [fieldPath]: value } });
            const fieldName = fieldPath.split('.').pop();
            showSuccess(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} updated successfully`);
        } catch (err) {
            showError(err.message || "Failed to update field. Please try again.");
        } finally {
            setUpdatingFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldPath);
                return newSet;
            });
        }
    };

    const fieldPermissionChecks = useMemo(() => {
        return projectFieldGroups.flat().map(field => {
            const canRead = canReadField ? canReadField(field.path) : true;
            const canUpdate = canUpdateField ? canUpdateField(field.path) : false;
            const section = field.path.split('.')[0];
            return {
                ...field,
                canRead,
                canUpdate,
                section,
                finalCanEdit: field.canEdit && canUpdate,
            };
        });
    }, [canReadField, canUpdateField]);

    const getUserDisplayName = (userId) => {
        if (!userId) return "";
        const user = allUsers.find(u => u._id === userId || u.id === userId);
        if (user) {
            return `${user.firstName || user.name || "Unknown"} ${user.lastName || ""}`.trim();
        }
        return userId;
    };

    const projectResponseData = projectResponse?.data || projectResponse || {};
    const permissionWarnings = Array.isArray(projectResponse?.metadata?.warnings)
        ? projectResponse.metadata.warnings
        : [];

    return {
        projectId,
        projectResponseData,
        isLoading,
        queryError,
        permissionsLoading,
        user,
        permissions,
        allowedReadSections,
        allowedUpdateSections,
        error,
        success,
        selectedFieldsForHistory,
        setSelectedFieldsForHistory,
        showDebugPanel,
        setShowDebugPanel,
        updatingFields,
        sidebarExpanded,
        isExporting,
        handleBack,
        handleExport,
        handleInitiate,
        handleInitiateUpdate,
        handleToggleSidebar,
        handleSave,
        fieldPermissionChecks,
        getUserDisplayName,
        permissionWarnings,
        canReadField,
        canUpdateField,
    };
};
