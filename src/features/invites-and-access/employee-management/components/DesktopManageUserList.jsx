import React from "react";
import DesktopManageUserCard from "./DesktopManageUserCard";

const DesktopManageUserList = ({
  searchResults = [],
  isSearching,
  searchError,
  onRetry,
  selectedFilter,
  searchTerm,
}) => {
  const formattedFilter =
    selectedFilter && selectedFilter !== "all"
      ? selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)
      : null;

  if (isSearching) {
    return (
      <p className="mt-4 text-sm text-center text-muted-foreground hidden md:block">
        Searching...
      </p>
    );
  }

  if (searchError) {
    return (
      <div className="mt-4 text-sm text-red-500 hidden md:block">
        <p>Error: {searchError?.response?.data?.error || searchError?.message || "Failed to load users"}</p>
        {onRetry ? (
          <button
            type="button"
            className="mt-2 text-xs text-primary underline-offset-2 hover:underline"
            onClick={onRetry}
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (!searchResults || searchResults.length === 0) {
    const trimmedTerm = searchTerm?.trim();
    return (
      <p className="mt-4 text-sm text-center text-muted-foreground hidden md:block">
        No employees found
        {formattedFilter ? ` for ${formattedFilter} status` : ""}
        {trimmedTerm ? ` matching "${trimmedTerm}"` : ""}.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4 hidden md:block">
      {searchResults.map((user) => (
        <DesktopManageUserCard key={user.id || user._id} user={user} />
      ))}
    </div>
  );
};

export default DesktopManageUserList;
