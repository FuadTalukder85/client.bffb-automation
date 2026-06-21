import React from "react";
import MobileManageUserCard from "./MobileManageUserCard";
import { NoData } from "@/components/ui/NoData";

const MobileManageUserList = ({
  searchResults = [],
  isSearching,
  searchError,
  errorMessage,
  hasError,
  onRetry,
  selectedFilter,
  searchTerm,
  onEdit,
  onDelete,
  onReactivate,
  onUpdatePassword,
  onUnblock,
  canUpdatePassword = false,
  canDeleteUser = false,
  canUnblockUser = false,
  selectedRowIds = [],
  onSelectChange,
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
    const noDataDescription = `No employees found${formattedFilter ? ` for ${formattedFilter} status` : ""}${trimmedTerm ? ` matching "${trimmedTerm}"` : ""}.`;
    return (
      <div className="md:hidden">
        {hasError ? (
          <div className="flex items-center justify-center py-10 text-center text-red-500">
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
      {searchResults.map((user,index) => (
        <MobileManageUserCard
          key={user.id || user._id}
          serial={index+1}
          user={user}
          selectedFilter={selectedFilter}
          onEdit={onEdit}
          onDelete={onDelete}
          onReactivate={onReactivate}
          onUpdatePassword={onUpdatePassword}
          onUnblock={onUnblock}
          canUpdatePassword={canUpdatePassword}
          canDeleteUser={canDeleteUser}
          canUnblockUser={canUnblockUser}
          selectedRowIds={selectedRowIds}
          onSelectChange={onSelectChange}
        />
      ))}
    </div>
  );
};

export default MobileManageUserList;
