import React from 'react';
import { X } from 'lucide-react';
import { User } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

export function ParentCommentPreview({ parentComment, onCancel, onNavigate }) {
  if (!parentComment) return null;

  const parentId = typeof parentComment === 'string' ? parentComment : parentComment._id;
  const hasAuthor = parentComment && typeof parentComment === 'object' && Boolean(parentComment.createdBy);
  const hasContent = parentComment && typeof parentComment === 'object' && Boolean(parentComment.content);
  const isLoaded = hasAuthor || hasContent;

  const handleNavigate = (e) => {
    e?.stopPropagation?.();
    // Navigation functionality removed for performance reasons
    console.log(`Navigation to parent comment ${parentId} is disabled`);
  };

  const formatDateTime = (date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  const truncateContent = (content, maxLength = 120) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const rawName = hasAuthor
    ? (parentComment.createdBy?.firstName
        ? `${parentComment.createdBy.firstName} ${parentComment.createdBy.lastName || ''}`.trim()
        : parentComment.createdBy?.name)
    : '';

  const userName = rawName && rawName !== 'undefined' ? rawName : 'Unknown User';

  return (
    <div 
      className="relative bg-gradient-to-r from-primary/5 to-transparent border-l lg:border-l-2 xl:border-l-2 2xl:border-l-3 3xl:border-l-4 border-primary rounded-lg p-1.5 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2 transition-all group"
      role="region"
      aria-label="Original comment being replied to"
    >
      {onCancel && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel?.();
          }}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Cancel reply"
        >
          <X className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
        </button>
      )}

      <div className="pr-3 lg:pr-3.5 xl:pr-4 2xl:pr-4.5 3xl:pr-6 space-y-1.5">
        <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
          <div className="w-6 lg:w-3 xl:w-4 2xl:w-5 3xl:w-6 h-6 lg:h-3 xl:h-4 2xl:h-5 3xl:h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
            <User className="w-3 lg:w-1.5 xl:w-2 2xl:w-2.5 3xl:w-3 h-3 lg:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3 text-primary" />
          </div>
          <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-bold text-primary uppercase tracking-wide">
            {isLoaded ? (userName !== 'Unknown User' ? `${userName}` : 'Unknown User') : 'Original comment'}
            {hasAuthor && parentComment.createdAt && (
              <span className="ml-[3px] lg:ml-[3.5px] xl:ml-[4.5px] 2xl:ml-[6px] 3xl:ml-2 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-muted-foreground normal-case">
                {formatDateTime(new Date(parentComment.createdAt))}
              </span>
            )}
          </p>
        </div>
        <div 
          className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-foreground leading-relaxed"
        >
          {hasContent
            ? truncateContent(parentComment.content)
            : isLoaded
            ? <span className="italic text-muted-foreground">Comment content not available on this page.</span>
            : <span className="italic text-muted-foreground">Original comment content not loaded.</span>}
        </div>

        {!hasContent && (
          <div className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground font-medium mt-2">
            → Original comment not available
          </div>
        )}
      </div>
    </div>
  );
}
