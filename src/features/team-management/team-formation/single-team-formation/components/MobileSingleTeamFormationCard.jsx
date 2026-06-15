import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Eye } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";

export function MobileSingleTeamFormationCard({
  serial,
  member,
  onRefresh,
  onDelete,
  onRestore,
  className,
}) {
  // Handle both API response (user nested) and direct member data
  const user = member.user || member;
  const name = user.name || user.username || "Unknown";
  const email = user.email || "No email";

  // Get role from activeRole (populated by backend)
  const role = user.activeRole?.roleName || user.department || "N/A";

  const isMemberActive = member.isActive !== false;

  const actionButtons = isMemberActive
    ? [
        {
          key: "replace",
          icon: (props) => <Eye {...props} className={cn("action-button-icon", props.className)} />,
          onClick: () => onRefresh(member),
          title: "Replace",
          className:
            "rounded-r-none flex-1 text-[#552e8e] dark:text-white hover:bg-primary/10 bg-primary-shade-2",
        },
        {
          key: "delete",
          icon: (props) => (
            <svg {...props} className={cn("action-button-icon", props.className)} xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
          ),
          onClick: () => onDelete(member),
          title: "Delete",
          className:
            "rounded-l-none flex-1 dark:text-foreground text-foreground hover:bg-primary/10 bg-white dark:bg-transparent border-l border-table-stroke",
        },
      ]
    : [
        {
          key: "restore",
          icon: (props) => (
            <AiFillThunderbolt {...props} className={cn("w-5 h-5", props.className)} />
          ),
          onClick: () => onRestore?.(member),
          title: "Restore",
          className:
            "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 rounded-md transition-colors",
        },
      ];

  return (
    <div
      className={cn(
        "flex md:hidden w-full flex-col rounded-xl bg-background border border-table-stroke transition-colors dark:drop-shadow-table-stroke dark:drop-shadow-xs mb-4",
        className
      )}
    >
      {/* Content Rows */}
      <div className="flex flex-col">
        {/* Main Content */}
        <div className="flex items-center justify-between p-4">
          {/* Serial Number */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-shade-2 text-nav-highlight shrink-0">
            <span className="text-sm font-semibold">{serial}</span>
          </div>

          {/* Member Details */}
          <div className="flex flex-col flex-1 gap-1 text-right">
            <h3 className="text-sm font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-lighter-text">{email}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-table-stroke mx-4"></div>

        {/* Role */}
        <div className="flex items-center justify-between p-4">
          <span className="text-xs text-lighter-text">Role</span>
          <span className="text-sm font-semibold text-foreground">{role}</span>
        </div>
      </div>

      {/* Divider before footer */}
      <div className="h-px bg-table-stroke mx-4"></div>

      {/* Footer with action buttons */}
      <ButtonGroup
        buttons={actionButtons}
        className="px-4 pt-2 pb-4"
        fullWidth
        gap="gap-0"
      />
    </div>
  );
}

export default MobileSingleTeamFormationCard;

