import React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, X } from "lucide-react";
import { useUserProfile } from "./UserProfileContext";
import { getProjectTitle, getInitials, getCommentActorHandle, getCommentSnippet } from "./utils";
import { formatDate, DATE_FORMATS } from "@/utils/dateFormatter";
import SidebarTabs from "@/features/project-overview/project-activity-sidebar/components/layout/SidebarTabs";
import CommentsTab from "@/features/project-overview/project-activity-sidebar/components/comments/CommentsTab";
import MembersTab from "@/features/project-overview/project-activity-sidebar/components/members/MembersTab";
import SidebarHeader from "@/features/project-overview/project-activity-sidebar/components/layout/SidebarHeader";
import { cn } from "@/lib/utils";

import { NoData } from "@/components/ui/NoData";

const MobileProjectsSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    memberProjects,
    selectedProject,
    setSelectedProject,
    activityTab,
    setActiveTab,
    debouncedSearch,
  } = useUserProfile();

  const handleOpenProjectChat = (project) => {
    setSelectedProject(project);
    setActiveTab("chat");
  };

  const handleCloseProjectChat = () => {
    setSelectedProject(null);
    setActiveTab("chat");
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-[100] w-screen bg-background border-l border-table-stroke transition-transform duration-300 ease-in-out transform flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <SidebarHeader 
        onToggle={onClose} 
        className=""
      />
      
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {selectedProject ? (
          <div className="flex flex-col flex-1 h-full">
            <div className="flex items-center gap-3 py-2 mb-3">
               <button onClick={handleCloseProjectChat} className="p-2 rounded-full hover:bg-primary/10 text-nav-highlight border border-primary/20 shrink-0">
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <div className="min-w-0">
                 <p className="text-sm font-semibold text-foreground truncate uppercase tracking-wider">{getProjectTitle(selectedProject)}</p>
                 <button
                   onClick={() => navigate(`/project-overview/product-development/${selectedProject._id}`)}
                   className="text-[10px] text-nav-highlight hover:underline truncate font-medium cursor-pointer"
                 >
                   View Details
                 </button>
               </div>
            </div>
            
            <SidebarTabs hiddenTabs={["history"]} />
            
            <div className="flex-1 min-h-0 overflow-hidden mt-2">
              {activityTab === "members" ? (
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <MembersTab projectId={selectedProject._id} />
                </div>
              ) : (
                <CommentsTab projectId={selectedProject._id} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <h2 className="3xl:text-xl 2xl:text-lg xl:text-mg lg:text-sm font-semibold text-foreground mb-4">Your Projects</h2>
            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar divide-y divide-table-stroke/70">
              {memberProjects.length === 0 ? (
                <div className="py-8">
                  <NoData
                    message="No Projects Found"
                    description={debouncedSearch 
                      ? `No projects match "${debouncedSearch}". Try adjusting your search.`
                      : "No projects available yet."}
                  />
                </div>
              ) : (
                memberProjects.map((project) => {
                  const title = getProjectTitle(project);
                  const hasLatestComment = Boolean(project.latestComment);
                  const actorHandle = getCommentActorHandle(project.latestComment);

                  return (
                    <button
                      key={project._id}
                      onClick={() => handleOpenProjectChat(project)}
                      className="w-full text-left px-1.5 py-4 hover:bg-primary-shade-2/35 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-9 rounded-full bg-primary-shade-2 text-foreground text-xs font-medium flex items-center justify-center shrink-0">
                          {getInitials(title)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                               {project.latestComment?.createdAt ? formatDate(project.latestComment.createdAt, DATE_FORMATS.WITH_TIME, "-") : "-"}
                            </span>
                          </div>
                          {hasLatestComment && (
                             <p className="mt-1 text-xs text-foreground line-clamp-2 leading-relaxed">
                               <span className="text-nav-highlight font-medium">{actorHandle}</span>{" "}
                               {getCommentSnippet(project.latestComment)}
                             </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Basic overlay if open to detect clicks outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]"
          onClick={onClose}
        />
      )}
    </aside>
  );
};

export default MobileProjectsSidebar;
