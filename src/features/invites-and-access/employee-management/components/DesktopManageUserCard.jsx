import React from "react";
import { cn } from "@/lib/utils";
import { User, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DesktopManageUserCard = ({ user, className }) => {
  return (
    <div
      className={cn(
        "flex gap-4 w-full items-center transition-all justify-between rounded-xl bg-white p-4 border border-gray-100 shadow-sm",
        className
      )}
    >
      {/* User Icon */}
      <div className="flex rounded-full p-3 bg-primary-shade-2 transition-all">
        <User className="size-6 text-primary" />
      </div>

      {/* User Info */}
      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <p className="text-sm text-foreground/50">
          {user.designation} | {user.email}
        </p>
      </div>

      {/* Department */}
      {user.department && (
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-xs text-gray-400">Department</span>
          <span className="text-sm font-medium">{user.department}</span>
        </div>
      )}

      {/* Role */}
      {user.role && (
        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-xs text-gray-400">Role</span>
          <span className="text-sm font-medium">{user.role}</span>
        </div>
      )}

      {/* Join Date */}
      {user.joinDate && (
        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-xs text-gray-400">Join Date</span>
          <span className="text-sm font-medium">{user.joinDate}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {user.canView && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg border border-primary-shade-2 text-primary hover:bg-primary-shade-2"
          >
            <Eye className="action-button-icon" />
          </Button>
        )}
        {user.canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg border border-primary-shade-2 text-primary hover:bg-primary-shade-2"
          >
            <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
          </Button>
        )}
        {user.canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
          >
            <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DesktopManageUserCard;


