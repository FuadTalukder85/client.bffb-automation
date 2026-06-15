import React from 'react';
import { User, ChevronDown, ChevronRight, History } from 'lucide-react';
import { format } from 'date-fns';

const ActivityHistoryItem = ({
    change,
    index,
    dateLabel,
    expandedChanges,
    setExpandedChanges,
    getUserDisplayName,
    renderChangeDescription
}) => {
    const changeKey = change._id || `${dateLabel}-${change.timestamp}-${index}`;
    const filteredChanges = change.changes?.filter(fieldChange => {
        return fieldChange.newValue !== null && fieldChange.newValue !== undefined && fieldChange.newValue !== '';
    }) || [];
    const isChangeExpanded = expandedChanges.has(changeKey);

    return (
        <div className="relative">
            {/* Time Dot */}
            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />

            {/* Time */}
            <div className="text-sm font-bold text-foreground mb-2">
                {format(new Date(change.timestamp), 'h:mm a')}
            </div>

            {/* User & Changes Block */}
            <div className="bg-background/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-semibold text-foreground">
                            {getUserDisplayName(change.performedBy)}
                        </span>
                    </div>
                    {filteredChanges.length > 1 && (
                        <button
                            className="p-1 hover:bg-primary/5 rounded-full"
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
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>
                    )}
                </div>

                <div className="space-y-3 pl-8">
                    {filteredChanges.length === 1 ? (
                        <div className="text-sm leading-relaxed">
                            {renderChangeDescription(filteredChanges[0])}
                        </div>
                    ) : isChangeExpanded ? (
                        filteredChanges.map((fieldChange, changeIndex) => (
                            <div key={changeIndex} className="text-sm leading-relaxed">
                                {renderChangeDescription(fieldChange)}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm leading-relaxed text-muted-foreground">
                            Modified {filteredChanges.length} fields
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityHistoryItem;
