import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { cn } from "@/lib/utils";
import { Loader2, FileText } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export function DesktopViewTeamModal({ open, onOpenChange, team, className }) {
  const [searchTerm, setSearchTerm] = useState("");

  const teamId = team?._id || team?.id;
  const { data: members = [], isLoading, error } = useTeamMembers(teamId, {
    enabled: open && !!teamId, // Only fetch when modal is open and teamId exists
  });

  const handleClose = (isOpen) => {
    if (!isOpen) {
      setSearchTerm("");
    }
    onOpenChange(isOpen);
  };

  // Filter members by search term
  const filteredMembers = members.filter((member) => {
    const user = member.user || member;
    const name = user.name || user.username || "";
    const email = user.email || "";
    const searchLower = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[1000px] lg:max-w-[616px] xl:max-w-[822px] 2xl:max-w-[924px] 3xl:max-w-[1156px] lg:min-h-[324px] xl:min-h-[432px] 2xl:min-h-[486px] 3xl:min-h-[608px] gap-0 px-7 lg:px-8 xl:px-10 2xl:px-12 3xl:px-14 py-8 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 rounded-3xl lg:rounded-lg! xl:rounded-xl! 2xl:rounded-2xl! 3xl:rounded-3xl! bg-white dark:bg-[#07020D] border border-nav-highlight/50 flex flex-col",
          className
        )}
      >
        {/* Header Section */}
        <div className="flex items-center gap-5 lg:gap-2 xl:gap-3 2xl:gap-4 3xl:gap-5 mb-8 lg:mb-5 xl:mb-6 2xl:mb-7 3xl:mb-8">
          <ModalTitle className="text-xl lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-base-color">
            {team?.name || "Team Details"}
          </ModalTitle>
          <div className="w-72 lg:w-38 xl:w-51 2xl:w-57 3xl:w-72">
            <SearchInput
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-primary-shade-2/20 border-primary-shade-2 text-base-color placeholder:text-base-color"
            />
          </div>
        </div>

        {/* Inner Container for List */}
        <div className="flex flex-col h-[450px] lg:h-[240px] xl:h-[320px] 2xl:h-[360px] 3xl:h-[450px] mb-4 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-4 border border-gray-200 dark:border-white/10 rounded-3xl lg:rounded-lg xl:rounded-xl 2xl:rounded-2xl 3xl:rounded-3xl">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4 px-10 lg:px-12 xl:px-16 2xl:px-18 3xl:px-23 py-4 lg:py-1.5 xl:py-2 2xl:py-3 3xl:py-4 mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-muted-foreground bg-[#F8F6FC] dark:bg-[#12121A] rounded-t-3xl lg:rounded-t-lg xl:rounded-t-xl 2xl:rounded-t-2xl 3xl:rounded-t-3xl">
            <div className="font-semibold text-foreground">User</div>
            <div className="font-semibold text-foreground">Role</div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 text-center text-red-500">{error}</div>
            ) : filteredMembers.length === 0 ? (
              <div className="lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 text-center text-foreground text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
                {searchTerm ? "No members found." : "No members in this team."}
              </div>
            ) : (
              filteredMembers.map((member, index) => {
                const user = member.user || member;
                const memberId = member._id || member.id;
                // Mock ID for design match
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
                      <div className="flex flex-col">
                        <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold truncate text-foreground">
                          {user.name || user.username || "Unknown"}
                        </span>
                        <span className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs truncate text-lighter-text">
                          {user.email || "No email"}
                        </span>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex-1 ">
                      <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-base-color">
                        {member?.user?.activeRole?.roleName}
                      </span>
                    </div>

                    {/* Actions (Hidden in new design image but keeping structure if needed, or hiding them to match strictly) */}
                    {/* The image shows actions on the far right outside the inner list container? No, wait. 
                        The image shows the list items taking full width. 
                        Actually, looking closely at the image, the actions seem to be outside the inner container or just not visible in the main list view?
                        Wait, the image shows icons on the right side. Let's keep them but style them minimally.
                    */}
                    <div className="flex items-center gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                      {/* Placeholder for actions if they are supposed to be there. 
                            The image shows icons on the right side of the screen, seemingly outside the modal? 
                            No, they are likely inside the row. Let's keep them but make them subtle.
                        */}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <ModalFooter className="flex justify-end mt-6">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            className="px-8 lg:px-4.5 xl:px-5.5 2xl:px-6.5 3xl:px-8 py-2 lg:py-1 xl:py-1 2xl:py-1.5 3xl:py-2 border rounded-full border-nav-highlight/20 text-foreground hover:bg-white/5"
          >
            <span className="mr-2 lg:mr-1 xl:mr-1 2xl:mr-1.5 3xl:mr-2">×</span> Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
