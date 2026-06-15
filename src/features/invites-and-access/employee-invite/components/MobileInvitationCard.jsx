import * as React from "react";
import { cn, formatDate } from "@/lib/utils";
import ClockIcon from "@/assets/access/employee-invitation/clock.svg?react";
import ProfileTickIcon from "@/assets/access/employee-invitation/profile-tick.svg?react";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";
export function EmployeeInvitationCard({
  name,
  department,
  email,
  status = "pending",
  date,
  onRevoke,
  onResend,
  className,
  serial,
}) {
  const isPending = status === "pending";

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
          "flex items-center justify-between p-4",
          isPending ? "pb-2" : "pb-4"
        )}
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold">
            {serial}. {name}
          </h3>
          <div>
            <p className="text-xs text-lighter-text">
              {department} | {email}
            </p>
            {date && (
              <p className="text-xs font-semibold text-foreground">
                Invited on {formatDate(date)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-shade-2 shrink-0">
          {isPending ? (
            <ClockIcon className="w-5 h-5 text-nav-highlight" />
          ) : (
            <ProfileTickIcon className="w-5 h-5 text-nav-highlight" />
          )}
        </div>
      </div>
      {isPending ? (
        <div className="h-[0.1px] bg-table-stroke mx-4 mb-2"></div>
      ) : null}
      {/* Conditional Footer for Pending Invitations */}
      {isPending && (
        <div className="flex items-center gap-5 px-4 pt-2 pb-4 ">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            className=" flex-1 flex items-center justify-center gap-2 h-9 px-3 text-sm font-semibold text-[#552e8e] dark:text-white hover:bg-primary/10 bg-primary-shade-2 rounded-md"
          >
            <svg className="action-button-icon w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
            Revoke
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResend}
            className="flex-1 flex items-center justify-center gap-2 h-9 px-3 text-sm font-semibold text-[#552e8e] dark:text-white hover:bg-primary/10 bg-primary-shade-2 rounded-md"
          >
            <Send className="action-button-icon w-4 h-4" />
            Resend
          </Button>
        </div>
      )}
    </div>
  );
}


