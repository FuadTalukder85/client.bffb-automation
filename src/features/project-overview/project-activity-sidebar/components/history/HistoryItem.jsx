import React from 'react';
import { User, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const HistoryItem = ({
    change,
    index,
    dateLabel,
    expandedChanges,
    setExpandedChanges,
    getUserDisplayName,
    getColorDisplayName,
    getFlavorDisplayName,
    getIngredientDisplayName,
    getCategoryDisplayName,
    getSubcategoryDisplayName,
    getSubsubcategoryDisplayName,
    getTagDisplayName
}) => {
    const changeKey = change._id || `${dateLabel}-${change.timestamp}-${index}`;
    const filteredChanges = change.changes?.filter(fieldChange => {
        return fieldChange.newValue !== null && fieldChange.newValue !== undefined && fieldChange.newValue !== '';
    }) || [];

    const isChangeExpanded = expandedChanges.has(changeKey);

    const formatFieldPath = (fieldPath) => {
        if (!fieldPath || typeof fieldPath !== 'string') return "";
        const lastPart = fieldPath.split('.').pop();
        return lastPart
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    const formatValue = (value) => {
        if (value === null || value === undefined) return "empty";
        if (typeof value === 'object') {
            if (value.name) return value.name;
            if (value.title) return value.title;
            if (Array.isArray(value)) return `[${value.length} items]`;
            return "configured";
        }
        if (typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                return format(date, 'MMM d, yyyy');
            }
        }
        return value;
    };

    const renderChangeDescription = (fieldChange) => {
        const { field, oldValue, newValue } = fieldChange;

        // Special cases for specific actions
        if (field === 'common.isFeasible') {
            if (oldValue === true && newValue === false) return 'marked the project as "Not Feasible"';
            if (oldValue === false && newValue === true) return 'marked the project as "Feasible"';
        }
        if (field === 'masterProject.isActive') {
            if (oldValue === true && newValue === false) return 'archived the project';
            if (oldValue === false && newValue === true) return 'unarchived the project';
        }
        if (field === 'common.sentToPD' && oldValue === false && newValue === true) return 'sent the project to PD';
        if (field === 'common.sentToApplication' && oldValue === false && newValue === true) return 'sent the project to AL';
        if (field === 'common.sentToSensory' && oldValue === false && newValue === true) return 'sent the project to Sensory';
        if (field === 'common.sentToSchedule' && oldValue === false && newValue === true) return 'sent the project to Schedule';
        if (field === 'masterProject.status') {
            return `marked the project as "${newValue}"`;
        }

        // Special handling for boolean fields displayed as Yes/No
        if (field === 'sensoryLab.approval') {
            const oldLabel = oldValue ? 'Yes' : 'No';
            const newLabel = newValue ? 'Yes' : 'No';
            return `changed Approval for Sensory from "${oldLabel}" to "${newLabel}"`;
        }
        if (field === 'common.selectedForDevelopment') {
            const oldLabel = oldValue ? 'Yes' : 'No';
            const newLabel = newValue ? 'Yes' : 'No';
            return `changed Selected For Development from "${oldLabel}" to "${newLabel}"`;
        }
        if (field === 'businessDevelopment.selectedForPromotion') {
            const oldLabel = oldValue ? 'Yes' : 'No';
            const newLabel = newValue ? 'Yes' : 'No';
            return `changed Selected For Promotion from "${oldLabel}" to "${newLabel}"`;
        }

        // Special handling for brief fields
        if (field.endsWith('.brief')) {
            const section = field.split('.')[0];
            let sectionName = '';
            if (section === 'masterProject') sectionName = 'Master';
            else if (section === 'productDevelopment') sectionName = 'PD';
            else if (section === 'applicationLab') sectionName = 'AL';
            else sectionName = section.charAt(0).toUpperCase() + section.slice(1);

            const isOldEmpty = oldValue == null || oldValue === '' || oldValue === undefined;
            const isNewEmpty = newValue == null || newValue === '' || newValue === undefined;

            if (isOldEmpty && !isNewEmpty) {
                return `added ${sectionName} Brief: "${newValue}"`;
            }
            if (!isOldEmpty && isNewEmpty) {
                return `removed ${sectionName} Brief: "${oldValue}"`;
            }
            if (!isOldEmpty && !isNewEmpty) {
                return `replaced ${sectionName} Brief: "${oldValue}" with "${newValue}"`;
            }
        }

        // Default rendering
        const fieldName = formatFieldPath(field);
        const isAssignedToField = field === 'masterProject.assignedTo';

        const formatValueWithField = (value, field) => {
            if (isAssignedToField) return getUserDisplayName(value);
            if (Array.isArray(value)) {
                if (field === 'common.color') {
                    return value.map(id => getColorDisplayName(id)).join(', ');
                }
                if (field === 'common.flavorProfile') {
                    return value.map(id => getFlavorDisplayName(id)).join(', ');
                }
                if (field === 'common.ingredients') {
                    return value.map(id => getIngredientDisplayName(id)).join(', ');
                }
                if (field === 'applicationLab.tags') {
                    return value.map(id => getTagDisplayName(id)).join(', ');
                }
                // Add for categories if needed
                if (field.includes('category')) {
                    return value.map(id => getCategoryDisplayName(id)).join(', ');
                }
                if (field.includes('subcategory')) {
                    return value.map(id => getSubcategoryDisplayName(id)).join(', ');
                }
                if (field.includes('subSubcategory')) {
                    return value.map(id => getSubsubcategoryDisplayName(id)).join(', ');
                }
                return `[${value.length} items]`;
            }
            // Handle single ID fields
            if (field.includes('.category')) {
                return getCategoryDisplayName(value);
            }
            if (field.includes('.subcategory')) {
                return getSubcategoryDisplayName(value);
            }
            if (field.includes('.subSubcategory')) {
                return getSubsubcategoryDisplayName(value);
            }
            return formatValue(value);
        };

        const oldVal = formatValueWithField(oldValue, field);
        const newVal = formatValueWithField(newValue, field);

        const isOldEmpty = oldVal === "empty" || oldVal === "" || oldVal === null || oldVal === undefined;
        const isNewEmpty = newVal === "empty" || newVal === "" || newVal === null || newVal === undefined;

        if (isOldEmpty && !isNewEmpty) {
            return (
                <span>
                    added <span className="font-medium text-foreground">{fieldName}</span>: <span className="italic text-muted-foreground">"{newVal}"</span>
                </span>
            );
        }
        if (!isOldEmpty && isNewEmpty) {
            return (
                <span>
                    removed <span className="font-medium text-foreground">{fieldName}</span>: <span className="italic text-muted-foreground">"{oldVal}"</span>
                </span>
            );
        }
        return (
            <span>
                replaced <span className="font-medium text-foreground">{fieldName}</span>: <span className="italic text-muted-foreground">"{oldVal}"</span> with <span className="italic text-muted-foreground">"{newVal}"</span>
            </span>
        );
    };

    return (
        <div className="relative">
            {/* Time Dot */}
            <div className="absolute -left-[21px] top-1 w-3 h-3 3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5 rounded-full bg-primary border-2 border-background" />

            {/* Time */}
            <div className="mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground">
                {format(new Date(change.timestamp), 'h:mm a')}
            </div>

            {/* User & Changes Block */}
            <div className="p-1.5 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2">
                    <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
                        <div className="flex items-center justify-center 3xl:w-6 2xl:w-4.5 xl:w-4.5 lg:w-3.5 w-3 3xl:h-6 2xl:h-4.5 xl:h-4.5 lg:h-3.5 h-3 overflow-hidden rounded-full bg-muted">
                            <User className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-semibold text-foreground">
                            {getUserDisplayName(change.performedBy)}
                        </span>
                    </div>
                    {filteredChanges.length > 1 && (
                        <button
                            className="p-1 rounded-full hover:bg-primary/5"
                            onClick={() => setExpandedChanges(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(changeKey)) {
                                    newSet.delete(changeKey);
                                } else {
                                    newSet.add(changeKey);
                                }
                                return newSet;
                            })}
                        >
                            {isChangeExpanded ? (
                                <ChevronDown className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-muted-foreground" />
                            )}
                        </button>
                    )}
                </div>

                <div className="pl-4 lg:pl-4.5 xl:pl-5.5 2xl:pl-6.5 3xl:pl-8 space-y-3">
                    {filteredChanges.length === 1 ? (
                        <div className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm leading-relaxed">
                            {renderChangeDescription(filteredChanges[0])}
                        </div>
                    ) : isChangeExpanded ? (
                        filteredChanges.map((fieldChange, changeIndex) => (
                            <div key={changeIndex} className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm leading-relaxed">
                                {renderChangeDescription(fieldChange)}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm leading-relaxed text-muted-foreground">
                            Modified {filteredChanges.length} fields
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryItem;
