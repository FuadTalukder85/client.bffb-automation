import * as React from "react";
import { cn } from "@/lib/utils";
import ClockIcon from "@/assets/access/employee-invitation/clock.svg?react";
import ProfileTickIcon from "@/assets/access/employee-invitation/profile-tick.svg?react";
import { FaUserLarge } from "react-icons/fa6";

export function DesktopTeamFormationRow({
  name,
  index,
  department,
  email,
  status = "pending",
  className,
}) {
  const isPending = status === "pending";

  return (
    <div
      className={cn(
        "flex gap-4 w-full items-center transition-all justify-between rounded-xl px-4 py-3 md:rounded-full  border bg-transparent border-border dark:drop-shadow-xs 2xl:px-6 3xl:px-8 2xl:py-4 3xl:py-5",
        className
      )}
    >
      {/* <div className="hidden p-3 transition-all rounded-full md:flex bg-primary-shade-2">
        <FaUserLarge className=" size-4 xl:size-5 2xl:size-6 3xl:size-7 text-primary" />
      </div> */}

      {/* Index */}
      <div className="items-center justify-center hidden w-10 h-10 md:flex rounded-3xl bg-primary-shade-2 shrink-0">
        <p className="text-sub-heading text-invite-status-text">{index + 1}</p>
      </div>

      {/* User Info */}
      <div className="flex flex-col flex-1">
        <h3 className="transition-all text-body">{name}</h3>
        <p className="text-sub-text text-foreground/50">
          {department} | {email}
        </p>
      </div>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg md:hidden bg-primary-shade-2 shrink-0">
        {isPending ? (
          <ClockIcon className="w-5 h-5 text-nav-highlight" />
        ) : (
          <ProfileTickIcon className="w-5 h-5 text-nav-highlight" />
        )}
      </div>

      {/* Pill Buttons for status */}
      <div className="items-center justify-center hidden w-40 rounded-full md:flex bg-invite-status-bg ">
        <p className="py-3 font-semibold capitalize text-invite-status-text text-sub-text ">
          {status}
        </p>
      </div>
    </div>
  );
}
