import { EmployeeInvitationCard } from "./MobileInvitationCard";
import { NoData } from "@/components/ui/NoData";

export function MobileInvitationList({
  searchResults = [],
  isSearching,
  searchError, // eslint-disable-line no-unused-vars
  errorMessage,
  hasError,
  onRetry, // eslint-disable-line no-unused-vars
  selectedFilter,
  searchTerm,
  onRevoke,
  onResend,
}) {
  const formattedFilter =
    selectedFilter && selectedFilter !== "all"
      ? selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)
      : null;

  if (isSearching) {
    return (
      <p className="mt-4 text-sm md:hidden text-muted-foreground">
        Searching...
      </p>
    );
  }


  if (!searchResults || searchResults.length === 0) {
    const trimmedTerm = searchTerm?.trim();
    const noDataMessage = "No Records Found";
    const noDataDescription = `No invitations found${formattedFilter ? ` for ${formattedFilter} status` : ""}${trimmedTerm ? ` matching "${trimmedTerm}"` : ""}.`;
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
    <div className="mt-6 space-y-3 md:hidden">
      {searchResults.map((invitation, index) => {
        const departmentLabel =
          invitation.department || invitation.roleId?.name || "Department N/A";

        const handleRevoke = () => {
          onRevoke?.(invitation);
        };

        const handleResend = () => {
          onResend?.(invitation);
        };

        return (
          <EmployeeInvitationCard
            key={invitation._id}
            serial={index + 1}
            name={invitation.name}
            department={departmentLabel}
            email={invitation.email}
            status={invitation.status?.toLowerCase() ?? "pending"}
            date={invitation.createdAt}
            onRevoke={handleRevoke}
            onResend={handleResend}
          />
        );
      })}
    </div>
  );
}
