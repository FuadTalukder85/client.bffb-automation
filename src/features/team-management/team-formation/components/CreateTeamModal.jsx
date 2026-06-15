import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEmployees } from "@/hooks/useEmployees";
import { useCreateTeam, useAddTeamMember } from "@/hooks/mutations/useTeamMutations";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export function CreateTeamModal({ open, onOpenChange, onSuccess, className }) {
  const [teamName, setTeamName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch employees from API using TanStack Query with search
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    statusFilter: "active",
    searchTerm: debouncedSearchTerm,
    limit: 500, // Increased limit to handle more users
  });
  const employees = employeesData?.data || [];

  // Mutation hooks - self-contained, auto-invalidates cache
  const { mutateAsync: createTeam, isPending: isCreatingTeam } = useCreateTeam();
  const { mutateAsync: addTeamMembers, isPending: isAddingMembers } = useAddTeamMember();
  
  const isSubmitting = isCreatingTeam || isAddingMembers;

  const handleRemoveMember = (memberId) => {
    setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
  };

  const handleSave = async () => {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    setError(null);

    try {
      // Step 1: Create the team using mutation hook
      const teamResponse = await createTeam({
        name: teamName.trim(),
      });

      const createdTeam = teamResponse?.data;

      // Step 2: Add members to the team if any selected
      if (selectedMemberIds.length > 0 && createdTeam?._id) {
        await addTeamMembers({
          teamId: createdTeam._id,
          userIds: selectedMemberIds,
        });
      }

      // Cache is automatically invalidated by mutation hooks
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Failed to create team:", err);
      const message = getErrorMessage(
        err,
        "Failed to create team. Please try again."
      );
      setError(message);
      toast.error(message);
    }
  };

  const handleClose = () => {
    setTeamName("");
    setSelectedMemberIds([]);
    setError(null);
    setSearchTerm(""); // Reset search term
    onOpenChange(false);
  };

  // Filter out already selected members
  const availableEmployees = (employees || []).filter(
    (emp) => !selectedMemberIds.includes(emp._id || emp.id)
  );

  const employeeOptions = availableEmployees.map((emp, index) => {
    const name = emp.name || emp.username || "Unknown";
    const email = emp.email || "";
    const employeeId = emp.employeeId || "?";
    const displayId = index + 1;

    return {
      value: emp._id || emp.id,
      searchText: `${name} ${email} ${employeeId}`, // Add searchText for filtering
      label: (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 text-[10px] font-medium rounded-full bg-primary-shade-2 text-primary shrink-0 border border-primary/15 dark:border-primary dark:text-white">
            {displayId}
            {/* {employeeId} */}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium leading-none">{name}</span>
            {email && (
              <span className="text-[10px] text-muted-foreground leading-none">
                {email}
              </span>
            )}
          </div>
        </div>
      ),
    };
  });

  // Get selected member objects for display
  const selectedMemberObjects = selectedMemberIds
    .map((id) => employees.find((emp) => (emp._id || emp.id) === id))
    .filter(Boolean);

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "sm:max-w-[380px] md:max-w-[500px] gap-0 px-5 py-4 md:px-6 md:py-5 rounded-2xl",
          className
        )}
      >
        <ModalHeader className="mb-2">
          <ModalTitle className="text-lg font-semibold text-center">
            Create Team
          </ModalTitle>
          <ModalDescription className="sr-only">
            Create a new team with members.
          </ModalDescription>
        </ModalHeader>

        <div className="grid gap-2 py-1 md:gap-4 md:py-2">
          {/* Team Name Input */}
          <div className="space-y-1">
            <label
              htmlFor="teamName"
              className="text-xs font-normal md:text-sm text-lighter-text"
            >
              Team Name
            </label>
            <Input
              id="teamName"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="h-8 border-none rounded-md"
              inputClassName="placeholder:text-xs text-xs md:placeholder:text-sm md:text-sm"
            />
          </div>



          {/* Team Members Section */}
          <div className="space-y-1">
            <label className="text-xs font-normal md:text-sm text-lighter-text">
              Team Members
            </label>

            {/* Display added members */}
            {selectedMemberObjects.length > 0 && (
              <div className="mb-2 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {selectedMemberObjects.map((member) => (
                  <div
                    key={member._id || member.id}
                    className="flex items-center justify-between p-3 transition-colors border border-transparent rounded-lg bg-primary-shade-2/20 hover:border-purple-200"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-base-color">
                        {member.name || member.username}
                      </h3>
                      <p className="text-xs text-lighter-text">
                        {member.department || member.role || "Team Member"} |{" "}
                        {member.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMember(member._id || member.id)
                      }
                      className="flex items-center justify-center w-8 h-8 transition-colors rounded-md bg-primary-shade-2 text-nav-highlight hover:bg-primary-shade-2/80"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <AccordionSelect
              value={selectedMemberIds}
              onChange={(e) => setSelectedMemberIds(e.target.value)}
              options={employeeOptions}
              placeholder={
                isLoadingEmployees
                  ? "Loading employees..."
                  : "Select Team Members"
              }
              className="text-base-color"
              maxHeight="max-h-[150px]"
              disabled={isLoadingEmployees}
              multiple={true}
              onSearchChange={setSearchTerm}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-1 text-xs md:text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <ModalFooter className="flex-row gap-3 mt-2 text-xs h-9 md:gap-4 md:mt-3 md:text-sm md:h-10">
          <Button
            intent="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full border-table-stroke text-base-color "
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleSave}
            disabled={!teamName.trim() || isSubmitting}
            className="w-full text-white bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Creating..." : "Save"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
