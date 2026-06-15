import React from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";

export default function MobileApplicationLabRecordsCard({ 
    record, 
    serialNumber, 
    onView,
    className 
}) {
    const renderStatusBadge = (status, days) => {
        if (!status) return <span className="text-muted-foreground">—</span>;
        
        const displayStatus = days ? `${status} (${days}d)` : status;
        
        return (
            <span
                className="px-3 py-1 text-xs font-medium rounded-full"
                style={getStatusColor(status)}
            >
                {displayStatus}
            </span>
        );
    };

    const actionButton = {
        key: "view",
        icon: (props) => <Eye {...props} className={cn("action-button-icon", props.className)} />,
        onClick: () => onView?.(record),
        title: "View",
        className:
            "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
        iconSize: "w-5 h-5",
    };

    return (
        <ExpandableCard
            className={cn("p-3 my-4 rounded-xl bg-background", className)}
        >
            <ExpandableCard.Content initialHeight={140}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10 text-nav-highlight">
                        <span className="text-sm font-semibold">{serialNumber}</span>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-lighter-text truncate">
                            {record.projectCode || "—"}
                        </h3>
                    </div>

                    <div className="flex-1 text-right">
                         <span className="text-sm font-semibold text-nav-highlight">
                            {record.raisedDate || "—"}
                        </span>
                    </div>
                </div>

                <InfoTable>
                    <InfoTable.Row label="Project Name">
                        <div className="font-semibold text-right text-base-color truncate max-w-[150px]">
                            {record.projectName || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Product Development">
                        <div className="flex justify-end">
                            {renderStatusBadge(record.pdStatus, record.pdDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Development">
                        <div className="flex justify-end">
                            {renderStatusBadge(record.adStatus, record.adDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Sensory Status">
                        <div className="flex justify-end">
                            {renderStatusBadge(record.sensoryStatus, record.sensoryDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Business Development">
                        <div className="flex justify-end">
                            {renderStatusBadge(record.bdStatus, record.bdDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Project Status">
                        <div className="flex justify-end">
                            {renderStatusBadge(record.projectStatus, record.projectDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="HOD Status">
                        <div className="flex justify-end">
                            {renderStatusBadge(record.hodStatus, record.hodDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Purpose">
                        <div className="font-medium text-right text-lighter-text">
                            {record.purpose || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Purpose Name">
                        <div className="font-medium text-right text-lighter-text truncate max-w-[150px]">
                            {record.purposeName || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Objective">
                        <div className="font-medium text-right text-lighter-text">
                            {record.objective || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Objective Details">
                        <div className="font-medium text-right text-lighter-text truncate max-w-[150px]">
                            {record.objectiveDetails || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Category">
                        <div className="font-medium text-right text-lighter-text">
                            {record.category?.name || record.category || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Subcategory">
                        <div className="font-medium text-right text-lighter-text">
                            {record.subcategory?.name || record.subcategory || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Sub-subcategory">
                        <div className="font-medium text-right text-lighter-text">
                            {record.subSubcategory?.name || record.subSubcategory || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Tags">
                        <div className="flex flex-wrap justify-end gap-1">
                            {record.tags?.map((tag, idx) => (
                                <span key={idx} className="bg-gray-100 text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-nav-highlight font-medium whitespace-nowrap">
                                    {tag?.name || tag}
                                </span>
                            ))}
                            {!record.tags?.length && <span className="text-muted-foreground">—</span>}
                        </div>
                    </InfoTable.Row>
                </InfoTable>
            </ExpandableCard.Content>

            <ExpandableCard.Footer className="pt-2">
                <ExpandableCard.FooterLeft>
                    <ButtonGroup buttons={[actionButton]} fullWidth />
                </ExpandableCard.FooterLeft>
                <ExpandableCard.FooterRight>
                    <ExpandableCard.ToggleButton />
                </ExpandableCard.FooterRight>
            </ExpandableCard.Footer>
        </ExpandableCard>
    );
}
