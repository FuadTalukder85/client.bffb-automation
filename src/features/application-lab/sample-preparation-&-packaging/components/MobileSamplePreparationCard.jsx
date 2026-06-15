import React from "react";
import { Eye, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";
import { formatDate } from "@/utils/dateFormatter";
import { hasSection } from "../../../project-overview/master-project/components/ProjectShared";

export default function MobileSamplePreparationCard({ 
    project, 
    serialNumber, 
    onViewDetails,
    className 
}) {
    // Check which sections are accessible
    const hasMasterProject = hasSection(project, "masterProject");
    const hasProductDevelopment = hasSection(project, "productDevelopment");
    const hasApplicationLab = hasSection(project, "applicationLab");
    const hasSensoryLab = hasSection(project, "sensoryLab");
    const hasBusinessDevelopment = hasSection(project, "businessDevelopment");

    // Map the project data
    const adaptedProject = {
        projectCode: hasMasterProject
            ? project.masterProject?.code || "—"
            : "Access Denied",
        projectName: hasMasterProject
            ? project.masterProject?.title || "—"
            : "Access Denied",
        raisedDate: hasMasterProject
            ? project.masterProject?.raisedDate
            : null,
        productDevelopmentStatus: hasProductDevelopment
            ? project.productDevelopment?.status || "Not Started"
            : "Access Denied",
        productDevelopmentDays: hasProductDevelopment
            ? project.productDevelopment?.statusDays
            : null,
        applicationDevelopmentStatus: hasApplicationLab
            ? project.applicationLab?.developmentStatus || "Not Started"
            : "Access Denied",
        applicationDevelopmentDays: hasApplicationLab
            ? project.applicationLab?.statusDays
            : null,
        sensoryStatus: hasSensoryLab
            ? project.sensoryLab?.status || "Not Started"
            : "Access Denied",
        sensoryDays: hasSensoryLab
            ? project.sensoryLab?.statusDays
            : null,
        bdStatus: hasBusinessDevelopment
            ? project.businessDevelopment?.status || "Not Started"
            : "Access Denied",
        bdDays: hasBusinessDevelopment
            ? project.businessDevelopment?.statusDays
            : null,
        projectStatus: hasMasterProject
            ? project.masterProject?.status || "Not Started"
            : "Access Denied",
        projectStatusDays: hasMasterProject
            ? project.masterProject?.statusDays
            : null,
        hodStatus: project.latestSampleHODStatus || null,
        hodStatusDays: null,
    };

    const renderStatusBadge = (status, days) => {
        if (!status) return <span className="text-muted-foreground">—</span>;
        if (status === "Access Denied") {
            return (
                <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full flex items-center gap-1">
                    <AlertCircle size={12} />
                    {status}
                </span>
            );
        }
        
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
        icon: Eye,
        onClick: () => onViewDetails?.(project),
        title: "View",
        className:
            "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
        iconSize: "w-5 h-5",
        iconClassName: "action-button-icon",
    };

    return (
        <ExpandableCard
            className={cn("md:hidden p-3 my-4 rounded-xl bg-background", className)}
        >
            <ExpandableCard.Content initialHeight={140}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary-shade-2 text-nav-highlight">
                        <span className="text-sm font-semibold">{serialNumber}</span>
                    </div>

                    <div className="flex flex-1">
                        {hasMasterProject ? (
                            <h3 className="text-sm font-semibold text-lighter-text line-clamp-1">
                                {adaptedProject.projectCode}
                            </h3>
                        ) : (
                            <span
                                className="flex items-center gap-1 text-sm italic font-semibold text-muted-foreground"
                                title="You don't have permission to view this field"
                            >
                                <AlertCircle size={14} className="text-yellow-500" />
                                Access Denied
                            </span>
                        )}
                    </div>

                    <div className="flex-1 text-right">
                        {hasMasterProject && adaptedProject.raisedDate ? (
                            <h3 className="text-sm font-semibold line-clamp-1">
                                {formatDate(adaptedProject.raisedDate)}
                            </h3>
                        ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                        )}
                    </div>
                </div>

                <InfoTable>
                    <InfoTable.Row label="Project Name">
                        <div className="font-semibold text-right text-base-color truncate max-w-[150px]">
                            {hasMasterProject ? (
                                adaptedProject.projectName
                            ) : (
                                <span
                                    className="flex items-center gap-1 italic text-muted-foreground justify-end"
                                    title="You don't have permission to view this field"
                                >
                                    <AlertCircle size={12} className="text-yellow-500" />
                                    Access Denied
                                </span>
                            )}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Product Development">
                        <div className="flex justify-end">
                            {renderStatusBadge(adaptedProject.productDevelopmentStatus, adaptedProject.productDevelopmentDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Development">
                        <div className="flex justify-end">
                            {renderStatusBadge(adaptedProject.applicationDevelopmentStatus, adaptedProject.applicationDevelopmentDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Sensory Status">
                        <div className="flex justify-end">
                            {renderStatusBadge(adaptedProject.sensoryStatus, adaptedProject.sensoryDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Business Development">
                        <div className="flex justify-end">
                            {renderStatusBadge(adaptedProject.bdStatus, adaptedProject.bdDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Project Status">
                        <div className="flex justify-end">
                            {renderStatusBadge(adaptedProject.projectStatus, adaptedProject.projectStatusDays)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="HOD Status">
                        <div className="flex justify-end">
                            {adaptedProject.hodStatus === true ? (
                                <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 border border-green-300 rounded-full">
                                    Approved
                                </span>
                            ) : adaptedProject.hodStatus === false ? (
                                <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 border border-red-300 rounded-full">
                                    Not Approved
                                </span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
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
