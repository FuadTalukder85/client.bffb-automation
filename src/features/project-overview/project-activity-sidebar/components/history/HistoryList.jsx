import React from 'react';
import { History, ChevronDown, ChevronRight } from 'lucide-react';
import HistoryItem from './HistoryItem';

const HistoryList = ({
    historyData,
    expandedDates,
    setExpandedDates,
    expandedChanges,
    setExpandedChanges,
    getUserDisplayName,
    groupHistoryByDate,
    getColorDisplayName,
    getFlavorDisplayName,
    getIngredientDisplayName,
    getCategoryDisplayName,
    getSubcategoryDisplayName,
    getSubsubcategoryDisplayName,
    getTagDisplayName
}) => {
    return (
        <div className="pl-3 lg:pl-3 xl:pl-4 2xl:pl-5 3xl:pl-6 pr-0.5 lg:pr-0.5 xl:pr-1 2xl:pr-1.5 3xl:pr-2">
            {Object.entries(groupHistoryByDate(historyData.data)).map(([dateLabel, items]) => (
                <div key={dateLabel}>

                    <div
                        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-2 lg:mb-2 xl:mb-3.5 2xl:mb-3.5 3xl:mb-4"
                    >
                        <div
                            className={`flex items-center gap-1.5 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 ${items.length > 1 ? 'cursor-pointer hover:bg-primary/5 p-0.5 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 rounded' : ''}`}
                            onClick={items.length > 1 ? () => setExpandedDates(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(dateLabel)) {
                                    newSet.delete(dateLabel);
                                } else {
                                    newSet.add(dateLabel);
                                }
                                return newSet;
                            }) : undefined}
                        >
                            {items.length > 1 && (
                                expandedDates.has(dateLabel) ? (
                                    <ChevronDown className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-gray-500" />
                                ) : (
                                    <ChevronRight className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-gray-500" />
                                )
                            )}
                            <h4 className="text-sm lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-foreground">{dateLabel}</h4>
                            <span className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground mt-1">
                                <History className="w-3 h-3 3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5 inline mr-1" />
                                {items.length} Changes
                            </span>
                        </div>
                    </div>

                    {(items.length === 1 || expandedDates.has(dateLabel)) && (
                        <div className="space-y-8 relative before:content-[''] before:absolute before:inset-y-0 before:left-[-16px] before:w-0.5 before:bg-border">
                            {items.map((change, index) => (
                                <HistoryItem
                                    key={change._id || `${dateLabel}-${index}`}
                                    change={change}
                                    index={index}
                                    dateLabel={dateLabel}
                                    expandedChanges={expandedChanges}
                                    setExpandedChanges={setExpandedChanges}
                                    getUserDisplayName={getUserDisplayName}
                                    getColorDisplayName={getColorDisplayName}
                                    getFlavorDisplayName={getFlavorDisplayName}
                                    getIngredientDisplayName={getIngredientDisplayName}
                                    getCategoryDisplayName={getCategoryDisplayName}
                                    getSubcategoryDisplayName={getSubcategoryDisplayName}
                                    getSubsubcategoryDisplayName={getSubsubcategoryDisplayName}
                                    getTagDisplayName={getTagDisplayName}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default HistoryList;
