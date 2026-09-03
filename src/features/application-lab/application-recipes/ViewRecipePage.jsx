import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import DesktopViewRecipe from "./components/DesktopViewRecipe";
import MobileViewRecipe from "./components/MobileViewRecipe";
import { RecipeViewSkeleton } from "./components/RecipeViewSkeleton";
import ExportRecipePdfModal from "./components/ExportRecipePdfModal";
import ExportTypeModal from "./components/ExportTypeModal";
import { buildSOPDataFromRecipe, convertSOPDataToBackendFields } from "./data/sopDataByFormat";
import { SaveChangesModal } from "@/features/task-assignments/project-task/SingleProjectTask/components/SaveChangesModal";
import { CreateVersionModal } from "./components/CreateVersionModal";
import { ChangeRecipeTypeModal } from "./components/ChangeRecipeTypeModal";
import { useRecipeById, useRecipeVersions, useRecipes, useRecipeTypeChangePreview } from "@/hooks/useRecipes";
import { useApplicationLabProjectDetails } from "@/hooks/useMasterProject";
import { recipeAPI } from "@/services/recipeService";
import {
  useUpdateRecipe,
  useCreateRecipeVersion,
  useChangeRecipeType,
} from "@/hooks/mutations/useRecipeMutations";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/lib/utils";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { PrepareSampleModal } from "./components/PrepareSampleModal";
import DownloadHistoryModal from "./components/DownloadHistoryModal";
import { FinalizeRecipeModal } from "./components/FinalizeRecipeModal";


const tabs = [
  { id: "basic", label: "Basic Information" },
  { id: "ingredients", label: "Ingredients" },
  { id: "sop", label: "SOP & Analytics" },
];

const RECIPE_STATUS = {
  FINAL: "final",
  IN_DEVELOPMENT: "in-development",
};

const sanitizeFileName = (name) =>
  String(name || "recipe")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-");

// Helper was removed in favor of getApiErrorMessage

const normalizeProjectForView = (project = {}, fallbackRecipe = {}) => {
  const masterProject = project?.masterProject || {};
  const applicationLab = project?.applicationLab || {};
  const common = project?.common || {};

  return {
    ...project,
    projectCode: project?.projectCode || masterProject?.code || project?.code || null,
    projectName:
      project?.projectName ||
      masterProject?.title ||
      project?.name ||
      masterProject?.code ||
      null,
    raisedBy: project?.raisedBy || masterProject?.raisedBy || null,
    purpose: project?.purpose || masterProject?.purpose || null,
    objective: project?.objective || masterProject?.objective || null,
    objectiveDetails:
      project?.objectiveDetails || masterProject?.objectiveDetails || null,
    raisedDate: project?.raisedDate || masterProject?.raisedDate || null,
    projectStatus:
      masterProject?.status ||
      project?.projectStatus ||
      project?.applicationDevelopmentStatus ||
      applicationLab?.developmentStatus ||
      null,
    applicationCategory: project?.applicationCategory || applicationLab?.category || null,
    applicationSubCategory:
      project?.applicationSubCategory || applicationLab?.subcategory || null,
    applicationSubSubCategory:
      project?.applicationSubSubCategories || project?.applicationSubSubCategory || applicationLab?.subSubcategory || null,
    applicationTags: project?.applicationTags || applicationLab?.tags || [],
    targetCost:
      project?.targetCost ||
      project?.targetCosting ||
      common?.targetCosting ||
      common?.costing ||
      applicationLab?.targetCost ||
      null,
    benchmark: project?.benchmark || applicationLab?.benchmark || null,
    link: project?.link || applicationLab?.link || null,
    latestRecipe: project?.latestRecipe || fallbackRecipe?.project?.latestRecipe || null,
  };
};

const flatMapIndependentDetails = (recipeObj) => {
  if (!recipeObj) return recipeObj;
  const details = recipeObj.independentDetails || {};
  return {
    ...recipeObj,
    independentRecipePurpose: recipeObj.independentRecipePurpose ?? details.purpose ?? "",
    independentRecipePurposeName: recipeObj.independentRecipePurposeName ?? details.projectName ?? "",
    independentRecipeObjective: recipeObj.independentRecipeObjective ?? details.objective ?? "",
    independentRecipeObjectiveDetails: recipeObj.independentRecipeObjectiveDetails ?? details.objectiveDetails ?? "",
    independentRecipeRaisedBy: recipeObj.independentRecipeRaisedBy ?? details.raisedBy ?? "",
    independentRecipeRaisedDate: recipeObj.independentRecipeRaisedDate ?? details.raisedDate ?? "",
    independentRecipeProjectCode: recipeObj.independentRecipeProjectCode ?? details.projectCode ?? "",
    independentRecipeProjectName: recipeObj.independentRecipeProjectName ?? details.projectName ?? "",
    independentRecipeApplicationCategory: recipeObj.independentRecipeApplicationCategory ?? details.applicationCategory ?? "",
    independentRecipeApplicationSubcategory: recipeObj.independentRecipeApplicationSubcategory ?? details.applicationSubcategory ?? "",
    independentRecipeApplicationSubSubcategory: recipeObj.independentRecipeApplicationSubSubcategory ?? details.applicationSubSubcategory ?? "",
    independentRecipeTags: Array.isArray(details.tags) ? details.tags.join(", ") : (recipeObj.independentRecipeTags ?? details.tags ?? ""),
    independentRecipeTargetCost: recipeObj.independentRecipeTargetCost ?? details.targetCost ?? "",
    independentRecipeBenchmark: recipeObj.independentRecipeBenchmark ?? details.benchmark ?? "",
    independentRecipeLink: recipeObj.independentRecipeLink ?? details.link ?? "",
  };
};

export default function ViewRecipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId: routeProjectId, recipeId: routeRecipeId } = useParams();
  const { permissions = [] } = useUserPermissions();
  const canExportRecipe = hasPermission(permissions, PERMISSIONS.RECIPE.EXPORT_APPLICATION_RECIPE);

  // Get initial data from navigation state
  const stateProject = location.state?.project;
  const stateProjectId = location.state?.projectId;
  const stateRecipeId = location.state?.recipeId;

  // Route fallback: the `:projectId` segment can sometimes carry a recipe id in legacy/deeplink flows.
  const {
    data: routeRecipeFallback,
    isLoading: isRouteRecipeLoading,
  } = useRecipeById(routeProjectId, {
    enabled: !routeRecipeId && !stateRecipeId && !!routeProjectId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: routeVersionRecipe, isLoading: isRouteVersionRecipeLoading } = useRecipeById(routeRecipeId, {
    enabled: !!routeRecipeId,
  });

  const routeVersionProjectId =
    routeVersionRecipe?.project?._id ||
    (typeof routeVersionRecipe?.project === "string" ? routeVersionRecipe.project : undefined);

  const isRouteParamRecipeId = Boolean(routeRecipeFallback?._id);
  const projectId =
    stateProject?._id ||
    stateProjectId ||
    routeVersionProjectId ||
    routeRecipeFallback?.project?._id ||
    (isRouteParamRecipeId ? undefined : routeProjectId);


  // 1. Always fetch full project details when projectId is available.
  // Navigation state from master list can be partial, so API data must hydrate missing fields.
  const { data: fetchedProject, isLoading: isProjectLoading } = useApplicationLabProjectDetails(
    projectId, 
    { enabled: !!projectId }
  );

  const fetchedProjectData = useMemo(
    () => fetchedProject?.data?.data || fetchedProject?.data || fetchedProject || {},
    [fetchedProject]
  );

  const mergedSourceProject = useMemo(
    () => ({
      ...(routeVersionRecipe?.project && typeof routeVersionRecipe.project === "object"
        ? routeVersionRecipe.project
        : {}),
      ...(routeRecipeFallback?.project || {}),
      ...(stateProject || {}),
      ...(fetchedProjectData || {}),
    }),
    [routeVersionRecipe?.project, routeRecipeFallback?.project, stateProject, fetchedProjectData]
  );

  const project = useMemo(
    () => normalizeProjectForView(mergedSourceProject, routeRecipeFallback),
    [mergedSourceProject, routeRecipeFallback]
  );

  // 2. Determine which recipe ID to use
  // Priority: route recipeId > state recipeId > latest recipe from project
  const initialRecipeId = routeRecipeId || stateRecipeId || routeRecipeFallback?._id || project?.latestRecipe?._id;

  // 3. Fallback: If we don't have a Recipe ID yet (e.g. refresh), fetch the latest recipe for this project
  const { data: projectRecipes, isLoading: isLatestRecipeLoading } = useRecipes({
    project: projectId,
    limit: 1,
    enabled: !initialRecipeId && !!projectId
  });

  const resolvedRecipeId = initialRecipeId || projectRecipes?.data?.[0]?._id;
  const [activeRecipeId, setActiveRecipeId] = useState(null);

  useEffect(() => {
    if (resolvedRecipeId && !activeRecipeId) {
      setActiveRecipeId(resolvedRecipeId);
    }
  }, [resolvedRecipeId, activeRecipeId]);

  // 4. Fetch the full recipe detail
  const { data: fetchedRecipe, isLoading: isRecipeLoading } = useRecipeById(activeRecipeId || resolvedRecipeId, {
    enabled: !!(activeRecipeId || resolvedRecipeId)
  });

  const statusSourceProject = useMemo(() => {
    const source =
      fetchedProjectData ||
      fetchedRecipe?.project ||
      (routeVersionRecipe?.project && typeof routeVersionRecipe.project === "object"
        ? routeVersionRecipe.project
        : null) ||
      routeRecipeFallback?.project ||
      {};

    const fallbackRecipe = fetchedRecipe || routeRecipeFallback || {};
    return normalizeProjectForView(source, fallbackRecipe);
  }, [fetchedProjectData, fetchedRecipe, routeVersionRecipe?.project, routeRecipeFallback]);

  // 5. Fetch recipe versions
  const { data: versions = [] } = useRecipeVersions(activeRecipeId || resolvedRecipeId, {
    enabled: !!(activeRecipeId || resolvedRecipeId)
  });

  // Mutations
  const { mutateAsync: updateRecipe, isPending: isSaving } = useUpdateRecipe();
  const { mutateAsync: createVersion, isPending: isCreatingVersion } = useCreateRecipeVersion();
  const { mutateAsync: changeRecipeType, isPending: isChangingRecipeType } = useChangeRecipeType();

  const [editableProject, setEditableProject] = useState(project);
  const [editableRecipe, setEditableRecipe] = useState(fetchedRecipe || {});
  const [activeTab, setActiveTab] = useState("basic");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCreateVersionModalOpen, setIsCreateVersionModalOpen] = useState(false);
  const [isChangeRecipeTypeModalOpen, setIsChangeRecipeTypeModalOpen] = useState(false);
  const [selectedTargetRecipeType, setSelectedTargetRecipeType] = useState("");
  const [changeRecipeTypeError, setChangeRecipeTypeError] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportTypeModalOpen, setIsExportTypeModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPrepareSampleModalOpen, setIsPrepareSampleModalOpen] = useState(false);
  const [isDownloadHistoryModalOpen, setIsDownloadHistoryModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [recipeToFinalize, setRecipeToFinalize] = useState(null);
  const hasAutoTriggeredEditRef = useRef(false);

  // Get project members for task assignments
  const { data: projectMembers = [] } = useProjectMembers(projectId);

  // Update local state when API data loads
  useEffect(() => {
    if (fetchedRecipe) {
      setEditableRecipe(flatMapIndependentDetails(fetchedRecipe));
    }
  }, [fetchedRecipe]);

  useEffect(() => {
    const p =
      Object.keys(mergedSourceProject || {}).length > 0
        ? mergedSourceProject
        : fetchedRecipe?.project;

    if (p) {
      setEditableProject(normalizeProjectForView(p, fetchedRecipe));
    }
  }, [mergedSourceProject, fetchedRecipe]);

  // Current version from fetched recipe or latest version
  const currentVersion = editableRecipe?.version ?? versions?.[0]?.version ?? 1;
  const isFinalized =
    (editableRecipe?.recipeStatus || fetchedRecipe?.recipeStatus || editableProject?.latestRecipe?.recipeStatus) ===
    RECIPE_STATUS.FINAL;

  // Automatically enable edit mode if the version is 0 and it was just created
  useEffect(() => {
    if (location.state?.isNewRecipe && currentVersion === 0 && !isFinalized && !hasAutoTriggeredEditRef.current) {
      setIsEditMode(true);
      hasAutoTriggeredEditRef.current = true;
    } else if (isFinalized) {
      setIsEditMode(false);
    }
  }, [currentVersion, isFinalized, location.state?.isNewRecipe]);

  // Derive recipe object for display (combine API recipe with project's latestRecipe)
  const recipe = useMemo(() => {
    // Priority: editableRecipe if it has data, else fallback to project's latest
    const base = flatMapIndependentDetails(editableRecipe?._id ? editableRecipe : (editableProject?.latestRecipe || {}));
    const recipeProject = base?.project || {};
    const mergedProject = {
      ...recipeProject,
      objectiveDetails:
        recipeProject?.objectiveDetails ?? editableProject?.objectiveDetails ?? "",
      category: recipeProject?.category ?? editableProject?.applicationCategory ?? null,
      subCategory:
        recipeProject?.subCategory ?? editableProject?.applicationSubCategory ?? null,
      subSubCategory:
        recipeProject?.subSubCategory ?? (Array.isArray(editableProject?.applicationSubSubCategory) ? editableProject.applicationSubSubCategory[0] : editableProject?.applicationSubSubCategory) ?? null,
      subSubCategories:
        Array.isArray(recipeProject?.subSubCategories) && recipeProject.subSubCategories.length > 0
          ? recipeProject.subSubCategories
          : (Array.isArray(editableProject?.applicationSubSubCategory)
              ? editableProject.applicationSubSubCategory
              : (recipeProject?.subSubCategory ? [recipeProject.subSubCategory] : (editableProject?.applicationSubSubCategory ? [editableProject.applicationSubSubCategory] : []))),
      tags:
        Array.isArray(recipeProject?.tags) && recipeProject.tags.length > 0
          ? recipeProject.tags
          : editableProject?.applicationTags || [],
      targetCost: recipeProject?.targetCost ?? editableProject?.targetCost ?? null,
      benchmark: recipeProject?.benchmark ?? editableProject?.benchmark ?? null,
      link: recipeProject?.link ?? editableProject?.link ?? null,
    };

    // Ensure display name is consistent
    return {
      ...base,
      name: base.name || base.recipeName,
      recipeName: base.recipeName || base.name,
      project: mergedProject,
    };
  }, [editableRecipe, editableProject]);

  const isTypeChangeEligible = useMemo(() => {
    if (!recipe?._id) return false;
    if (recipe?.version !== 0) return false;
    if (!Array.isArray(versions) || versions.length !== 1) return false;
    return versions[0]?.version === 0;
  }, [recipe?._id, recipe?.version, versions]);

  // Determine recipe format (bakery, beverage, etc.)
  const activeRecipeFormat = useMemo(() => {
    if (location.state?.format) return location.state.format;
    const type = recipe?.recipeType || fetchedRecipe?.recipeType;
    return type?.toLowerCase() || "bakery";
  }, [location.state?.format, recipe?.recipeType, fetchedRecipe?.recipeType]);

  // Build SOP data dynamically from recipe
  const [sopData, setSopData] = useState(() => buildSOPDataFromRecipe(recipe, activeRecipeFormat));
  const lastHydratedSopKeyRef = useRef(null);

  const { data: recipeTypeChangePreview, isLoading: isRecipeTypeChangePreviewLoading } = useRecipeTypeChangePreview(
    recipe?._id,
    selectedTargetRecipeType,
    {
      enabled: Boolean(
        recipe?._id &&
          selectedTargetRecipeType &&
          isChangeRecipeTypeModalOpen &&
          isTypeChangeEligible
      ),
    }
  );

  // Re-build SOP data when recipe changes, but ONLY if we are not in edit mode
  // This prevents background re-fetches from overwriting user's local edits
  // Re-build SOP data when recipe snapshot changes.
  // While in edit mode, skip only same-snapshot re-hydration to protect local unsaved changes.
  useEffect(() => {
    const recipeSnapshotKey = recipe?._id
      ? `${recipe._id}:${recipe?.updatedAt || ""}:${recipe?.version ?? ""}`
      : null;

    if (!recipeSnapshotKey) {
      if (!isEditMode) {
        setSopData(buildSOPDataFromRecipe(recipe, activeRecipeFormat));
      }
      return;
    }

    const isNewSnapshot = lastHydratedSopKeyRef.current !== recipeSnapshotKey;

    if (!isEditMode || isNewSnapshot) {
      setSopData(buildSOPDataFromRecipe(recipe, activeRecipeFormat));
      lastHydratedSopKeyRef.current = recipeSnapshotKey;
    }
  }, [recipe, activeRecipeFormat, isEditMode]);

  // Handle SOP changes from the SOP component
  const handleSOPChange = (updatedSOPData) => {
    setSopData(updatedSOPData);
  };

  const handleIngredientsChange = async (payload, targetRecipeId) => {
    const isLegacyArray = Array.isArray(payload);
    const nextIngredients = isLegacyArray
      ? payload
      : Array.isArray(payload?.ingredients)
        ? payload.ingredients
        : undefined;

    if (targetRecipeId && targetRecipeId !== recipe?._id) {
      if (nextIngredients !== undefined) {
        await handleSaveSpecificFields({ ingredients: nextIngredients }, targetRecipeId);
      }
      return;
    }

    setEditableRecipe((prev) => ({
      ...prev,
      ...(nextIngredients !== undefined ? { ingredients: nextIngredients } : {}),
      ...(payload?.outputYield !== undefined ? { outputYield: payload.outputYield } : {}),
      ...(payload?.outputServingSize !== undefined
        ? { outputServingSize: payload.outputServingSize }
        : {}),
    }));
  };

  const isVersionRoute = Boolean(routeRecipeId);

  useEffect(() => {
    if (
      (!project?._id && !isProjectLoading && !isRouteRecipeLoading && !isRouteVersionRecipeLoading && !isVersionRoute && !resolvedRecipeId) ||
      (!resolvedRecipeId && !isLatestRecipeLoading && !isRouteRecipeLoading && !isRouteVersionRecipeLoading)
    ) {
      navigate("/application-lab/application-recipes", { replace: true });
    }
  }, [project?._id, isProjectLoading, isRouteRecipeLoading, isRouteVersionRecipeLoading, isVersionRoute, resolvedRecipeId, isLatestRecipeLoading, navigate]);

  if (
    (!project?._id && !isProjectLoading && !isRouteRecipeLoading && !isRouteVersionRecipeLoading && !isVersionRoute && !resolvedRecipeId) ||
    (!resolvedRecipeId && !isLatestRecipeLoading && !isRouteRecipeLoading && !isRouteVersionRecipeLoading)
  ) {
    return null;
  }

  const handleRecipeChange = (field, value) => {
    const flatMapping = {
      category: "applicationCategory",
      subcategory: "applicationSubCategory",
      subSubcategory: "applicationSubSubCategory",
      tags: "applicationTags"
    };

    if (flatMapping[field]) {
      setEditableProject(prev => ({
        ...prev,
        [flatMapping[field]]: value
      }));
    } else {
      // Update fields inside the recipe
      setEditableRecipe(prev => ({
        ...prev,
        [field]: value
      }));
      // Also update in latestRecipe of editableProject
      setEditableProject(prev => ({
        ...prev,
        latestRecipe: {
          ...(prev.latestRecipe || {}),
          [field]: value
        }
      }));
    }
  };

  const handleProjectChange = (field, value) => {
    const flatMapping = {
      code: "projectCode",
      title: "projectName",
      raisedDate: "raisedDate",
      status: "projectStatus"
    };

    const targetField = flatMapping[field] || field;

    setEditableProject(prev => ({
      ...prev,
      [targetField]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleEdit = () => {
    if (isFinalized) return;
    setIsEditMode(true);
  };
  
  const handleSave = () => {
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    const recipeId = recipe?._id;
    if (!recipeId) {
      console.warn("No recipe ID to save");
      setIsSaveModalOpen(false);
      return;
    }

    try {
      // Helper to parse numbers safely for Zod (returns undefined instead of NaN/null)
      const parseNum = (val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      };

      // Build update payload from editableRecipe (only backend-relevant fields)
      const updateData = {};
      const basicFields = {
        name: editableRecipe.recipeName || editableRecipe.name,
        recipeName: editableRecipe.recipeName || editableRecipe.name,
        recipeType: editableRecipe.recipeType,
        recipeStatus: editableRecipe.recipeStatus,
        potentiality: parseNum(editableRecipe.potentiality),
        outputYield: parseNum(editableRecipe.outputYield),
        outputServingSize: parseNum(editableRecipe.outputServingSize),
        servingSizeText: editableRecipe.servingSizeText ?? "",
      };

      // Only add non-undefined basic fields
      Object.entries(basicFields).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      if (editableRecipe.isIndependentRecipe) {
        updateData.isIndependentRecipe = true;
        const tagsVal = editableRecipe.independentRecipeTags;
        updateData.independentDetails = {
          purpose: editableRecipe.independentRecipePurpose || null,
          projectName: editableRecipe.independentRecipeProjectName || null,
          objective: editableRecipe.independentRecipeObjective || null,
          objectiveDetails: editableRecipe.independentRecipeObjectiveDetails || null,
          raisedBy: editableRecipe.independentRecipeRaisedBy || null,
          raisedDate: editableRecipe.independentRecipeRaisedDate || null,
          projectCode: editableRecipe.independentRecipeProjectCode || null,
          applicationCategory: editableRecipe.independentRecipeApplicationCategory || null,
          applicationSubcategory: editableRecipe.independentRecipeApplicationSubcategory || null,
          applicationSubSubcategory: editableRecipe.independentRecipeApplicationSubSubcategory || null,
          tags: typeof tagsVal === "string"
            ? tagsVal.split(",").map(t => t.trim()).filter(Boolean)
            : (Array.isArray(tagsVal) ? tagsVal : []),
          targetCost: editableRecipe.independentRecipeTargetCost || null,
          benchmark: editableRecipe.independentRecipeBenchmark || null,
          link: editableRecipe.independentRecipeLink || null,
        };
      }

      // Include SOP & Analytics fields from the sopData state
      const sopFields = convertSOPDataToBackendFields(sopData, activeRecipeFormat);
      Object.assign(updateData, sopFields);

      if (Array.isArray(editableRecipe.ingredients)) {
        updateData.ingredients = editableRecipe.ingredients.map((item) => ({
          role: item.role || null,
          type: item.type || null,
          process: item.process || null,
          ingredientSourceType: item.ingredientSourceType,
          sourceId:
            typeof (item.sourceId || item.ingredient) === "object" && (item.sourceId || item.ingredient) !== null
              ? (item.sourceId || item.ingredient)._id || (item.sourceId || item.ingredient).id || null
              : (item.sourceId || item.ingredient),
          quantity: parseNum(item.quantity) ?? 0,
          bffRateAtCreation: parseNum(item.bffRateAtCreation),
          clientRateAtCreation: parseNum(item.clientRateAtCreation),
        }));
      }

      const updatedRecipe = await updateRecipe({ id: recipeId, data: updateData });

      if (updatedRecipe?._id) {
        setActiveRecipeId(updatedRecipe._id);
        setEditableRecipe(flatMapIndependentDetails(updatedRecipe));
      }

      setIsEditMode(false);
    } catch (err) {
      console.error("Failed to save recipe:", err);
    } finally {
      setIsSaveModalOpen(false);
    }
  };

  const handleSaveSpecificFields = async (fieldsToUpdate, targetRecipeId) => {
    const recipeId = targetRecipeId || recipe?._id;
    if (!recipeId) return;

    try {
      const updatedRecipe = await updateRecipe({ id: recipeId, data: fieldsToUpdate });
      if (updatedRecipe?._id && (!targetRecipeId || targetRecipeId === recipe?._id)) {
        setActiveRecipeId(updatedRecipe._id);
        setEditableRecipe(flatMapIndependentDetails(updatedRecipe));
      }
      toast.success("Changes saved successfully");
      return updatedRecipe;
    } catch (err) {
      console.error("Failed to save changes:", err);
      toast.error(getApiErrorMessage(err, "Failed to save changes"));
      throw err;
    }
  };

  const handleCancelSave = () => {
    setIsSaveModalOpen(false);
  };
  
  const handleCancel = () => {
    // Reset recipe to API data
    if (fetchedRecipe) {
      setEditableRecipe(flatMapIndependentDetails(fetchedRecipe));
    }
    setEditableProject(normalizeProjectForView(mergedSourceProject, fetchedRecipe));
    setIsEditMode(false);
  };
  
  const handleDownload = () => {
    if (!recipe?._id || isExportingPdf) return;
    setIsExportTypeModalOpen(true);
  };

  const handleExportTypeInternal = async () => {
    if (!recipe?._id || isExportingPdf) return;

    try {
      setIsExportingPdf(true);

      const response = await recipeAPI.exportApplicationFormulaPdf(recipe._id, {
        isInternal: true,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const filename = `${sanitizeFileName(recipe?.recipeCode || recipe?.recipeName || "recipe")}-internal.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsExportTypeModalOpen(false);
      toast.success("Recipe PDF exported successfully");
    } catch (error) {
      console.error("Failed to export internal PDF:", error);
      if (error?.message === "Network Error") {
        console.log("Download intercepted by download manager or network error occurred.");
        toast.success("Recipe PDF exported successfully");
      } else {
        toast.error(getApiErrorMessage(error, "Failed to export recipe"));
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportTypeForClient = () => {
    setIsExportTypeModalOpen(false);
    setIsExportModalOpen(true);
  };

  const handleExportPdf = async (includeSop) => {
    if (!recipe?._id || isExportingPdf) return;

    try {
      setIsExportingPdf(true);

      const response = await recipeAPI.exportApplicationFormulaPdf(recipe._id, {
        includeSop,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const contentDisposition = response.headers?.["content-disposition"];
      const fileNameHeader = response.headers?.["x-file-name"];
      let filename = `${sanitizeFileName(recipe?.recipeCode || recipe?.recipeName || "recipe")}.pdf`;

      if (fileNameHeader) {
        filename = decodeURIComponent(fileNameHeader);
      } else
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
        if (filenameMatch?.[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/"/g, ""));
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsExportModalOpen(false);
      toast.success("Recipe PDF exported successfully");
    } catch (error) {
      console.error("Failed to export recipe PDF:", error);
      if (error?.message === "Network Error") {
        console.log("Download intercepted by download manager or network error occurred.");
        toast.success("Recipe PDF exported successfully");
      } else {
        toast.error(getApiErrorMessage(error, "Failed to export recipe"));
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenFinalizeModal = (targetRecipe) => {
    setRecipeToFinalize(targetRecipe || recipe);
    setIsFinalizeModalOpen(true);
  };

  const handleConfirmFinalize = async () => {
    const recipeId = recipeToFinalize?._id || recipe?._id;
    if (!recipeId) return;

    try {
      const finalizedRecipe = await updateRecipe({
        id: recipeId,
        data: { recipeStatus: RECIPE_STATUS.FINAL },
      });

      if (finalizedRecipe?._id) {
        setActiveRecipeId(finalizedRecipe._id);
        setEditableRecipe(flatMapIndependentDetails(finalizedRecipe));
        setIsEditMode(false);
      }
      setIsFinalizeModalOpen(false);
    } catch (err) {
      console.error("Failed to finalize recipe:", err);
    }
  };

  const handleFinalize = () => {
    handleOpenFinalizeModal(recipe);
  };
  const handleBack = () => {
    const returnTo = location.state?.returnTo;
    if (typeof returnTo === "string" && returnTo.trim()) {
      navigate(returnTo, { replace: true });
      return;
    }

    navigate("/application-lab/application-recipes", { replace: true });
  };

  const handleCreateVersion = () => {
    setIsCreateVersionModalOpen(true);
  };

  const handleConfirmCreateVersion = async () => {
    const recipeId = recipe?._id;
    if (!recipeId) return;

    try {
      // Helper to parse numbers safely for Zod (returns undefined instead of NaN/null)
      const parseNum = (val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      };

      // Build version payload from currently edited data
      const versionData = {};
      const basicFields = {
        name: editableRecipe.recipeName || editableRecipe.name,
        recipeName: editableRecipe.recipeName || editableRecipe.name,
        recipeType: editableRecipe.recipeType,
        recipeStatus: RECIPE_STATUS.IN_DEVELOPMENT,
        potentiality: parseNum(editableRecipe.potentiality),
        outputYield: parseNum(editableRecipe.outputYield),
        outputServingSize: parseNum(editableRecipe.outputServingSize),
      };

      // Only add non-undefined basic fields
      Object.entries(basicFields).forEach(([key, value]) => {
        if (value !== undefined) {
          versionData[key] = value;
        }
      });

      if (editableRecipe.isIndependentRecipe) {
        versionData.isIndependentRecipe = true;
        const tagsVal = editableRecipe.independentRecipeTags;
        versionData.independentDetails = {
          purpose: editableRecipe.independentRecipePurpose || null,
          projectName: editableRecipe.independentRecipeProjectName || null,
          objective: editableRecipe.independentRecipeObjective || null,
          objectiveDetails: editableRecipe.independentRecipeObjectiveDetails || null,
          raisedBy: editableRecipe.independentRecipeRaisedBy || null,
          raisedDate: editableRecipe.independentRecipeRaisedDate || null,
          projectCode: editableRecipe.independentRecipeProjectCode || null,
          applicationCategory: editableRecipe.independentRecipeApplicationCategory || null,
          applicationSubcategory: editableRecipe.independentRecipeApplicationSubcategory || null,
          applicationSubSubcategory: editableRecipe.independentRecipeApplicationSubSubcategory || null,
          tags: typeof tagsVal === "string"
            ? tagsVal.split(",").map(t => t.trim()).filter(Boolean)
            : (Array.isArray(tagsVal) ? tagsVal : []),
          targetCost: editableRecipe.independentRecipeTargetCost || null,
          benchmark: editableRecipe.independentRecipeBenchmark || null,
          link: editableRecipe.independentRecipeLink || null,
        };
      }

      // Include SOP & Analytics fields from the sopData state
      const sopFields = convertSOPDataToBackendFields(sopData, activeRecipeFormat);
      Object.assign(versionData, sopFields);

      if (Array.isArray(editableRecipe.ingredients)) {
        versionData.ingredients = editableRecipe.ingredients.map((item) => ({
          role: item.role || null,
          type: item.type || null,
          ingredientSourceType: item.ingredientSourceType,
          sourceId:
            typeof (item.sourceId || item.ingredient) === "object" && (item.sourceId || item.ingredient) !== null
              ? (item.sourceId || item.ingredient)._id || (item.sourceId || item.ingredient).id || null
              : (item.sourceId || item.ingredient),
          quantity: parseNum(item.quantity) ?? 0,
          bffRateAtCreation: parseNum(item.bffRateAtCreation),
          clientRateAtCreation: parseNum(item.clientRateAtCreation),
        }));
      }

      const createdVersionResponse = await createVersion({ id: recipeId, data: versionData });
      const createdVersion =
        createdVersionResponse?.data?.data ||
        createdVersionResponse?.data ||
        createdVersionResponse ||
        null;

      if (createdVersion?._id) {
        setActiveRecipeId(createdVersion._id);
        setEditableRecipe(flatMapIndependentDetails(createdVersion));
      }
      setIsCreateVersionModalOpen(false);
    } catch (err) {
      console.error("Failed to create version:", err);
    }
  };

  const handleVersionChange = (version) => {
    // Find the selected version from the versions list
    const selectedVersion = versions?.find(v => v.version === version);
    if (selectedVersion?._id) {
      setActiveRecipeId(selectedVersion._id);
    }
  };

  const handleOpenRecipeTypeModal = () => {
    setSelectedTargetRecipeType("");
    setChangeRecipeTypeError("");
    setIsChangeRecipeTypeModalOpen(true);
  };

  const handleConfirmRecipeTypeChange = async (overrideData = {}) => {
    if (!recipe?._id || !selectedTargetRecipeType) return;

    try {
      setChangeRecipeTypeError("");
      const updatedRecipe = await changeRecipeType({
        id: recipe._id,
        data: {
          recipeType: selectedTargetRecipeType,
          ...overrideData,
        },
      });

      if (updatedRecipe?._id) {
        setActiveRecipeId(updatedRecipe._id);
        setEditableRecipe(flatMapIndependentDetails(updatedRecipe));
        setSopData(
          buildSOPDataFromRecipe(updatedRecipe, String(updatedRecipe.recipeType || "").toLowerCase())
        );
      }

      setIsChangeRecipeTypeModalOpen(false);
      setSelectedTargetRecipeType("");
    } catch (error) {
      setChangeRecipeTypeError(
        error?.response?.data?.error || error?.message || "Failed to change recipe type"
      );
    }
  };

  const commonProps = {
    project: editableProject,
    statusSourceProject,
    recipe,
    activeTab,
    setActiveTab,
    currentVersion,
    setCurrentVersion: handleVersionChange,
    versions,
    searchQuery,
    setSearchQuery,
    formatDate,
    handleEdit,
    handleSave,
    handleCancel,
    handleRecipeChange,
    handleProjectChange,
    handleDownload,
    handleExportTypeInternal,
    handleExportTypeForClient,
    handleFinalize,
    handleOpenFinalizeModal,
    onSaveSpecificFields: handleSaveSpecificFields,
    handleBack,
    handleCreateVersion,
    handleIngredientsChange,
    handleSOPChange,
    tabs,
    isEditMode,
    isSaving,
    isCreatingVersion,
    sopData,
    recipeFormat: activeRecipeFormat,
    isLoading: isRecipeLoading || isProjectLoading || isLatestRecipeLoading,
    isFinalized,
    isTypeChangeEligible,
    onChangeRecipeType: handleOpenRecipeTypeModal,
    canExportRecipe,
    handlePrepareSample: () => setIsPrepareSampleModalOpen(true),
    handleSample: (vItem, currentRecipe) => {
      const targetId = vItem?._id || recipe?._id;
      const targetVersion = vItem?.version ?? currentVersion ?? 0;
      const r = currentRecipe || recipe;

      const versionIngredients =
        Array.isArray(vItem?.ingredients) && vItem.ingredients.length > 0
          ? vItem.ingredients
          : Array.isArray(r?.ingredients) && r.ingredients.length > 0
          ? r.ingredients
          : Array.isArray(editableRecipe?.ingredients) && editableRecipe.ingredients.length > 0
          ? editableRecipe.ingredients
          : [];

      const enrichedVItem = {
        ...vItem,
        ingredients: versionIngredients,
      };

      navigate(`/application-lab/application-recipes/sample/${targetId}/${targetVersion}`, {
        state: {
          recipe: {
            ...r,
            ingredients: versionIngredients,
          },
          vItem: enrichedVItem,
          version: targetVersion,
          project: fetchedProjectData,
        },
      });
    },
    handleViewDownloadHistory: () => setIsDownloadHistoryModalOpen(true),
  };

  if (commonProps.isLoading) {
    return (
      <section className="flex flex-col bg-transparent page-section-spacing md:px-0 md:flex-1 md:min-h-0 md:overflow-hidden">
        <RecipeViewSkeleton />
      </section>
    );
  }

  return (
    <section className="flex flex-col bg-transparent page-section-spacing md:px-0 md:flex-1 md:min-h-0">
      <div className="hidden md:flex flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
        <DesktopViewRecipe {...commonProps} />
      </div>
      <div className="flex md:hidden flex-1 w-full min-h-0">
        <MobileViewRecipe {...commonProps} />
      </div>
      
      {/* Save Changes Modal */}
      <SaveChangesModal
        open={isSaveModalOpen}
        onOpenChange={setIsSaveModalOpen}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        className="sm:max-w-125 py-16"
      />
      
      {/* Create Version Modal */}
      <CreateVersionModal
        open={isCreateVersionModalOpen}
        onOpenChange={setIsCreateVersionModalOpen}
        onConfirm={handleConfirmCreateVersion}
        isLoading={isCreatingVersion}
      />

      <ChangeRecipeTypeModal
        open={isChangeRecipeTypeModalOpen}
        onOpenChange={setIsChangeRecipeTypeModalOpen}
        currentRecipeType={recipe?.recipeType}
        selectedRecipeType={selectedTargetRecipeType}
        onSelectRecipeType={setSelectedTargetRecipeType}
        preview={recipeTypeChangePreview}
        isPreviewLoading={isRecipeTypeChangePreviewLoading}
        isSubmitting={isChangingRecipeType}
        onConfirm={handleConfirmRecipeTypeChange}
        error={changeRecipeTypeError}
      />

      <ExportRecipePdfModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onWithSop={() => handleExportPdf(true)}
        onWithoutSop={() => handleExportPdf(false)}
        isExporting={isExportingPdf}
      />

      <ExportTypeModal
        open={isExportTypeModalOpen}
        onOpenChange={setIsExportTypeModalOpen}
        onInternal={handleExportTypeInternal}
        onForClient={handleExportTypeForClient}
        isExporting={isExportingPdf}
      />

      <PrepareSampleModal
        open={isPrepareSampleModalOpen}
        onOpenChange={setIsPrepareSampleModalOpen}
        projectId={projectId}
        recipeId={recipe?._id}
        recipeCode={recipe?.recipeCode}
        projectMembers={projectMembers}
      />

      <DownloadHistoryModal
        open={isDownloadHistoryModalOpen}
        onOpenChange={setIsDownloadHistoryModalOpen}
        recipeId={recipe?._id}
        recipeName={recipe?.recipeName || recipe?.name}
      />

      <FinalizeRecipeModal
        open={isFinalizeModalOpen}
        onOpenChange={setIsFinalizeModalOpen}
        onConfirm={handleConfirmFinalize}
        isLoading={isSaving}
      />
    </section>
  );
}
