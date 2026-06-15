import React from "react";
import { ExportModal } from "@/components/ui/ExportModal";

export function ExportProjectsModal({
    open,
    onOpenChange,
    selectedLimit,
    onLimitChange,
    selectedPage = 1,
    onPageChange,
    totalItems = 0,
    onConfirm,
    isLoading = false,
    className,
}) {
    return (
        <ExportModal
            open={open}
            onOpenChange={onOpenChange}
            title="Export Projects"
            description="Select how many projects to export based on the current filters."
            selectedLimit={selectedLimit}
            onLimitChange={onLimitChange}
            selectedPage={selectedPage}
            onPageChange={onPageChange}
            totalItems={totalItems}
            onConfirm={onConfirm}
            isLoading={isLoading}
            className={className}
        />
    );
}
