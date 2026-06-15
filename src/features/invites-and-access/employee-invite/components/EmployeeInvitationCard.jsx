import * as React from "react";
import { cn } from "@/lib/utils";
import ClockIcon from "@/assets/access/employee-invitation/clock.svg?react";
import ProfileTickIcon from "@/assets/access/employee-invitation/profile-tick.svg?react";
import { FaUserLarge } from "react-icons/fa6";
export function EmployeeInvitationCard({
  name,
  department,
  email,
  status = "pending",
  className,
}) {
  const isPending = status === "pending";
  return (

    
    <div
      className={cn(
        "flex md:hidden w-full items-center justify-between rounded-xl bg-background p-4  border border-table-stroke transition-colors dark:drop-shadow-table-stroke dark:drop-shadow-xs",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold ">{name}</h3>
        <p className="text-xs text-foreground/50">
          {department} | {email}
        </p>
      </div>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-shade-2 shrink-0">
        {isPending ? (
          <ClockIcon className="w-5 h-5 text-nav-highlight" />
        ) : (
          <ProfileTickIcon className="w-5 h-5 text-nav-highlight" />
        )}
      </div>
    </div>
  
   
  );
}