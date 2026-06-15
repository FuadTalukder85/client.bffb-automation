import React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";
import { ButtonGroup } from "@/components/ui/ButtonGroup";

export default function MobileRecordDetailsCard({
    record,
    serialNumber,
    onEdit,
    className,
}) {
    const actionButtons = [
        {
            key: "edit",
            icon: Pencil,
            onClick: () => onEdit?.(record),
            title: "Edit",
            className: "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
            iconSize: "w-5 h-5",
        }
    ];

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
                            {record.recipeCode || "—"}
                        </h3>
                        <span className="text-xs text-muted-foreground truncate">
                            {record.recipeName || "—"}
                        </span>
                    </div>

                    <div className="flex-1 text-right">
                        <span className="text-sm font-semibold text-nav-highlight">
                            {record.raisedDate || "—"}
                        </span>
                    </div>
                </div>

                <InfoTable>
                    <InfoTable.Row label="Project Start Date">
                        <div className="font-medium text-right text-lighter-text">
                            {record.projectStartDate || "—"}
                        </div>
                    </InfoTable.Row>
                    
                    <InfoTable.Row label="Last Production Date">
                        <div className="font-medium text-right text-lighter-text">
                            {record.lastProductionDate || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Next Production Date">
                        <div className="font-medium text-right text-lighter-text">
                            {record.nextProductionDate || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Officer">
                        <div className="font-medium text-right text-lighter-text">
                            {record.applicationOfficer?.name || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Batch Size (g)">
                        <div className="font-medium text-right text-lighter-text">
                            {record.batchSize ?? "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Output (pcs)">
                        <div className="font-medium text-right text-lighter-text">
                            {record.output ?? "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Suggestions">
                        <div className="font-medium text-right text-lighter-text truncate max-w-[150px]">
                            {record.suggestions || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="HOD Status">
                        <div className="flex justify-end">
                            {renderStatusBadge(record.hodStatus, record.hodStatusDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="HOD Evaluation">
                        <div className="font-medium text-right text-lighter-text truncate max-w-[150px]">
                            {record.hodEvaluation || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Approval for Sensory">
                        <div className="flex justify-end">
                            {renderStatusBadge(record.sensoryApproval, record.sensoryApprovalDays)}
                        </div>
                    </InfoTable.Row>
                </InfoTable>
            </ExpandableCard.Content>

            <ExpandableCard.Footer className="pt-2">
                <ExpandableCard.FooterLeft>
                    <ButtonGroup buttons={actionButtons} fullWidth />
                </ExpandableCard.FooterLeft>
                <ExpandableCard.FooterRight>
                    <ExpandableCard.ToggleButton />
                </ExpandableCard.FooterRight>
            </ExpandableCard.Footer>
        </ExpandableCard>
    );
}
