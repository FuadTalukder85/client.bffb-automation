import React from "react";
import PageHeader from "@/components/common/page-header";
import ProfileInfoMobile from "./components/sections/profile-info/ProfileInfoMobile";
import TasksMobile from "./components/sections/tasks/TasksMobile";
import MobileProjectsSidebar from "./MobileProjectsSidebar";
import TaskStatusUpdateModal from "./components/shared/TaskStatusUpdateModal";
import { Grip } from "lucide-react";
import { useUserProfile } from "./UserProfileContext";

const UserProfileMobile = () => {
  const { isSidebarExpanded, handleToggleSidebar } = useUserProfile();

  return (
    <section className="flex flex-col flex-1 min-h-0 page-section-spacing">
      <div className="flex items-center justify-between py-2 sticky -top-5 z-30 bg-white dark:bg-background">
        <PageHeader title="User Profile" className="text-xl" />
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSidebar}
            className="w-13 h-8 flex items-center justify-center rounded-[26px] bg-primary text-white"
          >
            <Grip className="h-6" />
          </button>
        </div>
      </div>

      <div className="space-y-4 flex-1 min-h-0 dark:bg-background">
        <ProfileInfoMobile />
        <TasksMobile stickyTopClass="top-[28px]" />
      </div>

      <MobileProjectsSidebar 
        isOpen={isSidebarExpanded} 
        onClose={handleToggleSidebar} 
      />

      <TaskStatusUpdateModal />
    </section>
  );
};

export default UserProfileMobile;
