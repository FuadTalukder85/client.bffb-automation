import React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useUserProfile } from "../../../UserProfileContext";
import { getProjectTitle, getInitials, getCommentActorHandle, getCommentSnippet } from "../../../utils";
import { formatDate, DATE_FORMATS } from "@/utils/dateFormatter";
import SidebarTabs from "@/features/project-overview/project-activity-sidebar/components/layout/SidebarTabs";
import CommentsTab from "@/features/project-overview/project-activity-sidebar/components/comments/CommentsTab";
import MembersTab from "@/features/project-overview/project-activity-sidebar/components/members/MembersTab";

import { NoData } from "@/components/ui/NoData";

const ProjectsDesktop = () => {
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

  if (selectedProject) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-background 3xl:rounded-2xl 2xl:rounded-xl xl:rounded-lg lg:rounded-md rounded-sm overflow-hidden border border-table-stroke shadow-sm">
        <div className="flex items-center justify-between px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 border-b border-table-stroke bg-background sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-1 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 min-w-0">
            <button
              onClick={handleCloseProjectChat}
              className="p-1.5 rounded-full hover:bg-primary/10 text-nav-highlight transition-all shrink-0 border border-primary/20"
              title="Back to Projects"
            >
              <ChevronLeft className="w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5" />
            </button>
            <div className="min-w-0 flex flex-col lg:gap-0 xl:gap-0.5 2xl:gap-0.5 3xl:gap-1">
              <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground truncate uppercase tracking-wider leading-tight">{getProjectTitle(selectedProject)}</p>
              <button
                onClick={() => navigate(`/project-overview/product-development/${selectedProject._id}`)}
                className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-nav-highlight hover:underline truncate font-medium cursor-pointer leading-tight text-left"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        <SidebarTabs hiddenTabs={["history"]} />

        <div className="flex-1 min-h-0 overflow-hidden text-sm relative flex flex-col">
          {activityTab === "members" ? (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <MembersTab projectId={selectedProject._id} />
            </div>
          ) : (
            <CommentsTab projectId={selectedProject._id} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-[8px] lg:text-[10px] xl:text-[13px] 2xl:text-[16px] 3xl:text-xl font-semibold text-foreground 3xl:p-4 2xl:p-3 xl:p-2 lg:p-1.5">Your Projects</h2>
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar divide-y divide-table-stroke/70">
        {memberProjects.length === 0 ? (
          <div className="py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8">
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
                className="w-full text-left px-1.5 py-4 lg:py-2 xl:py-2.5 2xl:py-3.5 3xl:py-4 hover:bg-primary-shade-2/35 transition-colors"
              >
                <div className="flex items-start gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3">
                  <div className="size-5 lg:size-5 xl:size-6.5 2xl:size-7.5 3xl:size-9 rounded-full bg-primary-shade-2 text-foreground text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-medium flex items-center justify-center shrink-0">
                    {getInitials(title)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between pr-7 lg:pr-3.5 xl:pr-5 2xl:pr-5.5 3xl:pr-7 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2">
                      <p className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold text-foreground truncate">{title}</p>
                      <div className="flex items-center gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 shrink-0 pt-1">
                        <span className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-muted-foreground">
                          {project.latestComment?.createdAt
                            ? formatDate(project.latestComment.createdAt, DATE_FORMATS.WITH_TIME, "-")
                            : "-"}
                        </span>
                        {/* <span
                          className={`inline-flex size-1 lg:size-1 xl:size-1.5 2xl:size-2 3xl:size-2.5 rounded-full ${
                            hasLatestComment ? "bg-nav-highlight" : "bg-transparent border border-nav-highlight"
                          }`}
                        /> */}
                      </div>
                    </div>

                    {hasLatestComment ? (
                      <p className="mt-1.5 lg:mt-[2px] xl:mt-[3px] 2xl:mt-1 3xl:mt-1.5 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-foreground whitespace-normal break-words leading-3 lg:leading-3 xl:leading-4 2xl:leading-5 3xl:leading-6">
                        <span className="text-nav-highlight font-medium">{actorHandle}</span>{" "}
                        {getCommentSnippet(project.latestComment)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectsDesktop;
