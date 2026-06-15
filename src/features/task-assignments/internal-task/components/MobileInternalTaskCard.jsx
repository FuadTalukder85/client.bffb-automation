import React, { useState } from "react";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Eye, Undo2 } from "lucide-react";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";
import { ArchiveInternalTaskModal } from "./ArchiveInternalTaskModal";
import { EditInternalTaskModal } from "./EditInternalTaskModal";
import { TaskUpdatedModal } from "./TaskUpdatedModal";
import { RestoreInternalTaskModal } from "./RestoreInternalTaskModal";

const MobileInternalTaskCard = ({ task, serialNumber, onRestore }) => {
  const isArchived = task.isActive === false;
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskUpdatedModalOpen, setIsTaskUpdatedModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedData) => {
    console.log("Internal task updated:", updatedData);
    // Add logic here to update the task
    setIsTaskUpdatedModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = (taskToArchive) => {
    console.log("Internal task archived:", taskToArchive);
    // The API call is handled in ArchiveInternalTaskModal
    // The parent component will refetch the list
  };

  const handleRestoreClick = () => {
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = (taskToRestore) => {
    console.log("Internal task restored:", taskToRestore);
    onRestore?.(taskToRestore);
    // Add logic here to restore the task
  };

  return (
    <ExpandableCard className="p-3 mb-4 rounded-xl bg-background">
      {/* Content */}
      <ExpandableCard.Content initialHeight={180}>
        {/* Header Section with Serial and Title */}
        <div className="flex items-center gap-3 mb-3">
          {/* Serial Number Badge */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary-shade-2 text-nav-highlight">
            <span className="text-sm font-semibold">{serialNumber}</span>
          </div>

          {/* Task Title - Right aligned with line clamp */}
          <div className="flex-1 text-right">
            <h3 className="text-sm font-semibold text-foreground line-clamp-1">
              {task.task}
            </h3>
          </div>
        </div>

        {/* Task Info */}
        <InfoTable>
          <InfoTable.Row label="Assigned To">
            <div className="font-semibold text-right text-base-color">
              {task.assignedTo.name}
              {task.assignedTo.additional && (
                <div className="text-xs text-lighter-text">
                  {task.assignedTo.additional}
                </div>
              )}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Team">
            <div className="font-semibold text-right text-base-color">
              {task.team}
            </div>
          </InfoTable.Row>

          <InfoTable.Row
            label={
              <span
                className="px-3 py-1 text-xs font-medium rounded-full"
                style={getStatusColor(task.status)}
              >
                {task.status}
              </span>
            }
          >
            <div className="font-semibold text-right text-base-color">
              {task.duration}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Start Date">
            <div className="font-semibold text-right text-base-color">
              {task.startDate}
            </div>
          </InfoTable.Row>

          {/* Additional expandable content */}
          <InfoTable.Row
            label={
              <div className="text-sm text-lighter-text">
                Start: <span className="font-semibold text-base-color">{task.startDate}</span>
              </div>
            }
          >
            <div className="text-right text-lighter-text">
              End: <span className="font-semibold text-base-color">{task.endDate}</span>
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Reoccurring">
            <div className="font-semibold text-right text-base-color">
              {task.reoccurring}
            </div>
          </InfoTable.Row>

          <InfoTable.Row label="Frequency">
            <div className="font-semibold text-right text-base-color">
              {task.frequency}
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
                  title: "Delete",
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

        {/* Right side - See more/See less button */}
        <ExpandableCard.FooterRight>
          <ExpandableCard.ToggleButton />
        </ExpandableCard.FooterRight>
      </ExpandableCard.Footer>

      {/* Edit Task Modal */}
      <EditInternalTaskModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        task={task}
        onSuccess={handleEditSuccess}
      />

      {/* Archive Task Modal */}
      <ArchiveInternalTaskModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        task={task}
        onConfirm={handleArchiveConfirm}
      />

      {/* Task Updated Success Modal */}
      <TaskUpdatedModal
        open={isTaskUpdatedModalOpen}
        onOpenChange={setIsTaskUpdatedModalOpen}
      />

      {/* Restore Task Modal */}
      <RestoreInternalTaskModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        task={task}
        onConfirm={handleRestoreConfirm}
      />
    </ExpandableCard>
  );
};

export default MobileInternalTaskCard;

