import React from "react";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileInfoDesktop from "./components/sections/profile-info/ProfileInfoDesktop";
import TasksDesktop from "./components/sections/tasks/TasksDesktop";
import ProjectsDesktop from "./components/sections/projects/ProjectsDesktop";
import TaskStatusUpdateModal from "./components/shared/TaskStatusUpdateModal";
import { useUserProfile } from "./UserProfileContext";

import { Grip } from "lucide-react";
import { cn } from "@/lib/utils";

import SidebarToggle from "@/features/project-overview/project-activity-sidebar/components/layout/SidebarToggle";

const UserProfileDesktop = () => {
  const { 
    searchTerm, 
    setSearchTerm,
    isSidebarExpanded,
    handleToggleSidebar 
  } = useUserProfile();

  return (
    <section className="flex flex-col flex-1 min-h-0 page-section-spacing h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between">
        <PageHeader title="User Profile" className="text-heading py-2 md:py-0" />
        <div className="items-center hidden gap-2 md:flex">
          <SearchInput
            placeholder="Search tasks and projects..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {/* <button
            onClick={handleToggleSidebar}
            className={cn(
              "md:hidden w-13 h-8 flex items-center justify-center rounded-[26px] transition-all duration-300",
              isSidebarExpanded 
                ? "bg-primary text-white" 
                : "bg-primary-shade-2 text-primary hover:bg-primary hover:text-white"
            )}
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Grip className="h-6" />
          </button> */}
          <ThemeToggle />
        </div>
      </div>

      <div className={cn(
        "grid flex-1 pt-1.5 lg:pt-2 xl:pt-2.5 2xl:pt-3 3xl:pt-4 min-h-0 min-w-0 transition-all duration-500 ease-in-out",
        isSidebarExpanded ? "lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_19rem] 2xl:grid-cols-[minmax(0,1fr)_22rem] 3xl:grid-cols-[minmax(0,1fr)_28rem] 3xl:gap-6 2xl:gap-5 xl:gap-4 lg:gap-3" : "lg:grid-cols-[minmax(0,1fr)_0rem] gap-0"
      )}>
        <div className="flex flex-col flex-1 h-full gap-1 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-4 overflow-hidden min-h-0">
          <ProfileInfoDesktop />
          <TasksDesktop />
        </div>

        <div className="relative h-full min-h-0">
          <div className="absolute inset-y-0 -left-2 flex items-center">
            <SidebarToggle onToggle={handleToggleSidebar} isExpanded={isSidebarExpanded} />
          </div>
          <aside className={cn(
            "flex flex-col h-full min-h-0 3xl:rounded-2xl 2xl:rounded-xl lg:rounded-lg border border-table-stroke bg-background/95 transition-all duration-500 ease-in-out overflow-hidden ",
            isSidebarExpanded ? "opacity-100" : "p-0 opacity-0 pointer-events-none"
          )}>
            <div className={cn(
              "transition-all duration-500 ease-in-out h-full overflow-hidden",
              isSidebarExpanded ? "flex flex-col w-full" : "w-0"
            )}>
              <div className="lg:min-w-[14rem] xl:min-w-[18rem] 2xl:min-w-[21rem] 3xl:min-w-[27rem] flex-1 flex flex-col min-h-0 ">
                <ProjectsDesktop />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <TaskStatusUpdateModal />
    </section>
  );
};

export default UserProfileDesktop;
