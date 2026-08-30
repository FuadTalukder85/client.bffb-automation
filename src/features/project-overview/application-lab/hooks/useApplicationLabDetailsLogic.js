import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useApplicationLabProjectDetails } from "@/hooks/useMasterProject";
import { useUpdateProject, useInitiateProject } from "@/hooks/mutations/useProjectMutations";
import { useUsers } from "@/hooks/useUsers";
import { useProjectFieldPermissions } from "@/hooks/useProjectFieldPermissions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthStore } from "@/store/useAuthStore";
import { projectFieldGroups } from "../constants/projectFieldGroups";
import api from "@/lib/api";

export const useApplicationLabDetailsLogic = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedFieldsForHistory, setSelectedFieldsForHistory] = useState([]);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [updatingFields, setUpdatingFields] = useState(new Set());
    const [sidebarExpanded, setSidebarExpanded] = useLocalStorage('application-lab-sidebar-expanded', false);
    const [isStageUpdateModalOpen, setIsStageUpdateModalOpen] = useState(false);
    const [isUpdatingStage, setIsUpdatingStage] = useState(false);

    const [categoryId, setCategoryId] = useState(null);
    const [subCategoryId, setSubCategoryId] = useState(null);
    const [subSubCategoryId, setSubSubCategoryId] = useState(null);

    const { data: projectResponse, isLoading, error: queryError } = useApplicationLabProjectDetails(projectId);
    const { mutateAsync: updateProject } = useUpdateProject();
    const { mutateAsync: initiateProject } = useInitiateProject();
    const { data: allUsers = [] } = useUsers({ activeOnly: true });
    const { canReadField, canUpdateField, allowedReadSections, allowedUpdateSections, loading: permissionsLoading, permissions } = useProjectFieldPermissions();
    const { user } = useAuthStore();

    const projectResponseData = projectResponse?.data || projectResponse || {};

    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        if (projectResponseData?.applicationLab) {
            const appLab = projectResponseData.applicationLab;
            if (appLab.category) {
                const catId = typeof appLab.category === 'object' ? appLab.category._id : appLab.category;
                setCategoryId(catId);
            }
            if (appLab.subcategory) {
                const subCatId = typeof appLab.subcategory === 'object' ? appLab.subcategory._id : appLab.subcategory;
                setSubCategoryId(subCatId);
            }
            if (appLab.subSubcategory) {
                const subSubCatId = typeof appLab.subSubcategory === 'object' ? appLab.subSubcategory._id : appLab.subSubcategory;
                setSubSubCategoryId(subSubCatId);
            }
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [projectResponseData]);

    const handleCategoryChange = useCallback((value) => {
        setCategoryId(value);
        setSubCategoryId(null);
        setSubSubCategoryId(null);
    }, []);

    const handleSubCategoryChange = useCallback((value) => {
        setSubCategoryId(value);
        setSubSubCategoryId(null);
    }, []);

    const handleSubSubCategoryChange = useCallback((value) => {
        setSubSubCategoryId(value);
    }, []);

    const handleBack = () => {
        navigate("/project-overview/application-lab");
    };

    const handleToggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    const handleOpenStageUpdateModal = () => {
        setIsStageUpdateModalOpen(true);
    };

    const handleUpdateStage = async (data) => {
        clearMessages();
        setIsUpdatingStage(true);

        const successMessage = data?.action === "not_feasible"
            ? "Project marked as not feasible"
            : "Project sent to Product Development successfully";

        try {
            await initiateProject({
                id: projectId,
                data: { action: data.action, brief: data.brief },
                successMessage,
            });
            showSuccess(successMessage);
        } catch (err) {
            showError(err.message || "Failed to update project stage. Please try again.");
        } finally {
            setIsUpdatingStage(false);
        }
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

    const fetchRecipeByCode = async (recipeCode) => {
        if (!recipeCode) return null;
        try {
            const response = await api.get('/recipes', {
                params: { search: recipeCode, isActive: "true", limit: 20 }
            });
            console.log('fetchRecipeByCode API response:', response.data);
            const payload = response.data?.data || response.data || {};
            const recipes = payload.items || payload.data || payload || [];
            const trimmedCode = recipeCode.trim();
            console.log('fetchRecipeByCode: searching for', trimmedCode, 'in', recipes.length, 'recipes');
            const recipe = Array.isArray(recipes) 
                ? recipes.find(r => (r.recipeCode || "").toLowerCase() === trimmedCode.toLowerCase())
                : null;
            console.log('fetchRecipeByCode: found recipe:', recipe);
            return recipe || null;
        } catch (err) {
            console.error('Error fetching recipe by code:', err);
            return null;
        }
    };

    const handleClearChildFields = useCallback(async (...childPaths) => {
        clearMessages();
        try {
            const updateData = {};
            childPaths.forEach(path => {
                if (path === "tags") {
                    updateData["applicationLab.tags"] = [];
                } else {
                    updateData[`applicationLab.${path}`] = null;
                }
            });
            await updateProject({ id: projectId, data: updateData });
            showSuccess("Dependent fields cleared");
        } catch (err) {
            showError(err.message || "Failed to clear dependent fields.");
        }
    }, [updateProject, projectId, clearMessages, showError, showSuccess]);

    const handleSave = (fieldPath) => async (value) => {
        clearMessages();
        if (typeof fieldPath === 'object' && fieldPath !== null) {
            const keys = Object.keys(fieldPath);
            setUpdatingFields(new Set(keys));
            try {
                let updateData = { ...fieldPath };
                if (updateData['applicationLab.recipeCode']) {
                    const recipe = await fetchRecipeByCode(updateData['applicationLab.recipeCode']);
                    if (recipe) {
                        updateData['applicationLab.recipeName'] = recipe.name || recipe.recipeName;
                        updateData['applicationLab.recipeRef'] = recipe._id || recipe.id;
                    }
                }
                await updateProject({ id: projectId, data: updateData });
                showSuccess("Project details updated successfully");
            } catch (err) {
                console.error('Error saving project details:', err);
                showError(err.message || "Failed to update project. Please try again.");
                throw err;
            } finally {
                setUpdatingFields(new Set());
            }
            return;
        }
        setUpdatingFields(prev => new Set(prev).add(fieldPath));
        try {
            if (fieldPath === 'applicationLab.recipeCode' && value) {
                console.log('handleSave: recipeCode changed to', value);
                const recipe = await fetchRecipeByCode(value);
                console.log('handleSave: recipe found:', recipe);
                if (recipe) {
                    const updateData = { 
                        [fieldPath]: value,
                        'applicationLab.recipeName': recipe.name || recipe.recipeName,
                        'applicationLab.recipeRef': recipe._id || recipe.id
                    };
                    console.log('Recipe found, updating with:', updateData);
                    await updateProject({ 
                        id: projectId, 
                        data: updateData
                    });
                    const fieldName = fieldPath.split('.').pop();
                    showSuccess(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} updated successfully - Recipe info populated`);
                } else {
                    console.log('No recipe found for code:', value, '- only saving code');
                    await updateProject({ id: projectId, data: { [fieldPath]: value } });
                    const fieldName = fieldPath.split('.').pop();
                    showSuccess(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} updated successfully`);
                }
            } else {
                console.log('handleSave: updating field', fieldPath, 'to', value);
                await updateProject({ id: projectId, data: { [fieldPath]: value } });
                const fieldName = fieldPath.split('.').pop();
                showSuccess(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} updated successfully`);
            }
        } catch (err) {
            console.error('Error saving field:', err);
            showError(err.message || "Failed to update field. Please try again.");
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

    const getUserDisplayName = (userId) => {
        if (!userId) return "";
        const user = allUsers.find(u => u._id === userId || u.id === userId);
        if (user) {
            return `${user.firstName || user.name || "Unknown"} ${user.lastName || ""}`.trim();
        }
        return userId;
    };

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
        isStageUpdateModalOpen,
        setIsStageUpdateModalOpen,
        isUpdatingStage,
        handleBack,
        handleToggleSidebar,
        handleOpenStageUpdateModal,
        handleUpdateStage,
        handleSave,
        fieldPermissionChecks,
        getUserDisplayName,
        permissionWarnings,
        canReadField,
        canUpdateField,
        categoryId,
        subCategoryId,
        subSubCategoryId,
        onCategoryChange: handleCategoryChange,
        onSubCategoryChange: handleSubCategoryChange,
        onSubSubCategoryChange: handleSubSubCategoryChange,
        handleClearChildFields,
    };
};