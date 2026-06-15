import React from "react";
import { AiFillThunderbolt } from "react-icons/ai";
import { cn } from "@/lib/utils";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { formatDate } from "@/utils/dateFormatter";

const EditIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16">
        <path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/>
    </svg>
);

const ArchiveIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24">
        <path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/>
    </svg>
);

export default function MobileSampleDetailCard({
    sample,
    serialNumber,
    onEdit,
    onDelete,
    onRestore,
    className,
}) {
    const actionButtons = sample.isActive ? [
        {
            key: "edit",
            icon: EditIcon,
            onClick: () => onEdit?.(sample),
            title: "Edit",
            className: "rounded-r-none flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
            iconSize: "w-5 h-5",
        },
        {
            key: "archive",
            icon: ArchiveIcon,
            onClick: () => onDelete?.(sample),
            title: "Archive",
            className: "rounded-l-none flex-1 text-base-color hover:bg-gray-50 bg-background border border-nav-highlight/15 border-l-table-stroke",
            iconSize: "w-5 h-5",
        }
    ] : [
        {
            key: "restore",
            icon: AiFillThunderbolt,
            onClick: () => onRestore?.(sample),
            title: "Restore",
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
            className={cn("md:hidden p-3 my-4 rounded-xl bg-background", className)}
        >
            <ExpandableCard.Content initialHeight={140}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary/10 text-nav-highlight">
                        <span className="text-sm font-semibold">{serialNumber}</span>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-lighter-text truncate">
                            {sample.recipe?.recipeCode || "—"}
                        </h3>
                        <span className="text-xs text-muted-foreground truncate">
                            {sample.project?.masterProject?.code || "—"}
                        </span>
                    </div>

                    <div className="flex-1 text-right">
                        {sample.createdAt ? (
                            <h3 className="text-sm font-semibold line-clamp-1">
                                {formatDate(sample.createdAt)}
                            </h3>
                        ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                        )}
                    </div>
                </div>

                <InfoTable>
                    <InfoTable.Row label="Project Name">
                        <div className="font-semibold text-right text-base-color truncate max-w-[150px]">
                            {sample.project?.masterProject?.title || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Officer">
                        <div className="font-medium text-right text-lighter-text">
                            {sample.applicationOfficer?.name || "—"}
                        </div>
                    </InfoTable.Row>
                    
                    <InfoTable.Row label="Batch Size (g)">
                        <div className="font-medium text-right text-lighter-text">
                            {sample.batchSize ?? "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Output (g)">
                        <div className="font-medium text-right text-lighter-text">
                            {sample.output ?? "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Packaging Status">
                        <div className="flex justify-end">
                            {renderStatusBadge(sample.packagingStatus, null)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Packaging Type">
                        <div className="font-medium text-right text-lighter-text">
                            {sample.packageType?.title || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Per Pack Quantity">
                        <div className="font-medium text-right text-lighter-text">
                            {sample.perPackQuantity ?? "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Suggestions">
                        <div className="font-medium text-right text-lighter-text truncate max-w-[150px]">
                            {sample.applicationSuggestion || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="HOD Status">
                        <div className="flex justify-end">
                            {sample.HODStatus === true ? (
                                <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 border border-green-300 rounded-full">
                                    Approved
                                </span>
                            ) : sample.HODStatus === false ? (
                                <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 border border-red-300 rounded-full">
                                    Not Approved
                                </span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="HOD Evaluation">
                        <div className="font-medium text-right text-lighter-text truncate max-w-[150px]">
                            {sample.HODEvaluation || "—"}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Approval for Sensory">
                        <div className="flex justify-end">
                            {renderStatusBadge(sample.approvalForSensory ? "Approved" : "Pending", null)}
                        </div>
                    </InfoTable.Row>
                </InfoTable>
            </ExpandableCard.Content>

            <ExpandableCard.Footer className="pt-2">
                <ExpandableCard.FooterLeft>
                    <ButtonGroup buttons={actionButtons} gap="gap-0" fullWidth />
                </ExpandableCard.FooterLeft>
                <ExpandableCard.FooterRight>
                    <ExpandableCard.ToggleButton />
                </ExpandableCard.FooterRight>
            </ExpandableCard.Footer>
        </ExpandableCard>
    );
}
