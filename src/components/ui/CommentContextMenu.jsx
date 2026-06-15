import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, MessageSquareReply, Copy } from 'lucide-react';

export function CommentContextMenu({
  children,
  comment,
  currentUser,
  onEdit,
  onDelete,
  onReply,
  canEdit = true,
  canDelete = true,
  canReply = true,
  trigger = 'contextMenu'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingAnchor, setPendingAnchor] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const isOwner = String(comment?.createdBy?._id || comment?.createdBy?.id || comment?.createdBy) === String(currentUser?._id || currentUser?.id);

  const handleContextMenu = (e) => {
    if (trigger !== 'contextMenu') return;
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to parent elements
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) openMenu(null, null, rect);
    else openMenu(e.clientX, e.clientY);
  };

  const handleClick = (e) => {
    if (trigger !== 'click') return;
    e.preventDefault();
    e.stopPropagation();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (isOpen) {
      closeMenu();
    } else {
      if (rect) openMenu(null, null, rect);
      else openMenu(e.clientX, e.clientY);
    }
  };

  const handleTouchStart = (e) => {
    const timer = setTimeout(() => {
      const touch = e.touches[0];
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) openMenu(null, null, rect);
      else openMenu(touch.clientX, touch.clientY);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const openMenu = (x, y, anchorRect) => {
    // Store the anchor (coords or rect) and open the menu; final position
    // will be computed after the menu is rendered (measured) to handle
    // responsive widths accurately.
    setPendingAnchor({ x, y, rect: anchorRect });
    setIsOpen(true);
  };

  // When menu opens, measure its real size and compute final position.
  useEffect(() => {
    if (!isOpen || !menuRef.current || !pendingAnchor) return;

    const computePosition = () => {
      const menuWidth = menuRef.current.offsetWidth || 0;
      const menuHeight = menuRef.current.offsetHeight || 0;
      let posX = 0;
      let posY = 0;

      if (pendingAnchor.rect) {
        const rect = pendingAnchor.rect;
        // Align right edge of menu with trigger right edge by default
        posX = Math.round(rect.right - menuWidth);
        if (posX < 8) {
          // fallback to centered on trigger
          posX = Math.round(rect.left + (rect.width - menuWidth) / 2);
        }

        // prefer below trigger
        posY = Math.round(rect.bottom + 8);
        if (posY + menuHeight > window.innerHeight - 8) {
          posY = Math.round(rect.top - menuHeight - 8);
        }

        if (posY < 8) posY = 8;

        if (posX + menuWidth > window.innerWidth - 8) posX = window.innerWidth - menuWidth - 8;
        if (posX < 8) posX = 8;
      } else {
        posX = pendingAnchor.x || 0;
        posY = pendingAnchor.y || 0;
        if (posX + menuWidth > window.innerWidth) posX = posX - menuWidth;
        if (posY + menuHeight > window.innerHeight) posY = posY - menuHeight;
      }

      setPosition({ x: posX, y: posY });
      // clear pending anchor after computing
      setPendingAnchor(null);
    };

    // Use requestAnimationFrame to ensure layout is stable
    const raf = requestAnimationFrame(computePosition);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, pendingAnchor]);

  const closeMenu = () => {
    setIsOpen(false);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);


  const handleEdit = () => {
    onEdit?.(comment);
    // Small delay to ensure the action is processed before closing
    setTimeout(() => closeMenu(), 50);
  };

  const handleDelete = () => {
    onDelete?.(comment._id);
    // Small delay to ensure the action is processed before closing
    setTimeout(() => closeMenu(), 50);
  };

  const handleReply = () => {
    onReply?.(comment);
    // Small delay to ensure the action is processed before closing
    setTimeout(() => closeMenu(), 50);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(comment?.content || '');
      // Could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy comment:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = comment?.content || '';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    // Small delay to ensure the action is processed before closing
    setTimeout(() => closeMenu(), 50);
  };

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 9999,
          }}
          className="bg-background border border-border rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="flex items-center gap-1 p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2">
            {!showDeleteConfirm ? (
              <div className=''>
                <div>
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 text-gray-600 hover:bg-muted rounded transition-colors"
                  title="Copy comment"
                >
                  <Copy className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
                  <span className='text-xs lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base'>Copy</span>
                </button>
                </div>
                <div>
                  {canReply && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReply();
                    }}
                    className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 text-primary hover:bg-muted rounded transition-colors"
                    title="Reply"
                  >
                    <MessageSquareReply className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
                    <span className='text-xs lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base'>Reply</span>
                  </button>
                )}
                </div>

                <div>
                  {isOwner && canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 text-blue-600 hover:bg-muted rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
                    <span className='text-xs lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base'>Edit</span>
                  </button>
                )}
                </div>

               <div>
                 {isOwner && canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 text-red-600 hover:bg-muted rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4" />
                    <span className='text-xs lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base'>Delete</span>
                  </button>
                )}
               </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="px-3 h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded transition-colors whitespace-nowrap"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-2 h-8 lg:h-5.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-medium text-muted-foreground hover:bg-muted rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="inline-block"
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </>
  );
}