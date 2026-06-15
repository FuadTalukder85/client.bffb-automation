import React from "react";
import { Eye } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { Button } from "@/components/ui/Button";

const MobileAccessRoleCard = ({
  serial,
  role,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isArchived = role.isActive === false;

  return (
    <div className="flex items-center  border border-table-stroke transition-colors dark:drop-shadow-table-stroke dark:drop-shadow-xs justify-between px-3 py-2 mb-3 rounded-xl bg-background shadow-[-3px_17px_80px_-1px_rgba(0,_0,_0,_0.1)]">
      <div className="flex items-center gap-3">
        {/* ID Box */}
        <div className="flex items-center justify-center rounded-lg min-w-11 min-h-8 bg-primary-shade-2">
          <p className="text-sm font-semibold text-nav-highlight">{serial}</p>
        </div>
        {/* Role Name */}
        <div className="text-sm font-semibold text-base-color">{role.name}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center">
        {isArchived ? (
          // Restore Button
          role.canRestore && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRestore?.(role)}
              className="w-10 border rounded-md h-9 border-primary-shade-2 bg-primary-shade-2 text-nav-highlight hover:bg-primary-shade-2/80"
            >
              <AiFillThunderbolt className="w-5 h-5" />
            </Button>
          )
        ) : (
          <>
            {/* Edit Button */}
            {role.canEdit && (
              <button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(role)}
                className="flex items-center justify-center w-10 border h-9 rounded-l-md border-primary-shade-2 bg-primary-shade-2 text-nav-highlight hover:bg-primary-shade-2/80"
              >
                <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
              </button>
            )}
            {/* Delete Button */}
            {role.canDelete && (
              <button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(role)}
                className="flex items-center justify-center w-10 h-9 rounded-r-md border-[0.1px] border-lighter-text/20 bg-white dark:bg-transparent text-base-color hover:bg-gray-50"
              >
                <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MobileAccessRoleCard;


