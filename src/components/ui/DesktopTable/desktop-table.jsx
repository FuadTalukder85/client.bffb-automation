import * as React from "react";
import { cn } from "@/lib/utils";
import TruncatedText from "@/components/common/truncated-text";

const DesktopTable = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-background px-3 pb-8 rounded-xl border border-border",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DesktopTable.displayName = "DesktopTable";

const DesktopTableCaption = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-4 2xl:my-6 3xl:my-8", className)}
    {...props}
  >
    <h2 className="text-sub-heading px-4">{children}</h2>
  </div>
));
DesktopTableCaption.displayName = "DesktopTableCaption";

const DesktopTableHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "hidden md:flex w-full items-center justify-between gap-4 px-6 py-3 mb-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DesktopTableHeader.displayName = "DesktopTableHeader";

const DesktopTableHead = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sub-heading font-semibold text-left text-ellipsis whitespace-nowrap overflow-hidden",
      className
    )}
    {...props}
  >
    <TruncatedText text={children} />
  </div>
));
DesktopTableHead.displayName = "DesktopTableHead";

const DesktopTableBody = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "space-y-3 max-h-[48dvh]  3xl:max-h-[55dvh] overflow-y-auto custom-scrollbar",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DesktopTableBody.displayName = "DesktopTableBody";

const DesktopTableRow = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex gap-4 w-full items-center justify-between rounded-xl px-4 py-3 md:rounded-full border bg-transparent border-border 2xl:px-6 3xl:px-8 2xl:py-4 3xl:py-5 transition-all hover:bg-muted/5",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
DesktopTableRow.displayName = "DesktopTableRow";

const DesktopTableCell = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-body truncate flex items-center", className)}
    {...props}
  >
    {children}
  </div>
));
DesktopTableCell.displayName = "DesktopTableCell";

const DesktopTableIndex = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "hidden md:flex items-center justify-center w-10 h-10 rounded-3xl bg-primary-shade-2 shrink-0",
      className
    )}
    {...props}
  >
    <span className="text-sub-heading text-invite-status-text">{children}</span>
  </div>
));
DesktopTableIndex.displayName = "DesktopTableIndex";

const DesktopTableStatus = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "hidden md:flex w-40 rounded-full bg-invite-status-bg items-center justify-center shrink-0 text-invite-status-text",
      className
    )}
    {...props}
  >
    <p className="capitalize py-3 text-sub-text font-semibold!">
      {children}
    </p>
  </div>
));
DesktopTableStatus.displayName = "DesktopTableStatus";

export {
  DesktopTable,
  DesktopTableCaption,
  DesktopTableHeader,
  DesktopTableHead,
  DesktopTableBody,
  DesktopTableRow,
  DesktopTableCell,
  DesktopTableIndex,
  DesktopTableStatus,
};
