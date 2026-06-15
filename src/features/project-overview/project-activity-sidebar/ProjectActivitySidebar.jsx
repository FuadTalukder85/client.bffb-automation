import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import socketService from '@/services/socketService';
import { useProjectActivityStore } from './stores/ProjectActivityStore';
import SidebarHeader from './components/layout/SidebarHeader';
import SidebarToggle from './components/layout/SidebarToggle';
import SidebarTabs from './components/layout/SidebarTabs';
import CommentsTab from './components/comments/CommentsTab';
import MembersTab from './components/members/MembersTab';
import HistoryTab from './components/history/HistoryTab';

/**
 * Temporary placeholder for tabs that are not yet implemented.
 * Remove once feature development is complete.
 */
const ComingSoon = ({ label }) => (
  <div className="flex flex-1 items-center justify-center h-full min-h-[300px] text-[11px] font-bold text-muted-foreground/50 tracking-[0.2em] uppercase p-12 text-center leading-relaxed">
    {label} <br /> coming soon
  </div>
);

const ProjectActivitySidebar = ({
    projectId,
    selectedFields = [],
    onClearField,
    isExpanded: externalIsExpanded,
    onToggle,
    view = null,
    showAddMemberButton = false,
    className = ""
}) => {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();
    const userId = currentUser?.id || currentUser?._id;
    const {
        activeTab,
        isExpanded,
        setExpanded,
    } = useProjectActivityStore();

    // Sync external expanded state with store
    useEffect(() => {
        if (externalIsExpanded !== undefined) {
            setExpanded(externalIsExpanded);
        }
    }, [externalIsExpanded, setExpanded]);

    useEffect(() => {
        if (!projectId || !userId || activeTab === "chat") {
            return;
        }

        let isMounted = true;

        const handleConnect = () => {
            socketService.joinProject(projectId, userId);
        };

        const handleDisconnect = () => {
            if (!isMounted) return;
        };

        socketService
            .connect(userId)
            .then(() => {
                if (!isMounted) return;
                socketService.joinProject(projectId, userId);
            })
            .catch(() => {
                // The periodic fail-safe below handles recovery fetches while disconnected.
            });

        socketService.addEventListener("connect", handleConnect);
        socketService.addEventListener("disconnect", handleDisconnect);
        socketService.addEventListener("connect_error", handleDisconnect);

        const failSafeInterval = setInterval(() => {
            const { connected } = socketService.getStatus();
            if (connected) return;

            queryClient.refetchQueries({
                queryKey: ["comments", "list", projectId],
                type: "all",
            });
        }, 300000);

        return () => {
            isMounted = false;
            clearInterval(failSafeInterval);
            socketService.removeEventListener("connect", handleConnect);
            socketService.removeEventListener("disconnect", handleDisconnect);
            socketService.removeEventListener("connect_error", handleDisconnect);
            socketService.leaveProject(projectId);
        };
    }, [activeTab, projectId, queryClient, userId]);

    return (
        <div className={`relative h-full ${className}`}>
            <SidebarToggle onToggle={onToggle} />

            {/* Collapsible Content Container */}
            <div
                className={`
                    fixed lg:relative top-1/2 lg:top-0 right-0 lg:right-auto
                    -translate-y-1/2 lg:translate-y-0
                    h-[100dvh] lg:max-h-full
                    bg-background border-l-2 border-border shadow-xl
                    transition-all duration-500 ease-in-out z-60
                    ${isExpanded ? "w-screen lg:w-51 xl:w-68 2xl:w-76 3xl:w-96 3xl:rounded-2xl 2xl:rounded-xl xl:rounded-lg lg:rounded-md" : "w-0"}
                    overflow-x-hidden custom-scrollbar
                `}
            >
                <div className="flex flex-col h-full w-screen lg:w-51 xl:w-68 2xl:w-76 3xl:w-96">
                    <SidebarHeader onToggle={onToggle} showAddMemberButton={showAddMemberButton} />
                    <SidebarTabs />

                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">

                        {activeTab === "history" && (
                            <HistoryTab
                                projectId={projectId}
                                selectedFields={selectedFields}
                                onClearField={onClearField}
                                view={view}
                            />
                        )}

                        {activeTab === "chat" && (
                             <CommentsTab projectId={projectId} />
                        )}

                        {activeTab === "members" && (
                             <MembersTab projectId={projectId} />
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectActivitySidebar;
