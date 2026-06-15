import React from "react";
import { Eye, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { hasSection } from "../../product-development/components/ProductDevelopmentShared";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";
import { ProjectTaskStatsButton } from "../../components/ProjectTaskStatsButton";

export default function MobileSensoryCard({ 
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

    // Map the project data to match the card format
    const adaptedProject = {
        projectCode: hasMasterProject
            ? project.masterProject?.code || "—"
            : "Access Denied",
        projectName: hasMasterProject
            ? project.masterProject?.title || "—"
            : "Access Denied",
        productDevelopmentStatus: hasProductDevelopment
            ? project.productDevelopment?.status || "Not Started"
            : "Access Denied",
        applicationDevelopmentStatus: hasApplicationLab
            ? project.applicationLab?.developmentStatus || "Not Started"
            : "Access Denied",
        sensoryStatus: hasSensoryLab
            ? project.sensoryLab?.status || "Not Started"
            : "Access Denied",
        bdStatus: hasBusinessDevelopment
            ? project.businessDevelopment?.status || "Not Started"
            : "Access Denied",
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
                </div>

                <InfoTable>
                    <InfoTable.Row label="Project Name">
                        <div className="font-semibold text-right text-base-color">
                            {hasMasterProject ? (
                                adaptedProject.projectName
                            ) : (
                                <span
                                    className="flex items-center gap-1 italic text-muted-foreground"
                                    title="You don't have permission to view this field"
                                >
                                    <AlertCircle size={12} className="text-yellow-500" />
                                    Access Denied
                                </span>
                            )}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Product Development Status">
                        <div className="flex justify-end">
                            {adaptedProject.productDevelopmentStatus === "Access Denied" ? (
                                <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full">
                                    {adaptedProject.productDevelopmentStatus}
                                </span>
                            ) : (
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.productDevelopmentStatus)}
                                >
                                    {adaptedProject.productDevelopmentStatus}
                                </span>
                            )}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Development Status">
                        <div className="flex justify-end">
                            {adaptedProject.applicationDevelopmentStatus === "Access Denied" ? (
                                <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full">
                                    {adaptedProject.applicationDevelopmentStatus}
                                </span>
                            ) : (
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.applicationDevelopmentStatus)}
                                >
                                    {adaptedProject.applicationDevelopmentStatus}
                                </span>
                            )}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Sensory Status">
                        <div className="flex justify-end">
                            {adaptedProject.sensoryStatus === "Access Denied" ? (
                                <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full">
                                    {adaptedProject.sensoryStatus}
                                </span>
                            ) : (
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.sensoryStatus)}
                                >
                                    {adaptedProject.sensoryStatus}
                                </span>
                            )}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="BD Status">
                        <div className="flex justify-end">
                            {adaptedProject.bdStatus === "Access Denied" ? (
                                <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full">
                                    {adaptedProject.bdStatus}
                                </span>
                            ) : (
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.bdStatus)}
                                >
                                    {adaptedProject.bdStatus}
                                </span>
                            )}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Project Status">
                        <div className="flex justify-end">
                            {adaptedProject.projectStatus === "Access Denied" ? (
                                <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full">
                                    {adaptedProject.projectStatus}
                                </span>
                            ) : (
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.projectStatus)}
                                >
                                    {adaptedProject.projectStatus}
                                </span>
                            )}
                        </div>
                    </InfoTable.Row>
                </InfoTable>
            </ExpandableCard.Content>

            <ExpandableCard.Footer className="pt-2">
                <ExpandableCard.FooterLeft>
                    <div className="flex items-center gap-0 w-full">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails?.(project)}
                            title="View Details"
                            aria-label="View Details"
                            className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 text-sm font-semibold rounded-l-md rounded-r-none text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        >
                            <Eye className="w-5 h-5 action-button-icon" />
                        </Button>
                        <ProjectTaskStatsButton
                            projectId={project._id}
                            className="flex-1 h-9 px-3 text-sm font-semibold rounded-r-md rounded-l-none border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none border-y border-r border-r-nav-highlight/15"
                        />
                    </div>
                </ExpandableCard.FooterLeft>
                <ExpandableCard.FooterRight>
                    <ExpandableCard.ToggleButton />
                </ExpandableCard.FooterRight>
            </ExpandableCard.Footer>
        </ExpandableCard>
    );
}
