import { Button } from "@/components/ui/Button";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { Eye } from "lucide-react";
import { formatDate, getDurationInDays } from "@/utils/dateFormatter";
import { getStatusColor } from "@/constants/statusColors";
import { useProjectStats } from "@/hooks/useProjectTasks";

function ManageTasksMobileAction({ project, onManageTasks }) {
  const projectId = project._id || project.id;
  const { data: stats, isLoading } = useProjectStats(projectId);

  const pendingCount = stats?.pending || 0;
  const inProgressCount = stats?.in_progress || 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative w-10 h-9 rounded-md border border-primary-shade-2 bg-white dark:bg-transparent text-nav-highlight hover:bg-gray-50"
      onClick={() => onManageTasks?.(project)}
    >
      <Eye className="action-button-icon" />
      {!isLoading && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center bg-white border border-primary/20 dark:bg-background rounded-md px-1 py-0.5 text-[10px] font-bold shadow-sm z-10 leading-none">
          <span className="text-yellow-600 dark:text-yellow-500">{pendingCount}</span>
          <span className="mx-0.5 text-muted-foreground h-2.5 w-[1px] bg-primary/25 dark:bg-primary"></span>
          <span className="text-blue-600 dark:text-blue-500">{inProgressCount}</span>
        </span>
      )}
    </Button>
  );
}

// Helper to format status
const formatStatus = (status) => {
  if (!status) return "Not Started";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// Helper to generate project code
const generateProjectCode = (project) => {
  if (project.projectCode) return project.projectCode;
  if (project.code) return project.code;
  // Generate a placeholder code from ID if available
  const id = project._id || project.id || "";
  if (id) {
    return `PJR ${id.slice(-6).toUpperCase()}`;
  }
  return "N/A";
};

const MobileProjectTaskCard = ({ serial, project, onManageTasks, initialHeight = 135 }) => {
  const projectId = project._id || project.id;
  const projectName = project.name || "Untitled Project";
  const projectCode = generateProjectCode(project);
  const status = formatStatus(project.status);
  const startDate = formatDate(project.startDate);
  const endDate = formatDate(project.endDate);
  const duration = getDurationInDays(project.startDate, project.endDate, "N/A");

  return (
    <ExpandableCard className="mb-4 rounded-xl bg-background p-3">
      {/* Content */}
      <ExpandableCard.Content initialHeight={initialHeight}>
        <InfoTable>
          <InfoTable.Row
            label={
              <div className="min-w-11 min-h-8 rounded-lg bg-primary-shade-2 flex items-center justify-center">
                <p className="text-nav-highlight text-sm font-semibold">
                  {serial}
                </p>
              </div>
            }
          >
            <div className="font-semibold text-base-color text-right">
              {projectName}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Project Code">
            <div className="font-semibold text-base-color">
              {projectCode}
            </div>
          </InfoTable.Row>

          <InfoTable.Row
            label={
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={getStatusColor(status)}
              >
                {status}
              </span>
            }
          >
            <div className="font-semibold text-base-color text-right">
              {duration}
            </div>
          </InfoTable.Row>

          <InfoTable.Row
            label={
              <div className="text-sm text-lighter-text">
                Start: <span className="text-base-color font-semibold">{startDate}</span>
              </div>
            }
          >
            <div className="text-lighter-text text-right">
              End: <span className="text-base-color font-semibold">{endDate}</span>
            </div>
          </InfoTable.Row>
        </InfoTable>
      </ExpandableCard.Content>

      {/* Footer */}
      <ExpandableCard.Footer className="pt-2">
        {/* Left side - Manage Tasks button */}
        <ExpandableCard.FooterLeft className="flex">
          <ManageTasksMobileAction project={project} onManageTasks={onManageTasks} />
        </ExpandableCard.FooterLeft>

        {/* Right side - Toggle button */}
        <ExpandableCard.FooterRight>
          <ExpandableCard.ToggleButton />
        </ExpandableCard.FooterRight>
      </ExpandableCard.Footer>
    </ExpandableCard>
  );
};

export default MobileProjectTaskCard;
