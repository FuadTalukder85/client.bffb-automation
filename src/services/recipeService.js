import api from "@/lib/api";

// Recipe API functions
export const recipeAPI = {
  // Get all recipes with pagination and filters
  getRecipes: async (params = {}, config = {}) => {
    const response = await api.get('/recipes', { ...config, params });
    return response.data;
  },

  // Get recipe by ID
  getRecipeById: async (id, config = {}) => {
    const response = await api.get(`/recipes/${id}`, config);
    return response.data;
  },

  // Create new recipe
  createRecipe: async (recipeData) => {
    const response = await api.post('/recipes', recipeData);
    return response.data;
  },

  // Update recipe
  updateRecipe: async (id, recipeData) => {
    const response = await api.patch(`/recipes/${id}`, recipeData);
    return response.data;
  },

  // Delete recipe
  deleteRecipe: async (id) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },

  // Archive recipe
  archiveRecipe: async (id) => {
    const response = await api.delete(`/recipes/${id}/archive`);
    return response.data;
  },

  // Restore recipe
  restoreRecipe: async (id) => {
    const response = await api.post(`/recipes/${id}/restore`);
    return response.data;
  },

  // Get archived recipes
  getArchivedRecipes: async (params = {}, config = {}) => {
    const response = await api.get('/recipes/archived', { ...config, params });
    return response.data;
  },

  // Get recipes by project
  getRecipesByProject: async (projectId, params = {}, config = {}) => {
    const response = await api.get(`/recipes/project/${projectId}`, { ...config, params });
    return response.data;
  },

  // Get recipes by category
  getRecipesByCategory: async (categoryId, params = {}, config = {}) => {
    const response = await api.get(`/recipes/category/${categoryId}`, { ...config, params });
    return response.data;
  },

  // Get recipe versions
  getRecipeVersions: async (id, config = {}) => {
    const response = await api.get(`/recipes/${id}/versions`, config);
    return response.data;
  },

  // Export application formula PDF for a specific recipe
  exportApplicationFormulaPdf: async (id, { includeSop = true, isInternal = false, ...config } = {}) => {
    const response = await api.get(`/recipes/${id}/export-application-formula`, {
      ...config,
      params: {
        ...(config?.params || {}),
        includeSop,
        isInternal,
      },
      responseType: "blob",
    });
    return response;
  },

  // Create a new recipe version
  createRecipeVersion: async (id, data = {}) => {
    const response = await api.post(`/recipes/${id}/versions`, data);
    return response.data;
  },

  // Get master projects enriched with latest recipe createdAt
  // Server route: GET /projects/project-list-with-latest-recipe
  getProjectsWithLatestRecipeDate: async (params = {}, config = {}) => {
    const response = await api.get('/projects/project-list-with-latest-recipe', { ...config, params });
    return response.data;
  },
};

// Category API functions
export const categoryAPI = {
  // Get all categories with pagination and filters
  getCategories: async (params = {}, config = {}) => {
    const response = await api.get('/categories', { ...config, params });
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id, config = {}) => {
    const response = await api.get(`/categories/${id}`, config);
    return response.data;
  },

  // Create new category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// SubCategory API functions
export const subCategoryAPI = {
  // Get all subcategories with pagination and filters
  getSubCategories: async (params = {}, config = {}) => {
    const response = await api.get('/subcategories', { ...config, params });
    return response.data;
  },

  // Get subcategory by ID
  getSubCategoryById: async (id, config = {}) => {
    const response = await api.get(`/subcategories/${id}`, config);
    return response.data;
  },

  // Create new subcategory
  createSubCategory: async (subCategoryData) => {
    const response = await api.post('/subcategories', subCategoryData);
    return response.data;
  },

  // Update subcategory
  updateSubCategory: async (id, subCategoryData) => {
    const response = await api.patch(`/subcategories/${id}`, subCategoryData);
    return response.data;
  },

  // Delete subcategory
  deleteSubCategory: async (id) => {
    const response = await api.delete(`/subcategories/${id}`);
    return response.data;
  },

  // Get subcategories by category
  getSubCategoriesByCategory: async (categoryId, params = {}, config = {}) => {
    const response = await api.get(`/subcategories/category/${categoryId}`, { ...config, params });
    return response.data;
  },
};

// SubSubCategory API functions
export const subSubCategoryAPI = {
  // Get all subsubcategories with pagination and filters
  getSubSubCategories: async (params = {}, config = {}) => {
    const response = await api.get('/subsubcategories', { ...config, params });
    return response.data;
  },

  // Get subsubcategory by ID
  getSubSubCategoryById: async (id, config = {}) => {
    const response = await api.get(`/subsubcategories/${id}`, config);
    return response.data;
  },

  // Create new subsubcategory
  createSubSubCategory: async (subSubCategoryData) => {
    const response = await api.post('/subsubcategories', subSubCategoryData);
    return response.data;
  },

  // Update subsubcategory
  updateSubSubCategory: async (id, subSubCategoryData) => {
    const response = await api.patch(`/subsubcategories/${id}`, subSubCategoryData);
    return response.data;
  },

  // Delete subsubcategory
  deleteSubSubCategory: async (id) => {
    const response = await api.delete(`/subsubcategories/${id}`);
    return response.data;
  },

  // Get subsubcategories by category
  getSubSubCategoriesByCategory: async (categoryId, params = {}, config = {}) => {
    const response = await api.get(`/subsubcategories/category/${categoryId}`, { ...config, params });
    return response.data;
  },

  // Get subsubcategories by subcategory
  getSubSubCategoriesBySubCategory: async (subCategoryId, params = {}, config = {}) => {
    const response = await api.get(`/subsubcategories/subcategory/${subCategoryId}`, { ...config, params });
    return response.data;
  },
};