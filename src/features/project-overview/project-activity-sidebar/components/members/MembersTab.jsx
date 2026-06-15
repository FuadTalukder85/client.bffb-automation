import React from 'react';
import ProjectMembersManagement from '@/features/project-overview/components/ProjectMembersManagement';

const MembersTab = ({ projectId }) => {
    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0">
                <ProjectMembersManagement projectId={projectId} />
            </div>
        </div>
    );
};

export default MembersTab;
