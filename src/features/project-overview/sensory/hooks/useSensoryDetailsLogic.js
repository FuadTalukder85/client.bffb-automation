import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useSensoryLabProjectDetails } from "@/hooks/useMasterProject";
import { useUpdateProject } from "@/hooks/mutations/useProjectMutations";
import { useUsers } from "@/hooks/useUsers";
import { useProjectFieldPermissions } from "@/hooks/useProjectFieldPermissions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthStore } from "@/store/useAuthStore";
import { projectFieldGroups } from "../constants/projectFieldGroups";

export const useSensoryDetailsLogic = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedFieldsForHistory, setSelectedFieldsForHistory] = useState([]);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [updatingFields, setUpdatingFields] = useState(new Set());
    const [sidebarExpanded, setSidebarExpanded] = useLocalStorage('sensory-sidebar-expanded', false);

    const { data: projectResponse, isLoading, error: queryError } = useSensoryLabProjectDetails(projectId);
    const { mutateAsync: updateProject } = useUpdateProject();
    const { data: allUsers = [] } = useUsers({ activeOnly: true });
    const { canReadField, canUpdateField, allowedReadSections, allowedUpdateSections, loading: permissionsLoading, permissions } = useProjectFieldPermissions();
    const { user } = useAuthStore();

    const handleBack = () => {
        navigate("/project-overview/sensory");
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
        handleBack,
        handleToggleSidebar,
        handleSave,
        fieldPermissionChecks,
        getUserDisplayName,
        permissionWarnings,
        canReadField,
        canUpdateField,
    };
};