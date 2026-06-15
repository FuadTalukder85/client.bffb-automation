import { DesktopInvitationRow } from "./DesktopInvitationRow";
import { Skeleton } from "@/components/ui/Skeleton";

export function DesktopInvitationList({
  searchResults = [],
  isSearching,
  searchError,
  onRetry,
  selectedFilter,
  searchTerm,
}) {
  const formattedFilter =
    selectedFilter && selectedFilter !== "all"
      ? selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)
      : null;

  // Loading skeleton
  if (isSearching) {
    return (
      <div className="hidden px-3 pb-8 border md:block bg-background rounded-xl border-border">
        <div className="my-4 2xl:my-6 3xl:my-8">
          <h2 className="px-4 text-sub-heading">Employees Invited</h2>
        </div>
        <div className="space-y-3 max-h-[50dvh] 2xl:max-h-[55dvh] overflow-y-auto custom-scrollbar">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between w-full gap-4 px-4 py-3 bg-transparent border rounded-xl md:rounded-full border-border 2xl:px-6 3xl:px-8 2xl:py-4 3xl:py-5"
            >
              <div className="hidden p-3 rounded-full md:flex bg-primary-shade-2">
                <Skeleton className="rounded-full size-4 xl:size-5 2xl:size-6 3xl:size-7" />
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <Skeleton className="w-48 h-5" />
                <Skeleton className="w-64 h-4" />
              </div>
              <div className="items-center justify-center hidden w-40 rounded-full md:flex bg-invite-status-bg">
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="hidden w-full mx-auto text-sm text-center text-red-500 md:block">
        <p>Error: {searchError?.response?.data?.error || searchError?.message || "Failed to load invitations"}</p>
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
      <div className="w-full mx-auto text-center">
        <p className="hidden text-sm text-center md:block text-muted-foreground">
          No invitations found
          {formattedFilter ? ` for ${formattedFilter} status` : ""}
          {trimmedTerm ? ` matching "${trimmedTerm}"` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="hidden px-3 pb-8 border md:block bg-background rounded-xl border-border">
      <div className="my-4 2xl:my-6 3xl:my-8">
        <h2 className="px-4 text-sub-heading">Employees Invited</h2>
      </div>

      {/* Invitation List */}
      <div className="space-y-3  max-h-[50dvh]  2xl:max-h-[55dvh] overflow-y-auto custom-scrollbar">
        {searchResults.map((invitation, index) => {
          const departmentLabel =
            invitation.department ||
            invitation.roleId?.name ||
            "Department N/A";
          return (
            <DesktopInvitationRow
              key={invitation._id}
              index={index}
              name={invitation.name}
              department={departmentLabel}
              email={invitation.email}
              status={invitation.status?.toLowerCase() ?? "pending"}
            />
          );
        })}
      </div>
    </div>
  );
}
