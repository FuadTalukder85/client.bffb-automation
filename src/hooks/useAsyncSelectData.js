import { useMemo } from "react";
import { useDebounce } from "./useDebounce";
import { useCategories, useSubcategories, useSubSubcategories, useTags } from "./useCategories";
import { useRecipes } from "./useRecipes";
import { useBFFProductCodes, useBFFProductCodesBySegment } from "./useBFFProductCodes";
import { usePackagingTypes } from "./usePackagingTypes";

const getPreferredProductCode = (item) =>
  item?.commercializedProductCode || item?.displayProductCode || item?.productCode || "";

const transformToSelectOptions = (items, valueKey = "_id", labelKey = "name") => {
  if (!Array.isArray(items)) {
    console.warn('⚠️ transformToSelectOptions: items is not an array', items);
    return [];
  }
  
  console.log('🔍 transformToSelectOptions - transforming:', {
    itemsCount: items.length,
    valueKey,
    labelKey,
    firstItem: items[0],
    timestamp: new Date().toISOString()
  });
  
  const result = items.map((item) => {
    let label = item[labelKey] || item.name || item.title || String(item[valueKey]);
    
    let searchText = String(label).toLowerCase();
    
    // Include productCode or recipeCode in search text if they exist
    if (item.productCode) searchText += " " + String(item.productCode).toLowerCase();
    if (item.recipeCode) searchText += " " + String(item.recipeCode).toLowerCase();

    return {
      value: item[valueKey],
      label: label,
      searchText: searchText,
    };
  });
  
  console.log('🔍 transformToSelectOptions - result:', {
    resultCount: result.length,
    firstFew: result.slice(0, 3),
    timestamp: new Date().toISOString()
  });
  
  return result;
};

export function useActiveCategories(searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useCategories({
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    return transformToSelectOptions(items);
  }, [data]);

  return { options, isLoading, error };
}

export function useSubCategoriesByCategory(categoryId, searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useSubcategories({
    category: categoryId || undefined,
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
    enabled: !!categoryId,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    if (!categoryId) return [];
    return transformToSelectOptions(items);
  }, [data, categoryId]);

  return { options, isLoading, error, data };
}

export function useSubSubCategoriesBySubCategory(subCategoryId, searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useSubSubcategories({
    subCategory: subCategoryId || undefined,
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
    enabled: !!subCategoryId,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    if (!subCategoryId) return [];
    return transformToSelectOptions(items);
  }, [data, subCategoryId]);

  return { options, isLoading, error, data };
}

export function useTagsBySubCategory(subCategoryId, searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useTags({
    subCategory: subCategoryId || undefined,
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
    enabled: true,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    return transformToSelectOptions(items, "_id", "name");
  }, [data]);

  return { options, isLoading, error, data };
}

export function useAllTags(searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useTags({
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    return transformToSelectOptions(items, "_id", "name");
  }, [data]);

  return { options, isLoading, error, data };
}

export function useActiveRecipes(searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useRecipes({
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
  });

  const options = useMemo(() => {
    const recipesArray = data?.data || [];
    if (!Array.isArray(recipesArray)) return [];
    return recipesArray.map((item) => ({
      value: item._id,
      label: item.name || item.recipeName || String(item._id),
      searchText: String((item.name || item.recipeName || "") + (item.recipeCode ? " " + item.recipeCode : "")).toLowerCase(),
      recipeCode: item.recipeCode,
      recipeData: item,
    }));
  }, [data]);

  return { options, isLoading, error, data };
}

export function useRecipeByCode(recipeCode) {
  const { data, isLoading, error } = useRecipes({
    searchTerm: recipeCode,
    isActive: "true",
    limit: 10,
  });

  const recipe = useMemo(() => {
    const recipesArray = data?.data || [];
    if (!Array.isArray(recipesArray)) return null;
    const trimmedCode = recipeCode?.trim();
    return recipesArray.find((r) => (r.recipeCode || "").toLowerCase() === trimmedCode?.toLowerCase()) || null;
  }, [data, recipeCode]);

  return { recipe, isLoading, error };
}

export function useBFFFlavors(searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  console.log("🔍 useBFFFlavors - called with:", {
    searchTerm,
    debouncedSearch,
    timestamp: new Date().toISOString()
  });
  
  const { data, isLoading, error } = useBFFProductCodesBySegment({
    segment: "flavours",
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    console.log("🔍 useBFFFlavors - options generated:", {
      itemsCount: items.length,
      firstFewItems: items.slice(0, 3),
      timestamp: new Date().toISOString()
    });
    return items.map((item) => ({
      value: item._id,
      label: item.productName || item.name || String(item._id),
      searchText: String((item.productName || item.name || "") + (getPreferredProductCode(item) ? " " + getPreferredProductCode(item) : "")).toLowerCase(),
    }));
  }, [data]);

  return { options, isLoading, error, data };
}

export function useBFFColors(searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useBFFProductCodesBySegment({
    segment: "colours",
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    return items.map((item) => ({
      value: item._id,
      label: item.productName || item.name || String(item._id),
      searchText: String((item.productName || item.name || "") + (getPreferredProductCode(item) ? " " + getPreferredProductCode(item) : "")).toLowerCase(),
    }));
  }, [data]);

  return { options, isLoading, error, data };
}

export function useBFFIngredients(searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useBFFProductCodesBySegment({
    segment: "ingredients",
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    return items.map((item) => ({
      value: item._id,
      label: item.productName || item.name || String(item._id),
      searchText: String((item.productName || item.name || "") + (getPreferredProductCode(item) ? " " + getPreferredProductCode(item) : "")).toLowerCase(),
    }));
  }, [data]);

  return { options, isLoading, error, data };
}

export function useAllBFFProductCodes(searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = useBFFProductCodes({
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 100,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    return items.map((item) => {
      const productName = item.productName || item.name || "";
      const productCode = getPreferredProductCode(item);
      const label = productCode ? `${productName} (${productCode})` : productName;
      return {
        value: item._id || productCode || productName,
        label,
        name: productName,
        productCode,
        cost: item.cost,
        searchText: String(`${productName} ${productCode}`).toLowerCase(),
      };
    });
  }, [data]);

  return { options, isLoading, error, data };
}

export function useActivePackagingTypes(searchTerm = "") {
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data, isLoading, error } = usePackagingTypes({
    searchTerm: debouncedSearch,
    isActive: "true",
    limit: 50,
  });

  const options = useMemo(() => {
    const items = data?.data || [];
    return transformToSelectOptions(items);
  }, [data]);

  return { options, isLoading, error };
}
