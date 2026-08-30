import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useMasterProject } from "@/hooks/useMasterProject";
import { useUpdateProject } from "@/hooks/mutations/useProjectMutations";
import { useProjectFieldPermissions } from "@/hooks/useProjectFieldPermissions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthStore } from "@/store/useAuthStore";
import { projectFieldGroups } from "../constants/projectFieldGroups";

export const useMasterProjectScheduleDetailsLogic = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [selectedFieldsForHistory, setSelectedFieldsForHistory] = useState([]);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [updatingFields, setUpdatingFields] = useState(new Set());
    const [sidebarExpanded, setSidebarExpanded] = useLocalStorage('master-project-schedule-sidebar-expanded', false);

    const { data: projectResponse, isLoading, error: queryError } = useMasterProject(projectId, { view: 'master-project-schedule' });
    const { mutateAsync: updateProject } = useUpdateProject();
    const { canReadField, canUpdateField, allowedReadSections, allowedUpdateSections, loading: permissionsLoading, permissions } = useProjectFieldPermissions();
    const { user } = useAuthStore();

    const handleBack = () => {
        navigate("/project-overview/master-project-schedule");
    };

    const handleToggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const handleSave = (fieldPath) => async (value) => {
        if (typeof fieldPath === 'object' && fieldPath !== null) {
            const keys = Object.keys(fieldPath);
            setUpdatingFields(new Set(keys));
            try {
                await updateProject({ id: projectId, data: fieldPath });
            } catch (err) {
                console.error("Failed to update project:", err);
                throw err;
            } finally {
                setUpdatingFields(new Set());
            }
            return;
        }
        setUpdatingFields(prev => new Set(prev).add(fieldPath));
        try {
            await updateProject({ id: projectId, data: { [fieldPath]: value } });
        } catch (err) {
            console.error("Failed to update field:", err);
            throw err;
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
        selectedFieldsForHistory,
        setSelectedFieldsForHistory,
        showDebugPanel,
        setShowDebugPanel,
        sidebarExpanded,
        updatingFields,
        handleBack,
        handleToggleSidebar,
        handleSave,
        fieldPermissionChecks,
        permissionWarnings,
        canReadField,
        canUpdateField,
    };
};
