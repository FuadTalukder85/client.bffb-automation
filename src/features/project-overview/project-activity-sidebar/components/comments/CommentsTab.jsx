import React, { useState, useEffect, useRef } from 'react';
import { useProjectCommentsInfinite, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/useProjectComments";
import { useAuthStore } from "@/store/useAuthStore";
import { useUsers } from "@/hooks/useUsers";
import { useProjectActivityStore } from '../../stores/ProjectActivityStore';
import { useProjectMemberStatus } from '@/hooks/useProjectMemberStatus';
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useSocketComments } from "@/hooks/useSocketComments";
import PERMISSIONS from "@/constants/permissions";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { hasPermission } from "@/lib/utils";

import CommentsList from './CommentsList';
import CommentsFilter from './CommentsFilter';
import CommentInput from './CommentInput';
import MentionedUser from './MentionedUser';
import { AddProjectMembers } from '@/features/project-overview/components/AddProjectMembers';
import { useMemo } from 'react';

const CommentsTab = ({ projectId }) => {
    // Stores
    const { user: currentUser } = useAuthStore();
    const userId = currentUser?.id || currentUser?._id;
    const { filters } = useProjectActivityStore();
    const { searchQuery, startDate, endDate, userIds } = filters;
    const { data: allUsers = [] } = useUsers({});

    // Local State
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [commentFeedback, setCommentFeedback] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);

    // Editing state
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editInput, setEditInput] = useState("");
    const [isDeletingId, setIsDeletingId] = useState(null);
    
    // Add member drawer state
    const [showAddMemberForm, setShowAddMemberForm] = useState(false);

    // Refs
    const scrollToBottomRef = useRef(null);
    const inputRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Data Fetching
    const {
        data: commentsDataFromHook,
        isLoading: commentsLoadingFromHook,
        error: commentsError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: refetchComments
    } = useProjectCommentsInfinite(projectId, userId, {
        limit: 20,
        search: debouncedSearch,
        startDate,
        endDate,
        userIds
    });

    // Socket integration for typing and presence
    const { typingUsers, activeUsers, startTyping, stopTyping, sendActivity } = useSocketComments(projectId, userId);

    // Extract unique user IDs from comments for batch member status checking
    const commentUserIds = useMemo(() => {
        if (!commentsDataFromHook?.pages) return [];
        
        const allCommentUserIds = new Set();
        
        const getUserId = (user) => {
            if (typeof user === 'string') return user;
            if (user && typeof user === 'object') {
                const id = user._id || user.id;
                return id ? String(id) : null;
            }
            return null;
        };
        
        commentsDataFromHook.pages.forEach(page => {
            page.data?.forEach(comment => {
                // Add comment creator
                const createdById = getUserId(comment.createdBy);
                if (createdById) allCommentUserIds.add(createdById);
                
                // Add mentioned users
                if (comment.mentions && Array.isArray(comment.mentions)) {
                    comment.mentions.forEach(mention => {
                        const mentionId = getUserId(mention);
                        if (mentionId) allCommentUserIds.add(mentionId);
                    });
                }
            });
        });
        
        return Array.from(allCommentUserIds);
    }, [commentsDataFromHook?.pages]);

    // Get batch member status for all users in comments
    const { data: memberStatusMap } = useProjectMemberStatus(projectId, commentUserIds);
    
    // Get project members for add member functionality
    const { data: members, refetch: refetchMembers } = useProjectMembers(projectId);
    const { permissions } = useUserPermissions();
    
    // Permission check for adding members
    const canAddMembers = hasPermission(permissions, PERMISSIONS.PROJECT_MEMBER.ADD);

    const createCommentMutation = useCreateComment();
    const updateCommentMutation = useUpdateComment();
    const deleteCommentMutation = useDeleteComment();

    // Handlers
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetchComments();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Simplified mention extraction logic from previous file
            const mentions = [];
            const sortedUsers = [...allUsers].sort((a, b) => {
                const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.name || '';
                const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.name || '';
                return nameB.length - nameA.length;
            });

            let currentIdx = 0;
            const inputLower = commentInput.toLowerCase();

            while (currentIdx < commentInput.length) {
                const atIdx = commentInput.indexOf('@', currentIdx);
                if (atIdx === -1) break;

                let foundMatch = false;
                for (const user of sortedUsers) {
                    const displayName = (`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '').toLowerCase();
                    if (!displayName) continue;

                    if (inputLower.substring(atIdx + 1, atIdx + 1 + displayName.length) === displayName) {
                         const nextChar = commentInput[atIdx + 1 + displayName.length];
                        if (!nextChar || /\s|[.,!?;:]/.test(nextChar)) {
                            mentions.push(user._id || user.id);
                            currentIdx = atIdx + 1 + displayName.length;
                            foundMatch = true;
                            break;
                        }
                    }
                }
                if (!foundMatch) currentIdx = atIdx + 1;
            }

            const createResponse = await createCommentMutation.mutateAsync({
                projectId,
                content: commentInput,
                mentions: [...new Set(mentions)],
                ...(replyingTo && { parentId: replyingTo._id }),
            });

            if (createResponse?.meta?.noPermissionToAdd) {
                setCommentFeedback({
                    type: 'warning',
                    message: `Comment posted, but some users couldn't be added as project members due to your permissions.`
                });
                setTimeout(() => setCommentFeedback(null), 5000);
            }

            setCommentInput("");
            setReplyingTo(null);
            await refetchComments();

            // Scroll to bottom after sending
            setTimeout(() => {
                scrollToBottomRef.current?.();
            }, 100);

        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (commentId) => {
        if (!editInput.trim()) return;
        try {
            await updateCommentMutation.mutateAsync({
                id: commentId,
                projectId,
                content: editInput
            });
            setEditingCommentId(null);
            setEditInput("");

            // Item 3: Refetch after editing
            await refetchComments();

        } catch (error) {
            console.error('Failed to update comment:', error);
        }
    };

    const handleDelete = async (commentId) => {
        setIsDeletingId(commentId);
        try {
            await deleteCommentMutation.mutateAsync({ id: commentId, projectId });
            // Refetch after delete as well to be safe
            // await refetchComments(); // Mutation already handles invalidation
        } catch (error) {
            console.error('Failed to delete comment:', error);
        } finally {
            setIsDeletingId(null);
        }
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleReply = (comment) => {
        setReplyingTo(comment);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleNavigateToComment = async (commentId) => {
        // Navigation functionality removed for performance reasons
        console.log(`Navigation to comment ${commentId} is disabled`);
    };

    // Helpers
    const getUserDisplayName = (userData) => {
        if (!userData) return "Unknown User";
        if (typeof userData === 'object') {
            if (userData.name) return userData.name;
            if (userData.firstName || userData.lastName) {
                return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            }
            return "Unknown User";
        }
        if (typeof userData === 'string') {
            const user = allUsers.find(u => u._id === userData || u.id === userData);
            if (user) {
                return `${user.firstName || user.name || "Unknown"} ${user.lastName || ""}`.trim();
            }
            return "Unknown User";
        }
        return "Unknown User";
    };

    const renderCommentContent = (content) => {
        if (!content) return null;
        const sortedUsers = [...allUsers].sort((a, b) => {
            const nameA = (`${a.firstName || ''} ${a.lastName || ''}`.trim() || a.name || '').toLowerCase();
            const nameB = (`${b.firstName || ''} ${b.lastName || ''}`.trim() || b.name || '').toLowerCase();
            return nameB.length - nameA.length;
        });

        // Split content by line breaks first
        const lines = content.split('\n');
        const parts = [];

        lines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
                parts.push(<br key={`br-${lineIndex}`} />);
            }

            let currentIndex = 0;
            const lineLower = line.toLowerCase();

            while (currentIndex < line.length) {
                const nextAtIndex = line.indexOf('@', currentIndex);
                if (nextAtIndex === -1) {
                    if (currentIndex < line.length) {
                        parts.push(<span key={`text-${lineIndex}-${currentIndex}`} className="whitespace-pre-wrap">{line.substring(currentIndex)}</span>);
                    }
                    break;
                }

                if (nextAtIndex > currentIndex) {
                    parts.push(<span key={`text-${lineIndex}-${currentIndex}`} className="whitespace-pre-wrap">{line.substring(currentIndex, nextAtIndex)}</span>);
                }

                let matchedUser = null;
                let matchedNameLength = 0;

                for (const user of sortedUsers) {
                    const displayName = (`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '').toLowerCase();
                    if (!displayName) continue;
                    if (nextAtIndex + 1 + displayName.length > line.length) continue;

                    const textAfterAt = lineLower.substring(nextAtIndex + 1, nextAtIndex + 1 + displayName.length);
                    if (textAfterAt === displayName) {
                        const nextChar = line[nextAtIndex + 1 + displayName.length];
                        if (!nextChar || /\s|[.,!?;:]/.test(nextChar)) {
                            matchedUser = user;
                            matchedNameLength = displayName.length;
                            break;
                        }
                    }
                }

                if (matchedUser) {
                    const mentionUserId = matchedUser._id || matchedUser.id;
                    parts.push(
                        <MentionedUser
                            key={`mention-${lineIndex}-${nextAtIndex}`}
                            userId={mentionUserId}
                            projectId={projectId}
                            memberStatusMap={memberStatusMap}
                            allUsers={allUsers}
                            onInsertMention={handleInsertMention}
                        >
                            {line.substring(nextAtIndex, nextAtIndex + 1 + matchedNameLength)}
                        </MentionedUser>
                    );
                    currentIndex = nextAtIndex + 1 + matchedNameLength;
                } else {
                    parts.push(<span key={`at-${lineIndex}-${nextAtIndex}`}>@</span>);
                    currentIndex = nextAtIndex + 1;
                }
            }
        });

        return parts;
    };

    const handleInsertMention = (mention) => {
        setCommentInput(prev => prev + mention);
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden pt-2 lg:pt-2.5 xl:pt-3 2xl:pt-3.5 3xl:pt-4 px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4">
            <CommentsFilter
                totalComments={commentsDataFromHook?.pages?.reduce((total, page) => total + (page.data?.length || 0), 0) || 0}
                debouncedSearch={debouncedSearch}
                isRefreshing={isRefreshing}
                 isCommentsLoading={commentsLoadingFromHook}
                onRefresh={handleRefresh}
                canAddMembers={canAddMembers}
                showAddMemberForm={showAddMemberForm}
                setShowAddMemberForm={setShowAddMemberForm}
            />

            <CommentsList
                commentsData={commentsDataFromHook}
                commentsError={commentsError}
                currentUser={currentUser}
                allUsers={allUsers}
                 isCommentsLoading={commentsLoadingFromHook}
                isRefreshing={isRefreshing}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                editingCommentId={editingCommentId}
                editInput={editInput}
                setEditInput={setEditInput}
                isDeletingId={isDeletingId}
                activeUsers={activeUsers}
                onStartEdit={(comment) => {
                    setEditingCommentId(comment._id);
                    setEditInput(comment.content);
                }}
                onCancelEdit={() => {
                    setEditingCommentId(null);
                    setEditInput("");
                }}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                renderCommentContent={renderCommentContent}
                getUserDisplayName={getUserDisplayName}
                scrollToBottomRef={scrollToBottomRef}
                projectId={projectId}
                memberStatusMap={memberStatusMap}
                onInsertMention={handleInsertMention}
                onReply={handleReply}
                onNavigateToComment={handleNavigateToComment}
            />

            {commentsError?.response?.status !== 403 && (
                <>
                    {/* Typing Indicator */}
                    {typingUsers.length > 0 && (
                        <div className="px-4 pb-2 select-none animate-pulse">
                            <div className="text-xs text-muted-foreground italic">
                                {typingUsers.length === 1 ? (
                                    `${getUserDisplayName(typingUsers[0])} is typing...`
                                ) : (
                                    `${typingUsers.length} people are typing...`
                                )}
                            </div>
                        </div>
                    )}

                    <CommentInput
                        commentInput={commentInput}
                        setCommentInput={setCommentInput}
                        handleSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        allUsers={allUsers}
                        projectId={projectId}
                        commentFeedback={commentFeedback}
                        setCommentFeedback={setCommentFeedback}
                        ref={inputRef}
                        replyingTo={replyingTo}
                        onCancelReply={handleCancelReply}
                        onNavigateToComment={handleNavigateToComment}
                        onStartTyping={startTyping}
                        onStopTyping={stopTyping}
                        onActivity={sendActivity}
                    />
                </>
            )}
            
            {/* Add Member Drawer - Absolute overlay from bottom */}
            <AnimatePresence>
                {showAddMemberForm && canAddMembers && (
                    <motion.div
                        className="absolute bottom-2 left-0 right-0 bg-background border rounded border-border shadow-lg z-30 py-3 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-3 px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 mx-3"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="flex items-center justify-between mb-3 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">
                            <h3 className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-foreground">Add Project Member</h3>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowAddMemberForm(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
                            </motion.button>
                        </div>
                        <AddProjectMembers 
                            projectId={projectId} 
                            members={members} 
                            onSuccess={() => { 
                                refetchMembers(); 
                                setShowAddMemberForm(false); 
                            }} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommentsTab;
