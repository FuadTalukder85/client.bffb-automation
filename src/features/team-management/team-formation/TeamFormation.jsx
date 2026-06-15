import PageHeader from "@/components/common/page-header";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTeams } from "@/hooks/useTeams";
import {
  useArchiveTeam,
  useRestoreTeam,
  useCreateTeam,
  useAddTeamMember,
} from "@/hooks/mutations/useTeamMutations";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { Plus } from "lucide-react";
import { MobileTeamFormationList } from "./components/MobileTeamFormationList";
import { DesktopTeamFormationTable } from "./components/DesktopTeamFormationTable";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Pagination } from "@/components/ui/Pagination";
import { ViewTeamModal } from "./components/ViewTeamModal";
import { DesktopViewTeamModal } from "./components/DesktopViewTeamModal";
import { ArchiveTeamModal } from "./components/ArchiveTeamModal";
import { CreateTeamModal } from "./components/CreateTeamModal";
import { DesktopCreateTeamModal } from "./components/DesktopCreateTeamModal";
import { RestoreTeamModal } from "./components/RestoreTeamModal";
import { ConfirmCreateTeamModal } from "./components/ConfirmCreateTeamModal";
import { useNavigate } from "react-router";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { toast } from "sonner";

const getErrorMessage = (error, fallback) => {
  const message =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback;
  return typeof message === "object"
    ? message.message || JSON.stringify(message)
    : message;
};

function TeamFormation() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isViewTeamModalOpen, setIsViewTeamModalOpen] = useState(false);
  const [isArchiveTeamModalOpen, setIsArchiveTeamModalOpen] = useState(false);
  const [isRestoreTeamModalOpen, setIsRestoreTeamModalOpen] = useState(false);
  const [isConfirmCreateTeamModalOpen, setIsConfirmCreateTeamModalOpen] =
    useState(false);
  const [teamFormData, setTeamFormData] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch teams from API using TanStack Query
  const {
    data: teamsData,
    isLoading,
    error,
  } = useTeams({
    searchTerm: debouncedSearchTerm,
    statusFilter: selectedFilter,
    page: currentPage,
    limit: itemsPerPage,
  });

  const errorMessage = error
    ? error?.response?.data?.error || error?.response?.data?.message || error?.message || "Failed to load teams"
    : "";
  const hasError = Boolean(errorMessage);

  // Normalize data from TanStack Query result
  const teams = teamsData?.data || [];
  const pagination = teamsData?.pagination;

  // Mutation hooks for CRUD operations
  const { mutateAsync: archiveTeam } = useArchiveTeam();
  const { mutateAsync: restoreTeam } = useRestoreTeam();
  const { mutateAsync: createTeam } = useCreateTeam();
  const { mutateAsync: addTeamMembers } = useAddTeamMember();

  // Calculate total pages from API pagination
  const totalPages = pagination?.totalPages || 1;
  const noDataMessage = "No Records Found";
  const noDataDescription = debouncedSearchTerm?.trim()
    ? `No records match "${debouncedSearchTerm.trim()}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";

  const filterOptions = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
    { label: "All", value: "all" },
  ];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setIsViewTeamModalOpen(true);
  };

  const handleEditTeam = (team) => {
    navigate(`/team-formation/${team._id || team.id}`);
  };

  const handleArchiveTeam = (team) => {
    setSelectedTeam(team);
    setIsArchiveTeamModalOpen(true);
  };

  const handleConfirmArchive = async (team) => {
    try {
      await archiveTeam(team._id || team.id);
      // Cache is automatically invalidated by the mutation hook
    } catch (error) {
      console.error("Failed to archive team:", error);
      toast.error(
        getErrorMessage(error, "Failed to archive team. Please try again.")
      );
    }
  };

  const handleRestoreTeam = (team) => {
    setSelectedTeam(team);
    setIsRestoreTeamModalOpen(true);
  };

  const handleConfirmRestore = async (team) => {
    try {
      await restoreTeam(team._id || team.id);
      // Cache is automatically invalidated by the mutation hook
    } catch (error) {
      console.error("Failed to restore team:", error);
      toast.error(
        getErrorMessage(error, "Failed to restore team. Please try again.")
      );
    }
  };

  const handleCreateTeam = () => {
    // Cache is automatically invalidated when modal uses mutation hooks
  };

  const handleCreateTeamNext = (data) => {
    setTeamFormData(data);
    setIsCreateTeamModalOpen(false);
    setIsConfirmCreateTeamModalOpen(true);
  };

  const handleConfirmCreateTeamCancel = () => {
    setIsConfirmCreateTeamModalOpen(false);
    setIsCreateTeamModalOpen(true);
  };

  const handleConfirmCreateTeam = async () => {
    if (!teamFormData) {
      console.error("No team form data found");
      toast.error("Team data not found. Please try again.");
      return;
    }

    try {
      // Step 1: Create the team using mutation hook
      const teamResponse = await createTeam({
        name: teamFormData.name,
      });

      const createdTeam = teamResponse?.data;

      // Step 2: Add members to the team if any selected
      if (
        teamFormData.members &&
        teamFormData.members.length > 0 &&
        createdTeam?._id
      ) {
        const userIds = teamFormData.members.map((m) => m._id || m.id);
        await addTeamMembers({
          teamId: createdTeam._id,
          userIds: userIds,
        });
      }

      setIsConfirmCreateTeamModalOpen(false);
      setTeamFormData(null);
      // Cache is automatically invalidated by the mutation hook - no need for refetch()
    } catch (err) {
      console.error("Failed to create team:", err);
      toast.error(
        getErrorMessage(err, "Failed to create team. Please try again.")
      );
      // Optionally handle error (e.g. show toast or reopen modal with error)
      // For now, we might want to go back to the create modal to show the error
      setIsConfirmCreateTeamModalOpen(false);
      setIsCreateTeamModalOpen(true);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top of the list when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const listProps = {
    teams,
    isLoading,
    error,
    errorMessage,
    hasError,
    selectedFilter,
    searchTerm: debouncedSearchTerm,
    onView: handleViewTeam,
    onEdit: handleEditTeam,
    onArchive: handleArchiveTeam,
    onRestore: handleRestoreTeam,
    currentPage,
    itemsPerPage,
    totalPages,
    onPageChange: handlePageChange,
    onItemsPerPageChange: handleItemsPerPageChange,
    noDataMessage,
    noDataDescription,
  };

  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      {/* Page Header & Search & Theme Toggle(Desktop Only) */}
      <div className="flex-none flex items-center justify-between ms-0 lg:ms-5">
        <PageHeader
          title="Team Formation"
          className={"text-heading py-4 md:p-0 md:m-0"}
        />

        <FloatingButton
          className={"md:hidden static m-0"}
          icon={Plus}
          onClick={() => {
            setTeamFormData(null);
            setIsCreateTeamModalOpen(true);
          }}
        >
          Create Team
        </FloatingButton>

        {/* Search & Theme Toggle(Desktop Only) */}
        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="Search teams..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Filter Input */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search teams..."
        filterValue={selectedFilter}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        hideOnDesktop={true}
        defaultFilterValue="active"
      />

      {/* Desktop Filter Input */}
      <div className="flex-none hidden md:block ms-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        {/* Filter and Create Invite Button */}
        <div className="flex items-center justify-between">
          <DesktopFilterPills
            value={selectedFilter}
            options={filterOptions}
            onChange={handleFilterChange}
          />

          <FloatingButton
            className={
              "hidden md:flex md:static lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-3 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium rounded-full gap-0 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2"
            }
            icon={Plus}
            onClick={() => {
              setTeamFormData(null);
              setIsCreateTeamModalOpen(true);
            }}
          >
            Create Team
          </FloatingButton>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0">
        {/* Mobile UI */}
        <MobileTeamFormationList {...listProps} />

        {/* Desktop UI */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
          <DesktopTeamFormationTable 
            {...listProps} 
            emptyState={
              hasError ? (
                <div className="py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : null
            }
          />
        </div>
      </div>

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}

      {/* Modals */}
      {/* Mobile Create Team Modal */}
      {!isDesktop && (
        <CreateTeamModal
          open={isCreateTeamModalOpen}
          onOpenChange={setIsCreateTeamModalOpen}
          onSuccess={handleCreateTeam}
        />
      )}
      {/* Desktop Create Team Modal */}
      {isDesktop && (
        <>
          <DesktopCreateTeamModal
            open={isCreateTeamModalOpen}
            onOpenChange={setIsCreateTeamModalOpen}
            onNext={handleCreateTeamNext}
            initialData={teamFormData}
          />
          <ConfirmCreateTeamModal
            open={isConfirmCreateTeamModalOpen}
            onOpenChange={setIsConfirmCreateTeamModalOpen}
            onConfirm={handleConfirmCreateTeam}
            onCancel={handleConfirmCreateTeamCancel}
          />
        </>
      )}

      {/* Mobile View Team Modal */}
      {!isDesktop && (
        <ViewTeamModal
          open={isViewTeamModalOpen}
          onOpenChange={setIsViewTeamModalOpen}
          team={selectedTeam}
        />
      )}
      {/* Desktop View Team Modal */}
      {isDesktop && (
        <DesktopViewTeamModal
          open={isViewTeamModalOpen}
          onOpenChange={setIsViewTeamModalOpen}
          team={selectedTeam}
        />
      )}
      <ArchiveTeamModal
        open={isArchiveTeamModalOpen}
        onOpenChange={setIsArchiveTeamModalOpen}
        team={selectedTeam}
        onConfirm={handleConfirmArchive}
      />
      <RestoreTeamModal
        open={isRestoreTeamModalOpen}
        onOpenChange={setIsRestoreTeamModalOpen}
        team={selectedTeam}
        onConfirm={handleConfirmRestore}
      />
    </section>
  );
}

export default TeamFormation;
