import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, AlertCircle, ArrowDown } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';
import CommentItem from './CommentItem';

const CommentsList = ({
    commentsData,
    commentsError,
    currentUser,
    allUsers,
    isCommentsLoading,
    isRefreshing,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
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
    scrollToBottomRef,
    projectId,
    memberStatusMap,
    onInsertMention,
    onReply,
    onNavigateToComment
}) => {
    const commentsScrollContainerRef = useRef(null);
    const loadMoreTriggerRef = useRef(null);
    const scrollPositionRef = useRef({ top: 0, height: 0 });
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    const groupCommentsByDate = (comments) => {
        if (!comments) return {};
        const groups = {};
        comments.forEach(item => {
            const date = new Date(item.createdAt);
            let dateLabel = format(date, 'MMM d yyyy');
            if (isToday(date)) dateLabel = 'Today';
            if (isYesterday(date)) dateLabel = 'Yesterday';

            if (!groups[dateLabel]) {
                groups[dateLabel] = [];
            }
            groups[dateLabel].push(item);
        });
        return groups;
    };

    // Expose scroll function to parent via ref
    useEffect(() => {
        if (scrollToBottomRef) {
            scrollToBottomRef.current = () => {
                if (commentsScrollContainerRef.current) {
                    const container = commentsScrollContainerRef.current;
                    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                }
            };
        }
    }, [scrollToBottomRef]);

    // Handle Scroll for FAB visibility
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Show button if we are more than 200px from bottom
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        setShowScrollBottom(distanceToBottom > 200);
    };

    // Auto-scroll to bottom on initial load
    const hasInitialData = commentsData?.pages?.length === 1 && commentsData?.pages?.[0]?.data?.length > 0;
    useEffect(() => {
        if (commentsScrollContainerRef.current && hasInitialData) {
            const container = commentsScrollContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    }, [hasInitialData]);

    // Maintain scroll position when new pages are loaded
    useEffect(() => {
        if (commentsScrollContainerRef.current && commentsData?.pages?.length > 1) {
            const container = commentsScrollContainerRef.current;
            const newScrollHeight = container.scrollHeight;

            if (scrollPositionRef.current.height > 0) {
                const heightDiff = newScrollHeight - scrollPositionRef.current.height;
                container.scrollTop = scrollPositionRef.current.top + heightDiff;
            }
        }
    }, [commentsData?.pages?.length]);

    // Infinite scroll observer
    useEffect(() => {
        if (!loadMoreTriggerRef.current || !commentsScrollContainerRef.current || !hasNextPage || isFetchingNextPage) return;

        const triggerElement = loadMoreTriggerRef.current;
        const scrollContainer = commentsScrollContainerRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    scrollPositionRef.current = {
                        top: scrollContainer.scrollTop,
                        height: scrollContainer.scrollHeight
                    };
                    fetchNextPage();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px 0px 0px 0px',
                root: scrollContainer
            }
        );

        observer.observe(triggerElement);
        return () => observer.unobserve(triggerElement);
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4">
             <div 
                ref={commentsScrollContainerRef} 
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar pb-20 lg:pb-2"
             >
                {commentsError?.response?.status === 403 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 lg:p-4.5 xl:p-5.5 2xl:p-6.5 3xl:p-8 bg-muted/20 rounded-xl border-2 border-dashed border-border">
                        <div className="3xl:w-16 2xl:w-12 xl:w-11 lg:w-8.5 w-8 3xl:h-16 2xl:h-12 xl:h-11 lg:h-8.5 h-8 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 lg:w-5 xl:w-6 2xl:w-7 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 text-red-500" />
                        </div>
                        <h3 className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-bold text-foreground mb-1">Access Restricted</h3>
                        <p className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-muted-foreground leading-relaxed">
                            Only project members can view or participate in this discussion.
                            Contact a project manager if you believe this is an error.
                        </p>
                    </div>
                ) : isCommentsLoading && !isRefreshing ? (
                    <div className="space-y-3 p-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-3 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 border border-border rounded-lg">
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : commentsError ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 flex items-center justify-center text-center py-8">
                            <div>
                                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-red-500/50" />
                                <p className="text-sm text-red-500 font-medium">Failed to load comments</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {commentsError?.response?.data?.message || commentsError?.message || "Please try again"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : commentsData?.pages?.[0]?.data?.length > 0 ? (
                    <div className="space-y-3 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6 pb-2 lg:pb-2.5 xl:pb-3 2xl:pb-3.5 3xl:pb-4">
                        {/* Infinite Scroll Trigger */}
                        {hasNextPage && (
                            <div ref={loadMoreTriggerRef} className="flex justify-center py-2 lg:py-2 xl:py-2.5 2xl:py-3 3xl:py-4">
                                {isFetchingNextPage ? (
                                    <Loader2 className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 animate-spin text-primary" />
                                ) : (
                                    <div className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
                                )}
                            </div>
                        )}

                        {/* Comments Grouped by Date */}
                        {Object.entries(groupCommentsByDate(
                            [...commentsData.pages.flatMap(page => page.data || [])].reverse()
                        )).map(([dateLabel, comments]) => (
                            <div key={dateLabel}>
                                {/* Sticky Date Header */}
                                <div className="sticky top-0 z-10 flex items-center justify-center my-1 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 pointer-events-none">

                                    <div className="px-3 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-0.5 xl:py-0.5 2xl:py-[3px] 3xl:py-1 bg-background/90 backdrop-blur-sm border border-border rounded-full text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-muted-foreground shadow-sm">
                                        {dateLabel}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <CommentItem
                                            key={comment._id}
                                            comment={comment}
                                            currentUser={currentUser}
                                            allUsers={allUsers}
                                            editingCommentId={editingCommentId}
                                            editInput={editInput}
                                            setEditInput={setEditInput}
                                            isDeletingId={isDeletingId}
                                            onStartEdit={onStartEdit}
                                            onCancelEdit={onCancelEdit}
                                            onUpdate={onUpdate}
                                            onDelete={onDelete}
                                            renderCommentContent={renderCommentContent}
                                            getUserDisplayName={getUserDisplayName}
                                            projectId={projectId}
                                            memberStatusMap={memberStatusMap}
                                            onInsertMention={onInsertMention}
                                            onReply={onReply}
                                            onNavigateToComment={onNavigateToComment}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 flex items-center justify-center text-center py-8">
                            <div>
                                <MessageCircle className="w-12 h-12 lg:w-8 xl:w-9 2xl:w-11 3xl:w-12 lg:h-8 xl:h-9 2xl:h-11 3xl:h-12 mx-auto mb-2 text-muted-foreground/50" />
                                <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">No comments yet</p>
                                <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-lighter-text mt-1">
                                    Start a conversation about this project
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollBottom && (
                <button
                    onClick={() => scrollToBottomRef.current?.()}
                    className="absolute bottom-4 right-6 p-2 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all z-20 active:scale-95 animate-in fade-in zoom-in duration-200"
                    title="Scroll to bottom"
                >
                    <ArrowDown className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5" />
                </button>
            )}
        </div>
    );
};

export default CommentsList;
