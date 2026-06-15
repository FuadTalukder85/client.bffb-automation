import React from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";

export function TaskAssignmentList({
  tasksToCreate,
  projectMembers,
  getTaskValues,
  onTaskChange,
  showDatesPerTask = true,
  getPlaceholder = (title) => `Task instructions for ${title}`,
}) {
  return (
    <div className="flex flex-col gap-1 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 px-1 pb-2 lg:pb-2.5 xl:pb-3 2xl:pb-3.5 3xl:pb-4">
      {tasksToCreate.map((task, index) => {
        const filteredMembers = projectMembers.filter((m) =>
          (m.responsibilities || []).includes(task.responsibility)
        );
        const hasNoMembers = filteredMembers.length === 0;

        const taskValues = getTaskValues(task.title);

        // Don't show data if disabled
        const displayDescription = hasNoMembers ? "" : (taskValues?.description || "");
        const displayStartDate = hasNoMembers ? "" : (taskValues?.startDate || "");
        const displayDueDate = hasNoMembers ? "" : (taskValues?.dueDate || "");

        return (
          <div key={task.title} className={cn("flex flex-col gap-1 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 ", index !== 0 && "pt-2 lg:pt-2 xl:pt-2.5 2xl:pt-3 3xl:pt-4 border-t border-border")}>
            <div>
              <div className="md:flex items-center justify-between gap-4">
                <span className="text-sm lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-sm font-semibold text-foreground flex-1 pr-2 break-words">
                  {task.title}
                </span>
                <div className="w-[240px] lg:w-[180px] xl:w-[200px] 2xl:w-[240px] 3xl:w-[280px] flex-shrink-0">
                  <div className="flex h-8 lg:h-6 xl:h-7.5 2xl:h-8.5 w-full items-center bg-gray-200/50 dark:bg-gray-700/50 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 rounded-lg text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-foreground/80 cursor-not-allowed select-none border border-border truncate">
                    {filteredMembers.length > 0
                      ? filteredMembers.map(m => m.user?.name || "Unknown").join(", ")
                      : "No members"}
                  </div>
                </div>
              </div>
              {hasNoMembers && (
                <div className="text-[10px] lg:text-[6px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] text-red-500 font-semibold leading-normal mt-1 text-right">
                  ⚠ Please assign this responsibility badge to a project member first to enable task assignment.
                </div>
              )}
            </div>

            {/* Instruction */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs lg:text-[7.5px] xl:text-[9.5px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground font-normal">
                Task Instruction <span className="text-[10px] lg:text-[6px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] text-muted-foreground/60">(Optional)</span>
              </label>
              <textarea
                value={displayDescription}
                onChange={(e) => onTaskChange(task.title, "description", e.target.value)}
                placeholder={hasNoMembers ? "" : getPlaceholder(task.title)}
                // rows={2}
                disabled={hasNoMembers}
                className={cn(
                  "w-full border border-border bg-background rounded-lg p-2 lg:p-1 xl:p-1.5 2xl:p-2 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[50px] lg:min-h-[35px] xl:min-h-[42px] 2xl:min-h-[50px] resize-none",
                  hasNoMembers && "opacity-50 cursor-not-allowed bg-muted/20"
                )}
              />
            </div>

            {/* Dates */}
            {showDatesPerTask && (
              <div className="grid grid-cols-2 gap-4 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs lg:text-[7.5px] xl:text-[9.5px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground font-normal">
                    Start Date
                  </label>
                  <DatePicker
                    value={displayStartDate}
                    onChange={(e) => onTaskChange(task.title, "startDate", e.target.value)}
                    disabled={hasNoMembers}
                    addProject={true}
                    className="w-full h-8 lg:h-6 xl:h-7.5 2xl:h-8.5"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs lg:text-[7.5px] xl:text-[9.5px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground font-normal">
                    End Date <span className="text-[10px] lg:text-[6px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] text-muted-foreground/60">(Optional)</span>
                  </label>
                  <DatePicker
                    value={displayDueDate}
                    onChange={(e) => onTaskChange(task.title, "dueDate", e.target.value)}
                    disabled={hasNoMembers}
                    addProject={true}
                    className="w-full h-8 lg:h-6 xl:h-7.5 2xl:h-8.5"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
