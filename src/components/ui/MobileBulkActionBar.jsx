import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * A reusable sticky bulk action bar for mobile views.
 *
 * @param {Object} props
 * @param {number} props.selectedCount - Number of selected items.
 * @param {Function} props.onCancel - Callback when cancel button is clicked.
 * @param {Function} props.onAction - Callback when bulk action button is clicked.
 * @param {string} [props.actionLabel="Archive"] - Label for primary action button.
 * @param {React.ComponentType} [props.actionIcon=Trash2] - Lucide icon for action button.
 * @param {string} [props.actionButtonClassName="bg-red-600 hover:bg-red-700 text-white"] - Custom styling for action button.
 */
export default function MobileBulkActionBar({
  selectedCount,
  onCancel,
  onAction,
  actionLabel = "Archive",
  actionIcon: ActionIcon = Trash2,
  actionButtonClassName = "bg-red-600 hover:bg-red-700 text-white",
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col md:flex-row items-center gap-2.5 md:gap-4 px-5 md:px-6 py-3 md:py-3 rounded-2xl md:rounded-full bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl animate-in slide-in-from-bottom duration-300 w-[90%] max-w-[340px] md:w-auto md:max-w-none md:hidden">
      <span className="text-xs md:text-sm font-semibold text-foreground text-center">
        {selectedCount} item(s) selected
      </span>
      <div className="hidden md:block w-px h-5 bg-border" />
      <div className="flex items-center justify-center gap-2 w-full md:w-auto">
        <Button
          size="sm"
          intent="outline"
          className="rounded-full text-xs font-semibold px-4 h-8 cursor-pointer flex-1 md:flex-none"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          intent="primary"
          className={`rounded-full text-xs font-semibold px-4 h-8 flex items-center justify-center gap-1.5 cursor-pointer border-none flex-1 md:flex-none ${actionButtonClassName}`}
          onClick={onAction}
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
