import React from "react";
import { cn } from "@/lib/utils";
import GlobalStatusBadge from "@/components/ui/StatusBadge";
import { masterProjectStatusOptions } from "../constants/projectOptions";

/**
 * Status Badge Component - Master Project Wrapper
 */
export const StatusBadge = ({ status, size = "lg", isNotAvailable = false, statusChangedAt = null }) => {
    // Find the matching status option for module-specific colors
    const statusOption = masterProjectStatusOptions.find(
        option => option.label === status || option.value === status
    );

    return (
        <GlobalStatusBadge
            status={status}
            size={size}
            isNotAvailable={isNotAvailable}
            statusChangedAt={statusChangedAt}
            bgColor={statusOption?.bgColor}
            textColor={statusOption?.textColor}
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

