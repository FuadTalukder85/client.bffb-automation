import React from 'react';
import { useProjectMemberStatusSingle } from '@/hooks/useProjectMemberStatus';
import { UserContextMenu } from '@/components/ui/UserContextMenu';

const MentionedUser = ({ userId, projectId, memberStatusMap, children, allUsers, onInsertMention }) => {
    const isMember = useProjectMemberStatusSingle(projectId, userId, memberStatusMap);

    return (
        <UserContextMenu userId={userId} projectId={projectId} allUsers={allUsers} isMember={isMember} onInsertMention={onInsertMention}>
            <span
                className={`font-bold cursor-pointer hover:underline decoration-primary/50 underline-offset-2 bg-primary/5 px-1 rounded transition-colors hover:bg-primary/10 ${
                    isMember ? '' : 'text-red-600/70 hover:text-red-700'
                }`}
            >
                {children}
            </span>
        </UserContextMenu>
    );
};

export default MentionedUser;