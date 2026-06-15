import React from "react";
import { cn } from "@/lib/utils";
import GlobalStatusBadge from "@/components/ui/StatusBadge";

export const statusColors = {
    // This can be kept as a mapping if needed by PaginatedTable colorMap prop, 
    // but the new StatusBadge handles this via getStatusColor fallback
    "Not Started": "bg-gray-100 text-gray-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Approved": "bg-green-100 text-green-700",
    "Rework": "bg-orange-100 text-orange-700",
    "Completed": "bg-emerald-100 text-emerald-700",
};

export const StatusBadge = ({ status, size = "sm", isNotAvailable = false, statusChangedAt = null }) => {
    return (
        <GlobalStatusBadge
            status={status}
            size={size}
            isNotAvailable={isNotAvailable}
            statusChangedAt={statusChangedAt}
        />
    );
};

export const hasSection = (project, sectionName) => {
    if (!project || typeof project !== 'object') {
        return false;
    }
    const section = project[sectionName];
    return section !== undefined && section !== null && typeof section === 'object';
};