import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, AlertCircle, X } from 'lucide-react';
import MentionInput from '../shared/MentionInput';
import { ParentCommentPreview } from '@/components/comments/ParentCommentPreview';

const CommentInput = ({
    commentInput,
    setCommentInput,
    handleSubmit,
    isSubmitting,
    allUsers,
    projectId,
    commentFeedback,
    setCommentFeedback,
    replyingTo,
    onCancelReply,
    onNavigateToComment,
    onStartTyping,
    onStopTyping,
    onActivity
}) => {
    const textareaRef = useRef(null);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (replyingTo && textareaRef.current) {
            const userName = replyingTo.createdBy?.firstName
                ? `${replyingTo.createdBy.firstName} ${replyingTo.createdBy.lastName || ''}`.trim()
                : replyingTo.createdBy?.name || 'Unknown User';

            const mention = `@${userName} `;
            setCommentInput(prev => {
                if (prev.startsWith(mention)) return prev;
                return mention + prev;
            });

            textareaRef.current.focus();
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = mention.length;
                    textareaRef.current.selectionEnd = mention.length;
                }
            }, 0);
        }
    }, [replyingTo, setCommentInput, textareaRef]);

    const handleCancelReply = () => {
        const userName = replyingTo?.createdBy?.firstName
            ? `${replyingTo.createdBy.firstName} ${replyingTo.createdBy.lastName || ''}`.trim()
            : replyingTo?.createdBy?.name || 'Unknown User';

        const mention = `@${userName} `;
        if (commentInput.startsWith(mention)) {
            setCommentInput(commentInput.slice(mention.length));
        }
        onCancelReply?.();
    };

    const handleFocus = () => {
        onActivity?.();
    };

    const handleKeyDown = () => {
        onActivity?.();
        
        // Start typing indicator with debounce
        if (!isTyping && commentInput.trim()) {
            // Clear any existing timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            // Start typing immediately
            setIsTyping(true);
            onStartTyping?.();
            
            // Set timeout to stop typing after 5 seconds of inactivity
            const timeout = setTimeout(() => {
                setIsTyping(false);
                onStopTyping?.();
                setTypingTimeout(null);
            }, 5000);
            
            setTypingTimeout(timeout);
        }
    };

    const handleKeyUp = () => {
        // Reset the typing timeout on each keypress
        if (isTyping) {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            const timeout = setTimeout(() => {
                setIsTyping(false);
                onStopTyping?.();
                setTypingTimeout(null);
            }, 2000); // Stop typing after 2 seconds of no input
            
            setTypingTimeout(timeout);
        }
    };

    const handleBlur = () => {
        // Stop typing when input loses focus
        if (isTyping) {
            setIsTyping(false);
            onStopTyping?.();
            if (typingTimeout) {
                clearTimeout(typingTimeout);
                setTypingTimeout(null);
            }
        }
    };

    return (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-background border-t border-border pt-2 lg:pt-2 xl:pt-2.5 2xl:pt-3 3xl:pt-4 px-4 lg:px-0 md:sticky md:bottom-0 md:z-20">
            {replyingTo && (
                <ParentCommentPreview
                    parentComment={replyingTo}
                    onCancel={handleCancelReply}
                    onNavigate={onNavigateToComment}
                />
            )}

            {commentFeedback && (
                <div className={`mb-1.5 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 p-1.5 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 rounded-lg border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${commentFeedback.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-red-500/10 border-red-500/20 text-red-600'
                    }`}>
                    <AlertCircle className="w-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 shrink-0 mt-0.5" />
                    <div className="lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium">{commentFeedback.message}</div>
                    <button onClick={() => setCommentFeedback(null)} className="ml-auto">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative w-full">
                <MentionInput
                    ref={textareaRef}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    placeholder={replyingTo ? "Type your reply..." : "Type a message or mention someone..."}
                    className="w-full pr-6 lg:pr-7 xl:pr-8 2xl:pr-9.5 3xl:pr-12 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2.5 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 lg:text-left text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all leading-tight"
                    users={allUsers}
                    projectId={projectId}
                    onSubmit={handleSubmit}
                    renderButton={() => (
                        <button
                            type="submit"
                            disabled={!commentInput.trim() || isSubmitting}
                            className="absolute bottom-2.75 lg:bottom-2 xl:bottom-2.5 2xl:bottom-2.25 3xl:bottom-2.75 right-1 lg:right-0.5 xl:right-1 h-8 w-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 flex items-center justify-center bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 animate-spin text-white" />
                            ) : (
                                <Send className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 text-white" />
                            )}
                        </button>
                    )}
                />
            </form>
        </div>
    );
};

export default CommentInput;
