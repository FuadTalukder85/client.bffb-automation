import { MobileTeamFormationCard } from "./MobileTeamFormationCard";
import { NoData } from "@/components/ui/NoData";

export function MobileTeamFormationList({
  teams = [],
  isLoading,
  selectedFilter,
  searchTerm,
  noDataMessage,
  noDataDescription,
  onView,
  onEdit,
  onArchive,
  onRestore,
  currentPage = 1,
  itemsPerPage = 20,
  errorMessage,
  hasError,
  selectedRowIds = [],
  onSelectChange,
}) {
  const serialOffset = (currentPage - 1) * itemsPerPage;
  const formattedFilter =
    selectedFilter && selectedFilter !== "all"
      ? selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)
      : null;

  if (isLoading) {
    return (
      <p className="mt-4 text-sm md:hidden text-muted-foreground">
        Loading teams...
      </p>
    );
  }

  if (!teams || teams.length === 0) {
    const trimmedTerm = searchTerm?.trim();
    const resolvedNoDataMessage = noDataMessage || "No Records Found";
    const resolvedNoDataDescription =
      noDataDescription ||
      `No teams found${formattedFilter ? ` for ${formattedFilter} status` : ""}${trimmedTerm ? ` matching "${trimmedTerm}"` : ""}.`;
    return (
      <div className="md:hidden">
        {hasError ? (
          <div className="flex items-center justify-center py-10 text-center text-red-500">
            {errorMessage}
          </div>
        ) : (
          <NoData message={resolvedNoDataMessage} description={resolvedNoDataDescription} />
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3 md:hidden">
      {teams.map((team, index) => {
        const handleView = () => {
          onView?.(team);
        };

        const handleEdit = () => {
          onEdit?.(team);
        };

        const handleArchive = () => {
          onArchive?.(team);
        };

        const handleRestore = () => {
          onRestore?.(team);
        };

        return (
          <MobileTeamFormationCard
            key={team._id || team.id || index}
            serial={serialOffset + index + 1}
            name={team.name}
            isActive={team.isActive}
            onView={handleView}
            onEdit={handleEdit}
            onArchive={handleArchive}
            onRestore={handleRestore}
            teamId={team._id || team.id}
            selectedRowIds={selectedRowIds}
            onSelectChange={onSelectChange}
          />
        );
      })}
    </div>
  );
}
