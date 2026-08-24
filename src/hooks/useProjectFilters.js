import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useMemo } from "react";

/**
 * Hook to fetch all active categories for filter dropdowns
 */
export function useCategoryFilters(enabled = true) {
  return useQuery({
    queryKey: queryKeys.categories.list({ isActive: "true", limit: 500 }),
    queryFn: ({ signal }) =>
      api.get("/categories", { params: { isActive: "true", limit: 500 }, signal }).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || [];
      return items.map((cat) => ({
        label: cat.name,
        value: cat._id,
      }));
    },
  });
}

/**
 * Hook to fetch subcategories filtered by category
 */
export function useSubcategoryFilters(categoryId, enabled = true) {
  return useQuery({
    queryKey: queryKeys.subcategories.list({ category: categoryId, isActive: "true", limit: 500 }),
    queryFn: ({ signal }) => {
      const params = { isActive: "true", limit: 500 };
      if (categoryId) params.category = categoryId;
      return api.get("/subcategories", { params, signal }).then((res) => res.data);
    },
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || [];
      return items.map((sub) => ({
        label: sub.name,
        value: sub._id,
        categoryId: sub.category?._id || sub.category,
      }));
    },
  });
}

/**
 * Hook to fetch subsubcategories filtered by category and subcategory
 */
export function useSubSubcategoryFilters(categoryId, subcategoryId, enabled = true) {
  return useQuery({
    queryKey: queryKeys.subsubcategories.list({ category: categoryId, subCategory: subcategoryId, isActive: "true", limit: 500 }),
    queryFn: ({ signal }) => {
      const params = { isActive: "true", limit: 500 };
      if (categoryId) params.category = categoryId;
      if (subcategoryId) params.subCategory = subcategoryId;
      return api.get("/subsubcategories", { params, signal }).then((res) => res.data);
    },
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || [];
      return items.map((ssc) => ({
        label: ssc.name,
        value: ssc._id,
        categoryId: ssc.category?._id || ssc.category,
        subcategoryId: ssc.subCategory?._id || ssc.subCategory,
      }));
    },
  });
}

/**
 * Hook to fetch all active users for creator filter dropdowns
 */
export function useUserFilters(enabled = true) {
  return useQuery({
    queryKey: ["users", "filter-list"],
    queryFn: ({ signal }) =>
      api.get("/user", { params: { isActive: "true", limit: 500 }, signal }).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      const items = result.data || result.items || [];
      return items.map((user) => ({
        label: user.name || user.email || user.firstName,
        value: user._id,
      }));
    },
  });
}

/**
 * Combined hook that provides all filter options for project list pages.
 * If `filterOptions` is provided (from the main API response), use it directly
 * instead of making separate API calls.
 */
export function useProjectFilterOptions(selectedCategory, selectedSubcategory, filterOptions) {
  // Always call hooks (React rules), but skip the network calls when
  // filterOptions are already provided by the main API response.
  const fetchEnabled = !filterOptions;
  const { data: fetchedCategories = [], isLoading: isLoadingCategories } = useCategoryFilters(fetchEnabled);
  const { data: fetchedAllSubcategories = [], isLoading: isLoadingSubcategories } = useSubcategoryFilters(selectedCategory, fetchEnabled);
  const { data: fetchedAllSubSubcategories = [], isLoading: isLoadingSubSubcategories } = useSubSubcategoryFilters(selectedCategory, selectedSubcategory, fetchEnabled);
  const { data: fetchedUsers = [], isLoading: isLoadingUsers } = useUserFilters(fetchEnabled);

  // Use server-provided filterOptions if available, otherwise use fetched data
  const allSubcategories = filterOptions?.subcategories || fetchedAllSubcategories;
  const allSubSubcategories = filterOptions?.subSubcategories || fetchedAllSubSubcategories;

  const subcategories = useMemo(() => {
    if (!selectedCategory) return allSubcategories;
    return allSubcategories.filter((sub) => sub.categoryId === selectedCategory);
  }, [allSubcategories, selectedCategory]);

  const subSubcategories = useMemo(() => {
    if (!selectedSubcategory) return allSubSubcategories;
    return allSubSubcategories.filter((ssc) => ssc.subcategoryId === selectedSubcategory);
  }, [allSubSubcategories, selectedSubcategory]);

  const isLoading = filterOptions
    ? false
    : isLoadingCategories || isLoadingSubcategories || isLoadingSubSubcategories || isLoadingUsers;

  return {
    categories: filterOptions?.categories || fetchedCategories,
    subcategories,
    subSubcategories,
    users: filterOptions?.users || fetchedUsers,
    isLoading,
  };
}
