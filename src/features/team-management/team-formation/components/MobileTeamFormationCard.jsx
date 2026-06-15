import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Eye } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { RestoreTeamModal } from "./RestoreTeamModal";

export function MobileTeamFormationCard({
  serial,
  name,
  isActive,
  onView,
  onEdit,
  onArchive,
  onRestore,
  className,
}) {
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const handleRestoreClick = () => {
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = () => {
    onRestore();
    setIsRestoreModalOpen(false);
  };

  // Define button configurations for active teams
  const activeTeamButtons = [
    {
      key: "view",
      icon: (props) => <Eye {...props} className={cn("action-button-icon", props.className)} />,
      onClick: () => onView({ id: serial, name, isActive }), // Pass team object
      title: "View Team",
      className:
        "rounded-r-none flex-1 text-[#552e8e] dark:text-white hover:bg-primary/10 bg-background border border-primary-shade-2",
    },
    {
      key: "edit",
      icon: (props) => (
        <svg {...props} className={cn("action-button-icon", props.className)} xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
      ),
      onClick: () => onEdit({ id: serial, name, isActive }), // Pass team object
      title: "Edit Team",
      className:
        "rounded-none flex-1 dark:text-nav-highlight text-lighter-text hover:bg-primary/10  bg-primary-shade-2",
    },
    {
      key: "archive",
      icon: (props) => (
        <svg {...props} className={cn("action-button-icon", props.className)} xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
      ),
      onClick: () => onArchive({ id: serial, name, isActive }), // Pass team object
      title: "Archive Team",
      className:
        "rounded-l-none flex-1 text-[#552e8e] dark:text-white hover:bg-primary/10 bg-background border border-primary-shade-2",
    },
  ];

  return (
    <div
      className={cn(
        "flex md:hidden w-full flex-col rounded-xl bg-background border border-table-stroke transition-colors dark:drop-shadow-table-stroke dark:drop-shadow-xs",
        className
      )}
    >
      {/* Main Content */}
      <div
        className={cn(
          " flex items-center justify-between p-4",
          isActive ? "pb-2" : "pb-4"
        )}
      >
        {/* Show serial badge for active, serial number for archived */}
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-shade-2 text-nav-highlight shrink-0">
          <span className="text-sm font-semibold">{serial}</span>
        </div>

        <div className="flex flex-col flex-1 gap-1 px-3">
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        </div>

        {/* Show restore button for archived only */}
        {!isActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestoreClick}
            className="w-10 border rounded-md text-nav-highlight h-9 border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80 shrink-0"
            title="Restore Team"
          >
            <AiFillThunderbolt className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Divider for active state */}
      {isActive && <div className="h-[0.1px] bg-table-stroke mx-4 mb-2"></div>}

      {/* Footer with action buttons - only for active teams */}
      {isActive && (
        <ButtonGroup
          buttons={activeTeamButtons}
          className="px-4 pt-2 pb-4 w-30"
          fullWidth
          gap="gap-0"
        />
      )}

      <RestoreTeamModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        onConfirm={handleRestoreConfirm}
      />
    </div>
  );
}

