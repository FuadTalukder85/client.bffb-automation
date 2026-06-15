import React from "react";
import { Trash2, Pencil } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";

export default function MobileTagCard({
    tag,
    serialNumber,
    onEdit,
    onArchive,
    onRestore,
    className,
}) {
    const isActive = tag.isActive;

    // Define button configurations for active tags
    const activeTagButtons = [
        {
            key: "edit",
            icon: (props) => <svg {...props} className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>,
            onClick: () => onEdit?.(tag),
            title: "Edit",
            className:
                "rounded-r-none flex-1 dark:text-nav-highlight text-lighter-text hover:bg-primary/10 bg-transparent",
        },
        {
            key: "archive",
            icon: (props) => <svg {...props} className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>,
            onClick: () => onArchive?.(tag),
            title: "Delete",
            className:
                "rounded-l-none flex-1 text-[#552e8e] dark:text-white hover:bg-primary/10 bg-primary-shade-2",
        },
    ];

    return (
        <div
            className={cn(
                "flex md:hidden w-full flex-col rounded-xl bg-background border border-table-stroke transition-colors dark:drop-shadow-table-stroke dark:drop-shadow-xs mb-4",
                className
            )}
        >
            {/* Main Content */}
            <div
                className={cn(
                    "flex items-center justify-between p-4",
                    isActive ? "pb-2" : "pb-4"
                )}
            >
                {/* Left side - Serial */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-shade-2 text-nav-highlight shrink-0">
                        <span className="text-sm font-semibold">{serialNumber}</span>
                    </div>
                    <span className="text-sm font-semibold text-nav-highlight">{tag.name}</span>
                </div>

                {/* Right side - Restore button for inactive */}
                <div className="flex items-center gap-3">
                    {!isActive && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRestore?.(tag)}
                            className="w-10 border rounded-md text-nav-highlight h-9 border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80 shrink-0"
                            title="Restore Tag"
                        >
                            <AiFillThunderbolt className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Divider for active state */}
            {isActive && <div className="h-[0.1px] bg-table-stroke mx-4 mb-2"></div>}

            {/* Footer with action buttons - only for active tags */}
            {isActive && (
                <ButtonGroup
                    buttons={activeTagButtons}
                    className="px-4 pt-2 pb-4"
                    fullWidth
                    gap="gap-0"
                />
            )}
        </div>
    );
}


