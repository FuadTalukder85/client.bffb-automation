import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { MobileSingleTeamFormationList } from "./components/MobileSingleTeamFormationList";
// import { MobileSingleTeamFormationListSkeleton } from "./components/MobileSingleTeamFormationCardSkeleton";
import { DesktopSingleTeamFormationTable } from "./components/DesktopSingleTeamFormationTable";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { useDebounce } from "@/hooks/useDebounce";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { Plus, Loader2, ChevronRight } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { ReplaceMemberModal } from "./components/ReplaceMemberModal";
import { AddMemberModal } from "./components/AddMemberModal";
import { DesktopAddMemberModal } from "./components/DesktopAddMemberModal";
import { DesktopReassignTasksModal } from "./components/DesktopReassignTasksModal";
import { ReassignTasksModal } from "./components/ReassignTasksModal";
import { ArchiveMemberModal } from "./components/ArchiveMemberModal";
import { RestoreMemberModal } from "./components/RestoreMemberModal";
import { DesktopRestoreMemberModal } from "./components/DesktopRestoreMemberModal";
import EditablePageHeader from "@/components/common/EditablePageHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import api from "@/lib/api";
import { BackButton } from "@/components/ui/BackButton";
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

// Filter options for active/archived
const filterOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

function SingleTeamFormation() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [memberToReplace, setMemberToReplace] = useState(null);
  const [replacementMember, setReplacementMember] = useState(null);
  const [memberToArchive, setMemberToArchive] = useState(null);
  const [memberToRestore, setMemberToRestore] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Team and members state
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [teamError, setTeamError] = useState(null);
  const [membersError, setMembersError] = useState(null);

  const errorMessage = teamError || membersError || "";
  const hasError = Boolean(errorMessage);

  // Build isActive query param based on filter
  const isActiveParam = useMemo(() => {
    if (selectedFilter === "active") return true;
    if (selectedFilter === "archived") return false;
    return undefined; // "all" - don't filter by isActive
  }, [selectedFilter]);

  // Fetch team data (only once on mount)
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) return;

      setIsLoading(true);
      setTeamError(null);

      try {
        // Fetch team details
        const teamResponse = await api.get(`/teams/${teamId}`);
        const teamData = teamResponse.data?.data;

        if (teamData) {
          setTeam(teamData);
        } else {
          setTeamError("Team not found");
          return;
        }
      } catch (err) {
        console.error("Failed to fetch team:", err);
        const message = getErrorMessage(err, "Failed to load team");
        setTeamError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  // Fetch members data (separate effect that runs when filter changes)
  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamId) return;

      setIsLoadingMembers(true);
      setMembersError(null);

      try {
        // Fetch members with isActive filter
        const membersParams = new URLSearchParams();
        if (isActiveParam !== undefined) {
          membersParams.append("isActive", isActiveParam);
        }
        const membersResponse = await api.get(
          `/teams/${teamId}/members${membersParams.toString() ? `?${membersParams.toString()}` : ""
          }`
        );
        const membersData =
          membersResponse.data?.data?.data || membersResponse.data?.data || [];
        setMembers(membersData);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        setMembersError(getErrorMessage(err, "Failed to load team members. Please try again."));
        toast.error(
          getErrorMessage(err, "Failed to load team members. Please try again.")
        );
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [teamId, isActiveParam]);

  // Refetch members
  const refetchMembers = async () => {
    setIsLoadingMembers(true);
    setMembersError(null);
    try {
      const membersParams = new URLSearchParams();
      if (isActiveParam !== undefined) {
        membersParams.append("isActive", isActiveParam);
      }
      const response = await api.get(
        `/teams/${teamId}/members${membersParams.toString() ? `?${membersParams.toString()}` : ""
        }`
      );
      const membersData =
        response.data?.data?.data || response.data?.data || [];
      setMembers(membersData);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setMembersError(getErrorMessage(err, "Failed to refresh team members. Please try again."));
      toast.error(
        getErrorMessage(err, "Failed to refresh team members. Please try again.")
      );
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleBack = () => {
    navigate("/team-formation");
  };

  const handleUpdateTeamName = async (newName) => {
    // Optimistic update
    setTeam((prev) => ({ ...prev, name: newName }));

    try {
      // TODO: Replace with actual API call when available
      // await api.put(`/teams/${teamId}`, { name: newName });
      console.log("Updated team name to:", newName);
    } catch (err) {
      console.error("Failed to update team name:", err);
      toast.error(
        getErrorMessage(err, "Failed to update team name. Please try again.")
      );
      // Revert on error
      // setTeam((prev) => ({ ...prev, name: team.name }));
    }
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredMembers = useMemo(() => {
    let membersList = [...members];

    // Filter by search term (client-side)
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      membersList = membersList.filter((member) => {
        const user = member.user || member;
        const name = user.name || user.username || "";
        const email = user.email || "";
        return (
          name.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        );
      });
    }

    // Note: active/archived filter is now handled server-side via API params

    return membersList;
  }, [members, debouncedSearchTerm]);

  // Pagination
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = useCallback((value) => {
    setSelectedFilter(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(Number(newLimit));
    setCurrentPage(1);
  };

  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  // Get existing member user IDs to filter out from available users
  const existingMemberUserIds = useMemo(() => {
    return members
      .filter((m) => m.isActive !== false)
      .map((m) => m.user?._id || m.user?.id)
      .filter(Boolean);
  }, [members]);

  const handleConfirmAdd = () => {
    // Refetch members after successful add
    refetchMembers();
    setIsAddModalOpen(false);
  };

  const handleRefreshMember = (member) => {
    setMemberToReplace(member);
    setIsReplaceModalOpen(true);
  };

  const handleDeleteMember = (member) => {
    setMemberToArchive(member);
    setIsArchiveModalOpen(true);
  };

  const handleRestoreMember = (member) => {
    setMemberToRestore(member);
    setIsRestoreModalOpen(true);
  };

  const handleConfirmRestore = () => {
    // Refetch members after successful restore
    refetchMembers();
    setIsRestoreModalOpen(false);
    setMemberToRestore(null);
  };

  const handleConfirmReassignDesktop = () => {
    refetchMembers();
    setIsReplaceModalOpen(false);
    setMemberToReplace(null);
  };

  const handleConfirmReplace = (newMember) => {
    setReplacementMember(newMember);
    setIsReplaceModalOpen(false);
    setIsReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    try {
      const oldUserId =
        memberToReplace?.user?._id ||
        memberToReplace?.user?.id ||
        memberToReplace?._id;
      const newUserId = replacementMember?._id || replacementMember?.id;

      if (oldUserId && newUserId) {
        await api.post(`/teams/${teamId}/members/replace`, {
          oldUserId,
          newUserId,
        });
        refetchMembers();
      }
    } catch (err) {
      console.error("Failed to replace member:", err);
      toast.error(
        getErrorMessage(err, "Failed to replace member. Please try again.")
      );
    } finally {
      setIsReassignModalOpen(false);
      setMemberToReplace(null);
      setReplacementMember(null);
    }
  };

  const handleConfirmArchive = async () => {
    try {
      const userId =
        memberToArchive?.user?._id ||
        memberToArchive?.user?.id ||
        memberToArchive?._id;
      if (userId) {
        await api.delete(`/teams/${teamId}/members/${userId}`);
        refetchMembers();
      }
    } catch (err) {
      console.error("Failed to archive member:", err);
      toast.error(
        getErrorMessage(err, "Failed to archive member. Please try again.")
      );
    } finally {
      setIsArchiveModalOpen(false);
      setMemberToArchive(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <section className=" flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-none ms-0 lg:ms-5">
        <div className="flex items-center gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3">
          <BackButton />
          <EditablePageHeader
            title={team.name}
            onSave={handleUpdateTeamName}
            className={"my-4 px-1 md:p-0 md:m-0 "}
          />
        </div>

        <FloatingButton
          className={"md:hidden static m-0"}
          icon={Plus}
          onClick={handleAddMember}
        ></FloatingButton>

        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="Search members..."
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
        searchPlaceholder="Search members..."
        filterValue={selectedFilter}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        hideOnDesktop={true}
        defaultFilterValue="active"
      />

      {/* Desktop Filter Pills + Add Member Button */}
      <div className="flex-none hidden md:block ms-5 me-5 my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4">
        <div className="flex items-center justify-between">
          <DesktopFilterPills
            value={selectedFilter}
            options={filterOptions}
            onChange={handleFilterChange}
          />
          <FloatingButton
            className={
              "hidden md:flex md:static font-medium rounded-full gap-0"
            }
            icon={Plus}
            onClick={handleAddMember}
          >
            Add Member
          </FloatingButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 w-full min-h-0">
        {/* Mobile UI */}
        {!isDesktop && (
          <div className="md:hidden">
            {isLoadingMembers ? (
              <MobileSingleTeamFormationListSkeleton count={5} />
            ) : (
              <MobileSingleTeamFormationList
                members={paginatedMembers}
                onRefresh={handleRefreshMember}
                onDelete={handleDeleteMember}
                onRestore={handleRestoreMember}
                searchTerm={searchTerm}
                errorMessage={errorMessage}
                hasError={hasError}
              />
            )}
          </div>
        )}

        {/* Desktop UI */}
        {isDesktop && (
          <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
            <DesktopSingleTeamFormationTable
              members={paginatedMembers}
              isLoading={isLoadingMembers}
              onReplace={handleRefreshMember}
              onDelete={handleDeleteMember}
              onRestore={handleRestoreMember}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              noDataDescription={searchTerm
                ? `No members match "${searchTerm}". Try adjusting your search.`
                : "No members available yet."}
              emptyState={
                hasError ? (
                  <div className="py-10 text-center text-red-500">
                    {errorMessage}
                  </div>
                ) : null
              }
            />
          </div>
        )}

        {isAddModalOpen && (
          <>
            {!isDesktop && (
              <div className="md:hidden">
                <AddMemberModal
                  open={isAddModalOpen}
                  onOpenChange={setIsAddModalOpen}
                  onConfirm={handleConfirmAdd}
                  existingMemberIds={existingMemberUserIds}
                />
              </div>
            )}
            {isDesktop && (
              <div className="hidden md:block">
                <DesktopAddMemberModal
                  open={isAddModalOpen}
                  onOpenChange={setIsAddModalOpen}
                  onConfirm={handleConfirmAdd}
                  existingMemberIds={existingMemberUserIds}
                />
              </div>
            )}
          </>
        )}

        {isReplaceModalOpen && (
          <>
            {!isDesktop && (
              <div className="md:hidden">
                <ReplaceMemberModal
                  open={isReplaceModalOpen}
                  onOpenChange={setIsReplaceModalOpen}
                  memberToReplace={memberToReplace}
                  teamId={teamId}
                  onConfirm={handleConfirmReplace}
                />
              </div>
            )}
            {isDesktop && (
              <div className="hidden md:block">
                <DesktopReassignTasksModal
                  open={isReplaceModalOpen}
                  onOpenChange={setIsReplaceModalOpen}
                  memberToReplace={memberToReplace}
                  existingMemberIds={existingMemberUserIds}
                  onConfirm={handleConfirmReassignDesktop}
                />
              </div>
            )}
          </>
        )}

        {isReassignModalOpen && (
          <>
            {!isDesktop && (
              <ReassignTasksModal
                open={isReassignModalOpen}
                onOpenChange={setIsReassignModalOpen}
                oldMember={memberToReplace}
                newMember={replacementMember}
                onConfirm={handleConfirmReassign}
              />
            )}
            {isDesktop && (
              <DesktopReassignTasksModal
                open={isReassignModalOpen}
                onOpenChange={setIsReassignModalOpen}
                oldMember={memberToReplace}
                newMember={replacementMember}
                onConfirm={handleConfirmReassign}
              />
            )}
          </>
        )}

        {isArchiveModalOpen && (
          <ArchiveMemberModal
            open={isArchiveModalOpen}
            onOpenChange={setIsArchiveModalOpen}
            member={memberToArchive}
            teamName={team?.name || "Team"}
            onConfirm={handleConfirmArchive}
          />
        )}

        {isRestoreModalOpen && (
          <>
            {!isDesktop && (
              <div className="md:hidden">
                <RestoreMemberModal
                  open={isRestoreModalOpen}
                  onOpenChange={setIsRestoreModalOpen}
                  member={memberToRestore}
                  onConfirm={handleConfirmRestore}
                />
              </div>
            )}
            {isDesktop && (
              <div className="hidden md:block">
                <DesktopRestoreMemberModal
                  open={isRestoreModalOpen}
                  onOpenChange={setIsRestoreModalOpen}
                  member={memberToRestore}
                  onConfirm={handleConfirmRestore}
                />
              </div>
            )}
          </>
        )}
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

      {/* Floating Button for Mobile */}
      {/* <FloatingButton
        className={"md:hidden"}
        icon={Plus}
        onClick={handleAddMember}
      >
        Add Member
      </FloatingButton> */}
    </section>
  );
}

export default SingleTeamFormation;
