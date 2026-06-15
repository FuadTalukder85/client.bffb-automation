import React from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { hasSection } from "./ProjectShared";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { formatDate } from "@/utils/dateFormatter";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { AiFillThunderbolt } from "react-icons/ai";
import { ProjectTaskStatsButton } from "../../components/ProjectTaskStatsButton";

export default function MobileProjectCard({
  project,
  serialNumber,
  onArchive,
  onRestore,
  onViewDetails,
  className,
}) {
  // Check which sections are accessible
  const hasMasterProject = hasSection(project, "masterProject");
  const hasProductDevelopment = hasSection(project, "productDevelopment");
  const hasApplicationLab = hasSection(project, "applicationLab");
  const hasSensoryLab = hasSection(project, "sensoryLab");
  const hasBusinessDevelopment = hasSection(project, "businessDevelopment");

  const isActive = hasMasterProject
    ? project.masterProject?.isActive ?? true
    : true;

  // Map the project data
  const adaptedProject = {
    projectCode: hasMasterProject
      ? project.masterProject?.code || "—"
      : "Access Denied",
    projectName: hasMasterProject
      ? project.masterProject?.title || "—"
      : "Access Denied",
    createdAt: hasMasterProject
      ? project.masterProject?.raisedDate || project.createdAt
      : null,
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
    projectStatus: hasMasterProject
      ? project.masterProject?.status || "Not Started"
      : "Access Denied",
  };

  // Render action buttons based on project state
  const renderActionButtons = () => {
    if (!isActive && hasMasterProject) {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRestore?.(project)}
          className="w-10 border rounded-md text-nav-highlight h-9 border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80"
          title="Restore Project"
        >
          <AiFillThunderbolt className="w-5 h-5" />
        </Button>
      );
    }

    return (
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
          className={cn(
            "flex-1 h-9 px-3 text-sm font-semibold transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none border-l-table-stroke border-y border-nav-highlight/15",
            hasMasterProject ? "rounded-none border-r border-r-nav-highlight/15" : "rounded-r-md border-r border-r-nav-highlight/15"
          )}
        />
        {hasMasterProject && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive?.(project)}
            title="Archive"
            aria-label="Archive"
            className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 text-sm font-semibold rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-primary-shade-2 border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <svg
              className="w-5 h-5 action-button-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="4"
              height="4"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"
              />
            </svg>
          </Button>
        )}
      </div>
    );
  };

  // Render status badge with proper styling
  const renderStatusBadge = (status, type = "masterProject") => {
    if (status === "Access Denied") {
      return (
        <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-full">
          {status}
        </span>
      );
    }

    // Map common project sections to status colors
    const statusChangedAt = project.statusChangedAt?.[
        type === "masterProject" ? "masterProjectStatus" :
        type === "productDevelopment" ? "productDevelopmentStatus" :
        type === "applicationLab" ? "applicationLabStatus" :
        type === "sensoryLab" ? "sensoryLabStatus" :
        type === "businessDevelopment" ? "businessDevelopmentStatus" : ""
    ];

    return (
        <GlobalStatusBadge 
            status={status} 
            size="sm" 
            statusChangedAt={statusChangedAt}
        />
    );
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
            {hasMasterProject && adaptedProject.createdAt ? (
              <h3 className="text-sm font-semibold line-clamp-1">
                {formatDate(adaptedProject.createdAt)}
              </h3>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
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

          {!isActive && hasMasterProject && (
            <InfoTable.Row label="Status">
              <div className="font-semibold text-right text-muted-foreground">
                <span className="italic">Project Archived</span>
              </div>
            </InfoTable.Row>
          )}

          <InfoTable.Row label="Product Development Status">
            <div className="flex justify-end">
              {renderStatusBadge(adaptedProject.productDevelopmentStatus, "productDevelopment")}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Application Development Status">
            <div className="flex justify-end">
              {renderStatusBadge(adaptedProject.applicationDevelopmentStatus, "applicationLab")}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Sensory Status">
            <div className="flex justify-end">
              {renderStatusBadge(adaptedProject.sensoryStatus, "sensoryLab")}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="BD Status">
            <div className="flex justify-end">
              {renderStatusBadge(adaptedProject.bdStatus, "businessDevelopment")}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Project Status">
            <div className="flex justify-end">
              {renderStatusBadge(adaptedProject.projectStatus, "masterProject")}
            </div>
          </InfoTable.Row>
        </InfoTable>
      </ExpandableCard.Content>

      <ExpandableCard.Footer className="pt-2">
        <ExpandableCard.FooterLeft>
          {renderActionButtons()}
        </ExpandableCard.FooterLeft>
        <ExpandableCard.FooterRight>
          <ExpandableCard.ToggleButton />
        </ExpandableCard.FooterRight>
      </ExpandableCard.Footer>
    </ExpandableCard>
  );
}

