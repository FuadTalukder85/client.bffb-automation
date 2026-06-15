import React from "react";
import MobileAccessRoleCard from "./MobileAccessRoleCard";
import { NoData } from "@/components/ui/NoData";

const MobileAccessRoleList = ({
  searchResults = [],
  isSearching,
  searchError, // eslint-disable-line no-unused-vars
  errorMessage,
  hasError,
  onRetry, // eslint-disable-line no-unused-vars
  selectedFilter,
  searchTerm,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const formattedFilter =
    selectedFilter && selectedFilter !== "all"
      ? selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)
      : null;

  if (isSearching) {
    return (
      <p className="mt-4 text-sm text-center text-muted-foreground md:hidden">
        Searching...
      </p>
    );
  }


  if (!searchResults || searchResults.length === 0) {
    const trimmedTerm = searchTerm?.trim();
    const noDataMessage = "No Records Found";
    const noDataDescription = `No roles found${formattedFilter ? ` for ${formattedFilter} status` : ""}${trimmedTerm ? ` matching "${trimmedTerm}"` : ""}.`;
    return (
      <div className="md:hidden">
        {hasError ? (
          <div className="py-10 text-center text-red-500">
            {errorMessage}
          </div>
        ) : (
          <NoData message={noDataMessage} description={noDataDescription} />
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 md:hidden">
      {searchResults.map((role, index) => (
        <MobileAccessRoleCard
          key={role.id}
          serial={index + 1}
          role={role}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
};

export default MobileAccessRoleList;
