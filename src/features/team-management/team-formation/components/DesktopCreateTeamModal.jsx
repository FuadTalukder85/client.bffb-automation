import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select/Select";
import { Plus, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useEmployees } from "@/hooks/useEmployees";
import { useDebounce } from "@/hooks/useDebounce";

export function DesktopCreateTeamModal({
  open,
  onOpenChange,
  onSuccess,
  onNext,
  initialData,
  className,
}) {
  const [teamName, setTeamName] = useState(initialData?.name || "");
  const [selectedMembers, setSelectedMembers] = useState(
    initialData?.members || []
  ); // Array of member objects
  const [currentMemberId, setCurrentMemberId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch employees from API with search
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    statusFilter: "active",
    searchTerm: debouncedSearchTerm,
    limit: 500, // Increased limit to handle more users
  });
  const employees = employeesData?.data ?? [];

  // Filter out already selected members
  const availableEmployees = (employees || []).filter(
    (emp) => !selectedMembers.some((m) => (m._id || m.id) === (emp._id || emp.id))
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
        <div className="flex items-center gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-1.5 3xl:gap-2">
          <div className="flex items-center justify-center w-6 lg:w-3 xl:w-4 2xl:w-5 3xl:w-6 h-6 lg:h-3 xl:h-4 2xl:h-5 3xl:h-6 text-[10px] lg:text-[6px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-medium rounded-full bg-primary-shade-2 text-primary shrink-0 border border-primary/15 dark:border-primary dark:text-white">
            {displayId}
            {/* {employeeId} */}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium leading-none">{name}</span>
            {email && (
              <span className="text-[10px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground leading-none">
                {email}
              </span>
            )}
          </div>
        </div>
      ),
    };
  });

  const handleAddMember = () => {
    if (!currentMemberId) return;

    // Check if already added
    if (selectedMembers.some((m) => (m._id || m.id) === currentMemberId)) {
      setCurrentMemberId("");
      return;
    }

    const memberToAdd = employees.find(
      (e) => (e._id || e.id) === currentMemberId
    );
    if (memberToAdd) {
      setSelectedMembers([...selectedMembers, memberToAdd]);
      setCurrentMemberId("");
    }
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers(
      selectedMembers.filter((m) => (m._id || m.id) !== memberId)
    );
  };

  const handleSave = async () => {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    onNext?.({
      name: teamName.trim(),
      members: selectedMembers,
    });
  };

  const handleClose = (isOpen) => {
    if (!isOpen) {
      // Only reset if we are actually closing, not just hiding
      if (!initialData) {
        setTeamName("");
        setSelectedMembers([]);
        setCurrentMemberId("");
        setError(null);
        setSearchTerm(""); // Reset search term
      }
    }
    onOpenChange(isOpen);
  };

  // Update state when initialData changes (e.g. when reopening from confirm modal)
  React.useEffect(() => {
    if (open && initialData) {
      setTeamName(initialData.name || "");
      setSelectedMembers(initialData.members || []);
    }
  }, [open, initialData]);

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[1000px] lg:max-w-[616px] xl:max-w-[822px] 2xl:max-w-[924px] 3xl:max-w-[1156px] lg:min-h-[381px] xl:min-h-[508px] 2xl:min-h-[572px] 3xl:min-h-[715px] gap-0 px-8 lg:px-8.5 xl:px-11 2xl:px-12 3xl:px-16 py-8 lg:py-10 xl:py-14 2xl:py-16 3xl:py-20 rounded-3xl lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl! bg-white dark:bg-[#0B0B0F] border border-white/10 flex flex-col",
          className
        )}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 lg:mb-4.5 xl:mb-6 2xl:mb-7 3xl:mb-8">
          <ModalTitle className="text-2xl lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-2xl font-semibold text-foreground">
            Create Team
          </ModalTitle>

          {/* Team Name Input styled as pill */}
          <div className="relative w-72 lg:w-[155px] xl:w-[205px] 2xl:w-[235px] 3xl:w-72">
            <div className="border border-[#EEEBF4] p-1.5 lg:p-[3px] xl:p-[4px] 2xl:p-[5px] 3xl:p-1.5 rounded-full">
              <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team Name"
              className=" flex items-center justify-center w-full pl-10 lg:pl-5.5 xl:pl-6.5 2xl:pl-8 3xl:pl-10 py-2 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2 rounded-full bg-[#EEEBF4] dark:bg-[#12121A] border border-gray-200 dark:border-white/10 text-foreground text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm focus:outline-none"
            />
            </div>
            <svg className="absolute text-base-color w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 -translate-y-1/2 pointer-events-none left-3 lg:left-2.5 xl:left-3.5 2xl:left-4 3xl:left-4.5 top-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd" fillcolor/></svg>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 mb-4 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-4 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        {/* Inner Container for List */}
        <div className="flex flex-col h-[450px] lg:h-[240px] xl:h-[320px] 2xl:h-[360px] 3xl:h-[450px] mb-4 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-4 border border-gray-200 dark:border-white/10 rounded-3xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 px-10 lg:px-12 xl:px-16 2xl:px-18 3xl:px-23 py-4 lg:py-1.5 xl:py-2 2xl:py-3 3xl:py-4 mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-muted-foreground bg-[#F8F6FC] dark:bg-[#12121A] rounded-t-3xl lg:rounded-t-lg xl:rounded-t-xl 2xl:rounded-t-2xl 3xl:rounded-t-3xl">
            <div className="font-semibold text-foreground">Assign to</div>
            <div className="font-semibold text-foreground">Role</div>
            <div className="font-semibold text-foreground text-right">Action</div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {selectedMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
                <p>No members added yet.</p>
              </div>
            ) : (
              selectedMembers.map((member, index) => {
                const memberId = member._id || member.id;
                const displayId = index + 1;

                return (
                  <div
                    key={memberId}
                    className="grid grid-cols-[2fr_1fr_1fr] gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 items-center p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 bg-white dark:bg-[#12121A]"
                  >
                    {/* User Info */}
                    <div className="flex items-center min-w-0 gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4">
                      <div className="flex items-center justify-center w-10 lg:w-6 xl:w-7 2xl:w-8 3xl:w-10 h-10 lg:h-6 xl:h-7 2xl:h-8 3xl:h-10 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium rounded-full bg-primary/10 text-primary dark:text-nav-highlight shrink-0">
                        {displayId}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold truncate text-foreground">
                          {member.name || member.username || "Unknown"}
                        </span>
                        <span className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs truncate text-lighter-text">
                          {member.email || "No email"}
                        </span>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="min-w-0">
                      <span className="block text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium truncate text-foreground">
                        {member.role || "Jr. Analyst"}
                      </span>
                    </div>

                    {/* Delete Action */}
                    <div className="text-center pl-5 lg:pl-6 xl:pl-8 2xl:pl-10 3xl:pl-12">
                      <button
                        onClick={() => handleRemoveMember(memberId)}
                        className="p-2 lg:p-1 xl:p-1.5 2xl:p-1.5 3xl:p-2 bg-primary/10 transition-colors rounded-full hover:bg-red-50 text-base-color hover:text-red-500"
                      >
                        <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Add Member Bar */}
        <div className="py-4 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-4 mb-6 lg:mb-3.5 xl:mb-4 2xl:mb-5 3xl:mb-6 bg-invite-status-text rounded-xl lg:rounded-md xl:rounded-lg 2xl:rounded-xl 3xl:rounded-xl">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 items-center px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4">
            <div className="w-[60%] rounded-lg lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-lg h-10 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 flex items-center px-1">
              <Select
                value={currentMemberId}
                onChange={(e) => setCurrentMemberId(e.target.value)}
                options={employeeOptions}
                placeholder={isLoadingEmployees ? "Loading..." : "Select User"}
                className="w-[300px] lg:w-[160px] xl:w-[213px] 2xl:w-[240px] 3xl:w-[300px] h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 text-black bg-transparent border-none shadow-none focus:ring-0 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
                disabled={isLoadingEmployees}
                position="top"
                searchable={true}
                onSearchChange={setSearchTerm}
              />
            </div>
            <div className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-white/70">
              {employees?.find((e) => (e._id || e.id) === currentMemberId)
                ?.role || "N/A"}
            </div>
            <div className="text-right">
              <Button
                onClick={handleAddMember}
                disabled={!currentMemberId}
                className="px-6 lg:px-2.5 xl:px-3.5 2xl:px-4.5 3xl:px-6 font-medium bg-white dark:bg-background rounded-lg lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-lg text-invite-status-text dark:text-white hover:bg-white/90 h-9 lg:h-5.5 xl:h-6.5 2xl:h-7.5 3xl:h-9 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
              >
                <Plus className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 mr-2 lg:mr-1 xl:mr-1.5 2xl:mr-1.5 3xl:mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        <ModalFooter className="flex justify-end gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            className="px-8 lg:px-4.5 xl:px-6 2xl:px-7 3xl:px-8 py-2 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2 border border-gray-200 rounded-full lg:rounded-md xl:rounded-lg 2xl:rounded-xl 3xl:rounded-full dark:border-white/20 text-foreground hover:bg-gray-50 dark:hover:bg-white/5 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
          >
            <span className="mr-2 lg:mr-1 xl:mr-1.5 2xl:mr-1.5 3xl:mr-2">×</span> Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleSave}
            disabled={isSubmitting || !teamName.trim()}
            className="px-8 lg:px-4.5 xl:px-6 2xl:px-7 3xl:px-8 py-2 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2 text-foreground bg-[#EEEBF4] border border-gray-200 dark:border-nav-highlight rounded-full lg:rounded-md xl:rounded-lg 2xl:rounded-xl 3xl:rounded-full hover:bg-gray-50 dark:bg-primary/35 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 mr-2 lg:mr-1 xl:mr-1.5 2xl:mr-1.5 3xl:mr-2 animate-spin" />
            ) : (
              <Save className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 mr-2 lg:mr-1 xl:mr-1.5 2xl:mr-1.5 3xl:mr-2" />
            )}
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

