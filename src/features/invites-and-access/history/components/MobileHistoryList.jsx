import React, { useMemo } from "react";
import MobileHistoryCard from "./MobileHistoryCard";
import { NoData } from "@/components/ui/NoData";

// Utility function to format filter name
const formatFilterName = (filter) => {
  return filter && filter !== "all"
    ? filter.charAt(0).toUpperCase() + filter.slice(1)
    : null;
};

const MobileHistoryList = ({
  historyData = [],
  isSearching,
  searchError, // eslint-disable-line no-unused-vars
  errorMessage,
  hasError,
  onRetry,
  selectedFilter,
  searchTerm,
  onView,
}) => {
  // Memoize formatted filter to avoid recalculation
  const formattedFilter = useMemo(
    () => formatFilterName(selectedFilter),
    [selectedFilter]
  );

  // Memoize trimmed search term
  const trimmedSearchTerm = useMemo(() => searchTerm?.trim(), [searchTerm]);

  // Memoize empty state message
  const emptyStateMessage = useMemo(() => {
    let message = "No history found";
    if (formattedFilter) message += ` for ${formattedFilter} type`;
    if (trimmedSearchTerm) message += ` matching "${trimmedSearchTerm}"`;
    return message + ".";
  }, [formattedFilter, trimmedSearchTerm]);

  if (isSearching) {
    return (
      <p className="mt-4 text-sm text-center text-muted-foreground md:hidden">
        Searching...
      </p>
    );
  }

  if (!historyData || historyData.length === 0) {
    if (hasError) {
      return (
        <div className="md:hidden">
          <div className="py-10 text-center text-red-500">
            {errorMessage}
          </div>
        </div>
      );
    }
    return (
      <div className="md:hidden">
        <NoData message="No Records Found" description={emptyStateMessage} />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 md:hidden">
      {historyData.map((history, index) => (
        <MobileHistoryCard
          key={history._id || history.id || index}
          serial={index + 1}
          history={history}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default MobileHistoryList;
