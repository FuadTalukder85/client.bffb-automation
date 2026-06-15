import React, { useRef, useState, useEffect } from 'react';
import { User, Edit2, Trash2, Check, Loader2, MessageSquareReply } from 'lucide-react';
import { format } from 'date-fns';
import MentionInput from '../shared/MentionInput';
import { ParentCommentPreview } from '@/components/comments/ParentCommentPreview';
import { useProjectMemberStatusSingle } from '@/hooks/useProjectMemberStatus';
import { UserContextMenu } from '@/components/ui/UserContextMenu';
import { CommentContextMenu } from '@/components/ui/CommentContextMenu';

const CommentItem = ({
    comment,
    currentUser,
    allUsers,
    editingCommentId,
    editInput,
    setEditInput,
    isDeletingId,
    onStartEdit,
    onCancelEdit,
    onUpdate,
    onDelete,
    renderCommentContent,
    getUserDisplayName,
    editInputRef,
    projectId,
    memberStatusMap,
    onInsertMention,
    onReply,
    onNavigateToComment
}) => {
    const isOwner = String(comment.createdBy?._id || comment.createdBy?.id || comment.createdBy) === String(currentUser?._id || currentUser?.id);
    const isEditing = editingCommentId === comment._id;

    const [isExpanded, setIsExpanded] = useState(false);
    const commentRef = useRef(null);
    const editingRef = useRef(null);

    useEffect(() => {
        if (commentRef.current) {
            commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [isExpanded]);

    useEffect(() => {
        if (isEditing) {
            const handleClickOutside = (event) => {
                if (editingRef.current && !editingRef.current.contains(event.target)) {
                    onCancelEdit();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isEditing, onCancelEdit]);

    const commentUserId = typeof comment.createdBy === 'object' ? String(comment.createdBy._id || comment.createdBy.id) : String(comment.createdBy);
    const isProjectMember = useProjectMemberStatusSingle(projectId, commentUserId, memberStatusMap);

    const userIconClass = `${isProjectMember ? 'w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all bg-gradient-to-br from-primary/20 to-primary/10 hover:ring-2 hover:ring-primary/30' : 'w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all bg-red-50 hover:ring-2 hover:ring-red-200'} ${comment.isDeleted ? 'opacity-40 grayscale' : ''}`;
    const userNameClass = `${isProjectMember ? 'font-bold text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm leading-none cursor-pointer hover:text-primary transition-colors' : 'font-bold text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm leading-none cursor-pointer hover:text-primary transition-colors text-red-600 opacity-70 hover:text-red-700'} ${comment.isDeleted ? 'opacity-40' : ''}`;
    const userIconInnerClass = isProjectMember ? 'w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 text-primary' : 'w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 text-red-600';

    const displayContent = (() => {
        const content = comment.content;
        const isLong = content.length > 300;
        return isExpanded || !isLong ? content : content.substring(0, 300) + "...";
    })();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onUpdate(comment._id);
        } else if (e.key === 'Escape') {
            onCancelEdit();
        }
    };

    const handleChange = (e) => setEditInput(e.target.value);

    const handleSubmit = () => onUpdate(comment._id);

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    const handleUpdate = () => onUpdate(comment._id);

    return (
        <div>
            <div id={'comment-' + comment._id} ref={commentRef} className="py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2">
                <div className="flex-1 min-w-0">
                    {comment.parentComment && (
                        <ParentCommentPreview
                            parentComment={comment.parentComment}
                            onNavigate={onNavigateToComment}
                        />
                    )}

                    <div className="flex gap-1 lg:gap-1 xl:gap-[5px] 2xl:gap-1.5 3xl:gap-2">
                        <div className="shrink-0">
                            <UserContextMenu userId={commentUserId} projectId={projectId} allUsers={allUsers} isMember={isProjectMember} onInsertMention={onInsertMention}>
                                <div className={userIconClass}>
                                    <User className={userIconInnerClass} />
                                </div>
                            </UserContextMenu>
                        </div>

                        <div className="flex items-start justify-between gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 flex-1 min-w-0">
                            <div className="flex flex-col flex-1 min-w-0">
                               <div className='flex justify-between items-center'>
                                 <div className="flex gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 items-baseline">
                                    <UserContextMenu userId={commentUserId} projectId={projectId} allUsers={allUsers} isMember={isProjectMember} onInsertMention={onInsertMention}>
                                        <span className={userNameClass}>
                                            {getUserDisplayName(comment.createdBy)}
                                        </span>
                                    </UserContextMenu>
                                    <div className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground font-medium">
                                        {format(new Date(comment.createdAt), 'h:mm a')}
                                    </div>
                                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && !comment.isDeleted && (
                                        <div className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs italic text-muted-foreground">
                                           (edited)
                                        </div>
                                    )}
                                </div>
                                <CommentContextMenu
                                    comment={comment}
                                    currentUser={currentUser}
                                    onEdit={onStartEdit}
                                    onDelete={onDelete}
                                    onReply={onReply}
                                    canEdit={!isDeletingId}
                                    canDelete={!isDeletingId}
                                    canReply={true}
                                    trigger="click"
                                >
                                    <button
                                        type="button"
                                        aria-label="Comment options"
                                        className='inline-flex items-center justify-center text-baseline cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 relative z-20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"
                                        className='w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4'>
                                            <path d="M0 0h256v256H0z" fill="none" />
                                            <path fill="currentColor" d="M112 60a16 16 0 1 1 16 16a16 16 0 0 1-16-16m16 52a16 16 0 1 0 16 16a16 16 0 0 0-16-16m0 68a16 16 0 1 0 16 16a16 16 0 0 0-16-16" />
                                        </svg>
                                    </button>
                                </CommentContextMenu>
                               </div>

                                 {isEditing ? (
                                    <div ref={editingRef} className="mt-1 w-full relative">
                                        <MentionInput
                                            ref={editInputRef}
                                            value={editInput}
                                            onChange={handleChange}
                                            onKeyDown={handleKeyDown}
                                            className="!w-full p-2 pr-10 lg:pr-5.5 xl:pr-6.5 2xl:pr-8 3xl:pr-10 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm bg-background border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-16 resize-none"
                                            autoFocus
                                            users={allUsers}
                                            projectId={projectId}
                                            onSubmit={handleSubmit}
                                            renderButton={() => (
                                                <button
                                                    onClick={handleUpdate}
                                                    disabled={!editInput.trim() || editInput.trim() === comment.content.trim()}
                                                    className="absolute bottom-2 right-2 flex items-center justify-center w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                                    title="Save changes"
                                                >
                                                    <Check className="3xl:w-3.5 2xl:w-3 xl:w-3 lg:w-2.5 3xl:h-3.5 2xl:h-3 xl:h-3 lg:h-2.5 text-white" />
                                                </button>
                                            )}
                                        />
                                    </div>
                                ) : comment.isDeleted ? (
                                    <div className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs italic text-muted-foreground/60 py-1 flex items-center gap-1.5 select-none">
                                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                        <span>
                                            {getUserDisplayName(comment.deletedBy || comment.createdBy)} deleted this comment
                                            {comment.deletedAt && ` at ${format(new Date(comment.deletedAt), 'h:mm a')}`}
                                        </span>
                                    </div>
                                ) : (
                                    <CommentContextMenu
                                        comment={comment}
                                        currentUser={currentUser}
                                        onEdit={onStartEdit}
                                        onDelete={onDelete}
                                        onReply={onReply}
                                        canEdit={!isDeletingId}
                                        canDelete={!isDeletingId}
                                        canReply={true}
                                    >
                                        <div className="select-none">
                                            <div className='text-xs lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base'>
                                                {renderCommentContent(displayContent)}
                                            </div>
                                            {comment.content.length > 300 && (
                                                <button
                                                    onClick={toggleExpanded}
                                                    className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-primary hover:text-primary/80 mt-1 transition-colors"
                                                >
                                                    {isExpanded ? 'See less' : 'See more'}
                                                </button>
                                            )}

                                        </div>
                                    </CommentContextMenu>
                                )}
                            </div>

                            {/* Centralized Actions */}
                            <div className="flex items-center gap-1 shrink-0 transition-opacity opacity-0" style={isEditing ? { opacity: 1 } : { opacity: 0 }}>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommentItem;