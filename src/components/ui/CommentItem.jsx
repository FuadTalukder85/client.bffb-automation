import React from 'react';
import { User, Edit2, Trash2, Check, X as CloseX, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import MentionInput from '../features/project-overview/project-activity-sidebar/components/shared/MentionInput';

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
    projectId
}) => {
    const isOwner = (comment.createdBy?._id || comment.createdBy?.id || comment.createdBy) === (currentUser?._id || currentUser?.id);
    const isEditing = editingCommentId === comment._id;

    // Get user ID for tooltip
    const commentUserId = typeof comment.createdBy === 'object' ? comment.createdBy._id || comment.createdBy.id : comment.createdBy;

    return (
        <div className="flex gap-3 group/comment">
            {/* User Avatar */}
            <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                    <User className="w-5 h-5" />
                </div>
            </div>

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors">
                            {getUserDisplayName(comment.createdBy)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), 'h:mm a')}
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                <span className="ml-1 text-[10px] italic">(edited)</span>
                            )}
                        </span>
                    </div>

                    {/* Actions for owner */}
                    {isOwner && (
                        <div className={`flex items-center gap-1 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover/comment:opacity-100'}`}>
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => onUpdate(comment._id)}
                                        className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                                        title="Save changes"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={onCancelEdit}
                                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                        title="Cancel edit"
                                    >
                                        <CloseX className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => onStartEdit(comment)}
                                        className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                        title="Edit comment"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(comment._id)}
                                        className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                        title="Delete comment"
                                    >
                                        {isDeletingId === comment._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="mt-1">
                        <MentionInput
                            ref={editInputRef}
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onUpdate(comment._id);
                                } else if (e.key === 'Escape') {
                                    onCancelEdit();
                                }
                            }}
                            className="w-full p-2 text-sm bg-background border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px] resize-none"
                            autoFocus
                            users={allUsers}
                            projectId={projectId}
                            onSubmit={() => onUpdate(comment._id)}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Press Enter to save, Esc to cancel</p>
                    </div>
                ) : (
                    <div className="text-sm text-foreground whitespace-pre-wrap wrap-break-word">
                        {renderCommentContent(comment.content)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
