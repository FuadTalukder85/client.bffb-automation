import React, { useMemo, useEffect } from "react";
import { useUserProfile } from "./UserProfileContext";
import UserProfileDesktop from "./UserProfileDesktop";
import UserProfileMobile from "./UserProfileMobile";
import UserProfileSkeleton from "./UserProfileSkeleton";
import { useIsMobile } from "@/hooks/useIsMobile";

const UserProfilePageContent = () => {
  const isMobile = useIsMobile();
  const {
    isProjectTasksLoading,
    isInternalTasksLoading,
    isMemberProjectsLoading,
    isNotificationsLoading,
  } = useUserProfile();

  const isLoading = isProjectTasksLoading || isInternalTasksLoading || isMemberProjectsLoading || isNotificationsLoading;

  // We show skeleton only on initial load. Subsequent updates (like filter or search) might not need full skeleton.
  // But for this refactor, we'll follow the requirement of skeleton for loading.
  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  return isMobile ? <UserProfileMobile /> : <UserProfileDesktop />;
};

export default UserProfilePageContent;
