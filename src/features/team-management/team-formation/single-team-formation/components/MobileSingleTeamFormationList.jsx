import React from "react";
import { MobileSingleTeamFormationCard } from "./MobileSingleTeamFormationCard";
import { NoData } from "@/components/ui/NoData";

export function MobileSingleTeamFormationList({
  members = [],
  onRefresh,
  onDelete,
  onRestore,
  searchTerm,
  errorMessage,
  hasError,
}) {
  if (!members || members.length === 0) {
    return hasError ? (
      <div className="py-10 text-center text-red-500">
        {errorMessage}
      </div>
    ) : (
      <NoData
        message="No Members Found"
        description={searchTerm
          ? `No members match "${searchTerm}". Try adjusting your search.`
          : "No members available yet."}
      />
    );
  }

  return (
    <div className="flex flex-col w-full md:hidden">
      {members.map((member, index) => {
        const memberId = member._id || member.id;
        return (
          <MobileSingleTeamFormationCard
            key={memberId || index}
            serial={index + 1}
            member={member}
            onRefresh={onRefresh}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        );
      })}
    </div>
  );
}

export default MobileSingleTeamFormationList;
