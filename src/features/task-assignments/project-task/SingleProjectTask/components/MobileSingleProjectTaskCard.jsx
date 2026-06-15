import React, { useState } from "react";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Eye, Undo2 } from "lucide-react";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { EditTaskModal } from "./EditTaskModal";
import { ArchiveTaskModal } from "./ArchiveTaskModal";
import { RestoreTaskModal } from "./RestoreTaskModal";
import { formatDate } from "@/utils/dateFormatter";

// Helper to format status
const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const MobileSingleProjectTaskCard = ({ task, onArchive, onStatusChange }) => {
  const isArchived = task.isActive === false;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Extract data from API response
  const title = task.title || task.task || "Untitled";
  const assignedTo = task.assignedTo?.name || task.assignedTo?.username || task.assignedTo || "Unassigned";
  const teamName = task.team?.name || "";
  const startDate = formatDate(task.startDate);
  const dueDate = formatDate(task.dueDate);
  const status = formatStatus(task.status);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsArchiveModalOpen(true);
  };

  const handleEditSuccess = (updatedData) => {
    console.log("Task updated:", updatedData);
  };

  const handleArchiveConfirm = (taskToArchive) => {
    onArchive?.(taskToArchive);
  };

  const handleRestoreClick = () => {
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = (taskToRestore) => {
    // Call status change to restore (set to pending)
    onStatusChange?.(taskToRestore, "pending");
  };

  return (
    <ExpandableCard className="p-3 mb-4 rounded-xl bg-background">
      {/* Content */}
      <ExpandableCard.Content>
        <InfoTable>
          <InfoTable.Row label="Task">
            <div className="font-semibold text-right text-base-color">
              {title}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Assigned To">
            <div className="font-semibold text-right text-base-color">
              {assignedTo}
              {teamName && <span className="text-xs text-muted-foreground ml-1">({teamName})</span>}
            </div>
          </InfoTable.Row>

          <InfoTable.Row
            label={
              <div className="text-sm text-lighter-text">
                Start:{" "}
                <span className="font-semibold text-base-color">
                  {startDate}
                </span>
              </div>
            }
          >
            <div className="text-right text-lighter-text">
              Due:{" "}
              <span className="font-semibold text-base-color">
                {dueDate}
              </span>
            </div>
          </InfoTable.Row>
        </InfoTable>
      </ExpandableCard.Content>

      {/* Footer */}
      <ExpandableCard.Footer className="pt-2">
        {/* Left side - Edit and Delete buttons OR Restore button */}
        <ExpandableCard.FooterLeft>
          {isArchived ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRestoreClick}
              className="w-10 border rounded-md text-nav-highlight h-9 border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80"
            >
              <Undo2 className="w-5 h-5" />
            </Button>
          ) : (
            <ButtonGroup
              buttons={[
                {
                  key: "edit",
                  icon: (props) => <svg {...props} className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>,
                  onClick: handleEditClick,
                  title: "Edit",
                  className:
                    "rounded-r-none flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                  iconSize: "w-5 h-5",
                },
                {
                  key: "delete",
                  icon: (props) => <svg {...props} className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>,
                  onClick: handleDeleteClick,
                  title: "Archive",
                  className:
                    "rounded-l-none flex-1 text-base-color hover:bg-gray-50 bg-background border border-nav-highlight/15 border-l-table-stroke",
                  iconSize: "w-5 h-5",
                },
              ]}
              gap="gap-0"
              fullWidth
            />
          )}
        </ExpandableCard.FooterLeft>

        {/* Right side - Status badge */}
        <ExpandableCard.FooterRight>
          <span className="px-4 py-2 text-sm font-semibold rounded-full bg-primary-shade-2 text-[#552e8e] dark:text-[#935ce3]">
            {status}
          </span>
        </ExpandableCard.FooterRight>
      </ExpandableCard.Footer>

      {/* Edit Task Modal */}
      <EditTaskModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        task={task}
        onSuccess={handleEditSuccess}
      />

      {/* Archive Task Modal */}
      <ArchiveTaskModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        task={task}
        onConfirm={handleArchiveConfirm}
      />

      {/* Restore Task Modal */}
      <RestoreTaskModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        task={task}
        onConfirm={handleRestoreConfirm}
      />
    </ExpandableCard>
  );
};

export default MobileSingleProjectTaskCard;

