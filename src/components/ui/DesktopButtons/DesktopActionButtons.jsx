import React from "react";
import { AiFillThunderbolt } from "react-icons/ai";
import { Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const DesktopActionButtons = ({
  onView,
  onEdit,
  onDelete,
  onReactivate,
  data,
  className,
}) => {
  // If we have a reactivate action, it usually stands alone (archived state)
  if (onReactivate) {
    return (
      <div className={cn("flex items-center justify-end", className)}>
        <Button
          intent="ghost"
          size="sm"
          onClick={() => onReactivate(data)}
          className={cn(
            "h-8 px-2 2xl:size-9 3xl:size-10 rounded-2xl",
            "bg-primary-shade-2 text-primary",
            "hover:bg-primary hover:text-white",
            "font-medium text-xs transition-colors duration-200"
          )}
        >
          <AiFillThunderbolt className="w-6 h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8" />
        </Button>
      </div>
    );
  }

  // Standard View/Edit/Delete group
  if (onView || onEdit || onDelete) {
    return (
      <div
        className={cn("flex items-center justify-end", className)}
        role="group"
      >
        {onView && (
          <Button
            intent="ghost"
            size="icon"
            onClick={() => onView(data)}
            className={cn(
              "w-8 h-8  2xl:size-10 3xl:size-12 rounded-none first:rounded-l-lg border border-r-0 border-primary-shade-2",
              "bg-primary-shade-2 text-primary",
              "hover:bg-primary hover:text-white hover:border-primary",
              "transition-all duration-200 focus:z-10",
              // If it's the only button, round right side too
              !onEdit && !onDelete && "rounded-r-lg border-r"
            )}
            title="View"
          >
            <Eye className="action-button-icon" />
          </Button>
        )}

        {onEdit && (
          <Button
            intent="ghost"
            size="icon"
            onClick={() => onEdit(data)}
            className={cn(
              "2xl:size-9 3xl:size-10 rounded-none border border-r-0 border-primary-shade-2",
              "bg-primary-shade-2 text-primary",
              "hover:bg-primary hover:text-white hover:border-primary",
              "transition-all duration-200 focus:z-10",
              // Round left if first
              !onView && "first:rounded-l-lg",
              // Round right if last
              !onDelete && "rounded-r-lg border-r"
            )}
            title="Edit"
          >
             <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
          </Button>
        )}

        {onDelete && (
          <Button
            intent="ghost"
            size="icon"
            onClick={() => onDelete(data)}
            className={cn(
              "2xl:size-9 3xl:size-10 rounded-none last:rounded-r-lg border border-table-stroke",
              "bg-background text-muted-foreground", // Using muted-foreground for gray text
              "hover:bg-status-6-bg/10 hover:text-status-6-text hover:border-status-6-bg/20 dark:hover:bg-status-6-bg/20",
              "transition-all duration-200 focus:z-10",
              // If it's the only button, round left side too
              !onView && !onEdit && "rounded-l-lg border-l"
            )}
            title="Delete"
          >
            <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default DesktopActionButtons;


