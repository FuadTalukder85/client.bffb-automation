import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

const RECIPE_TYPES = {
  bakery: "Bakery",
  beverage: "Beverage",
  beveragePsd: "Beverage PSD",
  confectionary: "Confectionary",
};

const RECIPE_STATUSES = {
  final: "final",
  inDevelopment: "in-development",
};

const normalizeRecipe = (recipe = {}) => {
  const project = recipe.project || {};
  const category = recipe.category ?? project.category ?? null;
  const subCategory = recipe.subCategory ?? project.subCategory ?? null;
  const subSubCategory = recipe.subSubCategory ?? project.subSubCategory ?? null;
  const tags = Array.isArray(recipe.tags)
    ? recipe.tags
    : Array.isArray(project.tags)
      ? project.tags
      : [];

  return {
    ...recipe,
    name: recipe.name ?? recipe.recipeName ?? "",
    recipeName: recipe.recipeName ?? recipe.name ?? "",
    project: {
      ...project,
      masterProject: project.masterProject || {
        code: project.projectCode ?? project.code ?? null,
        title: project.name ?? project.title ?? null,
      },
    },
    category,
    subCategory,
    subSubCategory,
    tags,
  };
};

const extractListPayload = (responseData) => {
  const candidate = responseData?.data ?? responseData ?? {};

  if (Array.isArray(candidate)) {
    return {
      items: candidate,
      pagination: DEFAULT_PAGINATION,
    };
  }

  const nestedData = candidate?.data;
  const items =
    (Array.isArray(nestedData) && nestedData) ||
    (Array.isArray(candidate?.items) && candidate.items) ||
    [];

  return {
    items,
    pagination: candidate?.pagination || DEFAULT_PAGINATION,
  };
};

const prepareRecipeParams = ({
  searchTerm = "",
  project = "",
  category = "",
  subCategory = "",
  subSubCategory = "",
  recipeType = "all",
  recipeStatus = "all",
  isActive = "all",
  page,
  limit,
  sortBy = "",
  sortOrder = "",
}) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  if (project && project !== "all") {
    params.project = project;
  }

  if (category && category !== "all") {
    params.category = category;
  }

  if (subCategory && subCategory !== "all") {
    params.subCategory = subCategory;
  }

  if (subSubCategory && subSubCategory !== "all") {
    params.subSubCategory = subSubCategory;
  }

  if (recipeType && recipeType !== "all") {
    params.recipeType = RECIPE_TYPES[recipeType] || recipeType;
  }

  if (recipeStatus && recipeStatus !== "all") {
    params.recipeStatus = RECIPE_STATUSES[recipeStatus] || recipeStatus;
  }

  if (isActive && isActive !== "all") {
    params.isActive = isActive;
  }

  if (sortBy) {
    params.sortBy = sortBy;
  }

  if (sortOrder) {
    params.sortOrder = sortOrder;
  }

  return params;
};

export function useRecipes(filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit, enabled = true, ...rest } = filters;
  const apiParams = prepareRecipeParams({ ...rest, page, limit });

  return useQuery({
    queryKey: queryKeys.recipes.list(apiParams),
    queryFn: ({ signal }) =>
      api.get("/recipes", { params: apiParams, signal }).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const { items, pagination } = extractListPayload(responseData);
      return {
        data: items.map(normalizeRecipe),
        pagination,
      };
    },
  });
}

export function useFinalRecipes(filters = {}) {
  return useRecipes({
    ...filters,
    recipeStatus: "final",
  });
}

export function useInDevelopmentRecipes(filters = {}) {
  return useRecipes({
    ...filters,
    recipeStatus: "in-development",
  });
}

/**
 * Hook to fetch master projects enriched with latest recipe create date
 * Calls server route: GET /recipes/projects-with-latest-recipe-date
 * Accepted filters: searchTerm, status, isActive, isFeasible, page, limit
 */
export function useProjectsWithLatestRecipeDate(filters = {}) {
  const {
    searchTerm = "",
    status = "all",
    statusFilter = "running",
    isActive = "all",
    isFeasible = "all",
    page = DEFAULT_PAGINATION.page,
    limit = DEFAULT_PAGINATION.limit,
    enabled = true,
  } = filters;

  const params = { page, limit };
  const trimmed = (searchTerm || "").trim();
  if (trimmed.length) params.search = trimmed;
  if (status && status !== "all") params.status = status;
  if (statusFilter && statusFilter !== "running") params.statusFilter = statusFilter;
  if (isActive !== undefined && isActive !== "all") params.isActive = String(isActive);
  if (isFeasible !== undefined && isFeasible !== "all") params.isFeasible = String(isFeasible);

  return useQuery({
    queryKey: queryKeys.recipes.projectsWithLatestRecipeDate(params),
    queryFn: ({ signal }) =>
      api.get('/projects/project-list-with-latest-recipe', { params, signal }).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || [];

      return {
        data: Array.isArray(items) ? items : [],
        pagination: result.pagination || { page, limit, total: 0, totalPages: 1 },
      };
    },
  });
}

/**
 * Hook to fetch a single recipe by ID
 */
export function useRecipeById(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(id),
    queryFn: ({ signal }) =>
      api.get(`/recipes/${id}`, { signal }).then((res) => res.data),
    enabled: !!id,
    select: (responseData) => {
      return responseData?.data || responseData || null;
    },
    ...options,
  });
}

/**
 * Hook to fetch all versions of a recipe
 */
export function useRecipeVersions(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.recipes.versions(id),
    queryFn: ({ signal }) =>
      api.get(`/recipes/${id}/versions`, { signal }).then((res) => res.data),
    enabled: !!id,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || result;
      return Array.isArray(items) ? items : [];
    },
    ...options,
  });
}

/**
 * Hook to fetch recipe clone options (all recipes including versions)
 */
export function useRecipeCloneOptions(searchTerm = "", options = {}) {
  const params = {};
  const trimmed = String(searchTerm || "").trim();

  if (trimmed.length > 0) {
    params.search = trimmed;
  }

  return useQuery({
    queryKey: queryKeys.recipes.cloneOptions(params),
    queryFn: ({ signal }) =>
      api.get('/recipes/clone-options', { params, signal }).then((res) => res.data),
    select: (responseData) => {
      const result = responseData?.data || responseData || [];
      return Array.isArray(result) ? result : [];
    },
    ...options,
  });
}

/**
 * Hook to preview field changes for recipe type transition
 */
export function useRecipeTypeChangePreview(id, targetRecipeType, options = {}) {
  return useQuery({
    queryKey: queryKeys.recipes.typeChangePreview(id, targetRecipeType),
    queryFn: ({ signal }) =>
      api
        .get(`/recipes/${id}/type-change-preview`, {
          params: { targetRecipeType },
          signal,
        })
        .then((res) => res.data),
    enabled: Boolean(id && targetRecipeType),
    select: (responseData) => responseData?.data || responseData || null,
    ...options,
  });
}
