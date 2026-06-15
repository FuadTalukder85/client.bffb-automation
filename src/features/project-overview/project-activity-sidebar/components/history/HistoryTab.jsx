import React, { useState, useEffect, useMemo } from 'react';
import { History, X } from 'lucide-react';
import { useProjectHistory } from "@/hooks/useProjectHistory";
import { useUsers } from "@/hooks/useUsers";
import { useBFFColors, useBFFFlavors, useBFFIngredients, useActiveCategories } from "@/hooks/useAsyncSelectData";
import { useSubcategories, useSubSubcategories, useTags } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { format, isToday, isYesterday } from "date-fns";

import HistoryList from './HistoryList';

const HistoryTab = ({ projectId, selectedFields = [], onClearField, view = null }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [expandedDates, setExpandedDates] = useState(new Set());
    const [expandedChanges, setExpandedChanges] = useState(new Set());
    
    // Data fetching
    const { data: historyData, isLoading: isHistoryLoading, error: historyError } = useProjectHistory(projectId, {
        fieldPaths: selectedFields,
        view,
        page: currentPage,
        limit: itemsPerPage
    });
    
    const { data: allUsers = [] } = useUsers({});

    // Fetch options for display names
    const { options: colorOptions } = useBFFColors("");
    const { options: flavorOptions } = useBFFFlavors("");
    const { options: ingredientOptions } = useBFFIngredients("");
    const { options: categoryOptions } = useActiveCategories("");
    const { data: subcategoryData } = useSubcategories({ isActive: "true", limit: 1000 });
    const { data: subsubcategoryData } = useSubSubcategories({ isActive: "true", limit: 1000 });
    const { data: tagData } = useTags({ isActive: "true", limit: 1000 });

    // Create maps for ID to name
    const colorMap = useMemo(() => new Map(colorOptions.map(opt => [opt.value, opt.label])), [colorOptions]);
    const flavorMap = useMemo(() => new Map(flavorOptions.map(opt => [opt.value, opt.label])), [flavorOptions]);
    const ingredientMap = useMemo(() => new Map(ingredientOptions.map(opt => [opt.value, opt.label])), [ingredientOptions]);
    const categoryMap = useMemo(() => new Map(categoryOptions.map(opt => [opt.value, opt.label])), [categoryOptions]);
    const subcategoryMap = useMemo(() => {
        const items = subcategoryData?.data || [];
        return new Map(items.map(item => [item._id, item.name]));
    }, [subcategoryData]);
    const subsubcategoryMap = useMemo(() => {
        const items = subsubcategoryData?.data || [];
        return new Map(items.map(item => [item._id, item.name]));
    }, [subsubcategoryData]);
    const tagMap = useMemo(() => {
        const items = tagData?.data || [];
        return new Map(items.map(item => [item._id, item.name]));
    }, [tagData]);

    const getColorDisplayName = (id) => colorMap.get(id) || id;
    const getFlavorDisplayName = (id) => flavorMap.get(id) || id;
    const getIngredientDisplayName = (id) => ingredientMap.get(id) || id;
    const getCategoryDisplayName = (id) => categoryMap.get(id) || id;
    const getSubcategoryDisplayName = (id) => subcategoryMap.get(id) || id;
    const getSubsubcategoryDisplayName = (id) => subsubcategoryMap.get(id) || id;
    const getTagDisplayName = (id) => tagMap.get(id) || id;

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedFields, itemsPerPage]);

    // Grouping Logic
    const groupHistoryByDate = (history) => {
        if (!history) return {};
        const groups = {};
        history.forEach(item => {
            const date = new Date(item.timestamp);
            let dateLabel = format(date, 'MMMM d, yyyy');
            if (isToday(date)) dateLabel = 'Today';
            if (isYesterday(date)) dateLabel = 'Yesterday';

            if (!groups[dateLabel]) {
                groups[dateLabel] = [];
            }
            groups[dateLabel].push(item);
        });
        return groups;
    };

    // Auto-expand logic
    useEffect(() => {
        if (historyData?.data) {
            const dates = Object.keys(groupHistoryByDate(historyData.data));
            setExpandedDates(new Set(dates));

            const changeKeys = new Set();
            Object.entries(groupHistoryByDate(historyData.data)).forEach(([dateLabel, items]) => {
                items.forEach((change, index) => {
                    const key = change._id || `${dateLabel}-${change.timestamp}-${index}`;
                    changeKeys.add(key);
                });
            });
            setExpandedChanges(changeKeys);
        }
    }, [historyData]);

    // Helpers
    const formatFieldPath = (fieldPath) => {
        if (!fieldPath || typeof fieldPath !== 'string') {
            return "";
        }
        const lastPart = fieldPath.split('.').pop();
        const result = lastPart
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
        return result;
    };

    const getUserDisplayName = (userData) => {
        if (!userData) return "Unknown User";
        if (typeof userData === 'object') {
            if (userData.name) return userData.name;
            if (userData.firstName || userData.lastName) {
                return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            }
            return "Unknown User";
        }
        if (typeof userData === 'string') {
            const user = allUsers.find(u => u._id === userData || u.id === userData);
            if (user) {
                return `${user.firstName || user.name || "Unknown"} ${user.lastName || ""}`.trim();
            }
            return "Unknown User";
        }
        return "Unknown User";
    };

    return (
        <div className="flex flex-col h-full px-2 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 pt-2 lg:pt-2 xl:pt-2.5 2xl:pt-3 3xl:pt-4">
            {selectedFields && selectedFields.length > 0 && (
                <div className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 mb-2 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4 border rounded-lg bg-primary/20 border-primary/20 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-nav-highlight">
                                <strong>Filtering by fields:</strong>
                            </p>
                             <div className="flex flex-wrap gap-1 mt-1">
                                 {selectedFields.map((field, index) => {
                                     return (
                                         <span key={field} className="inline-block px-2 lg:px-0.5 xl:px-1 2xl:px-1.5 3xl:px-2 py-1 lg:py-[2px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs rounded bg-primary/15 text-nav-highlight">
                                             {formatFieldPath(field)}
                                         </span>
                                     );
                                 })}
                             </div>
                        </div>
                        <button
                            onClick={onClearField}
                            className="p-1 ml-2 transition-colors text-primary hover:text-primary/80"
                            title="Clear field filter"
                        >
                            <X className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isHistoryLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-3 border rounded-lg border-border">
                                <Skeleton className="w-3/4 h-4 mb-2" />
                                <Skeleton className="w-1/2 h-3 mb-1" />
                                <Skeleton className="w-2/3 h-3" />
                            </div>
                        ))}
                    </div>
                ) : historyError ? (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-center flex-1 py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 text-center">
                            <div>
                                <History className="w-12 h-12 lg:w-8 xl:w-9 2xl:w-11 3xl:w-12 lg:h-8 xl:h-9 2xl:h-11 3xl:h-12 mx-auto mb-2 text-red-500/50" />
                                <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-red-500">Access Denied</p>
                                <p className="mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground">
                                    {historyError?.response?.data?.message || historyError?.message || "You don't have permission to view audit history"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : historyData?.data?.length > 0 ? (
                    <HistoryList 
                        historyData={historyData}
                        expandedDates={expandedDates}
                        setExpandedDates={setExpandedDates}
                        expandedChanges={expandedChanges}
                        setExpandedChanges={setExpandedChanges}
                        getUserDisplayName={getUserDisplayName}
                        groupHistoryByDate={groupHistoryByDate}
                        getColorDisplayName={getColorDisplayName}
                        getFlavorDisplayName={getFlavorDisplayName}
                        getIngredientDisplayName={getIngredientDisplayName}
                        getCategoryDisplayName={getCategoryDisplayName}
                        getSubcategoryDisplayName={getSubcategoryDisplayName}
                        getSubsubcategoryDisplayName={getSubsubcategoryDisplayName}
                        getTagDisplayName={getTagDisplayName}
                    />
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-center flex-1 py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 text-center text-muted-foreground">
                            <div>
                                <History className="w-12 h-12 lg:w-8 xl:w-9 2xl:w-11 3xl:w-12 lg:h-8 xl:h-9 2xl:h-11 3xl:h-12 mx-auto mb-2 text-muted-foreground/50" />
                         <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
                             {selectedFields && selectedFields.length > 0 ? "No changes found for the selected fields" : "No activity history"}
                         </p>
                         <p className="mt-1 text-xs text-lighter-text">
                             {selectedFields && selectedFields.length > 0 ? "Try selecting different fields" : "Project changes will appear here"}
                         </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center p-2 border-t border-border shrink-0">
                <Pagination
                    className="lg:relative! lg:justify-center! lg:right-auto! lg:bottom-auto! 2xl:bottom-auto! 3xl:bottom-auto!"
                    currentPage={currentPage}
                    totalPages={historyData?.pagination?.totalPages || 1}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </div>
    );
};

export default HistoryTab;
