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
import { Loader2 } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export function ViewTeamModal({ open, onOpenChange, team, className }) {
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
          "sm:max-w-[500px] gap-0 px-5 py-5 rounded-2xl",
          className
        )}
      >
        <ModalHeader className="pb-4">
          <ModalTitle className="text-lg font-semibold text-center">
            {team?.name || "Team Details"}
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <SearchInput
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Members List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="py-4 text-center text-red-500">{error}</div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-4 text-center text-base-color">
                {searchTerm ? "No members found." : "No members in this team."}
              </div>
            ) : (
              filteredMembers.map((member) => {
                const user = member.user || member;
                const memberId = member._id || member.id;
                return (
                  <div
                    key={memberId}
                    className="flex items-center justify-between p-3 border rounded-lg border-table-stroke"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {user.name || user.username || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.department || "Team Member"} | {user.email || "No email"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <ModalFooter className="flex justify-center mt-6">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            className="mx-auto w-36 border-table-stroke text-nav-highlight hover:bg-primary-shade-2"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
