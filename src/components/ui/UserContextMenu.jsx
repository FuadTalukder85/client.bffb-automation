import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AtSign, UserPlus, UserMinus, User, Loader2, X } from 'lucide-react';
import { useAddProjectMember, useRemoveProjectMember } from '@/hooks/mutations/useProjectMemberMutations';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { resolveAvatarUrl } from '@/utils/avatarUrl';
import { hasPermission } from '@/lib/utils';

export function UserContextMenu({ userId, projectId, children, allUsers, isMember, onInsertMention }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  
  const user = allUsers.find(u => u._id === userId || u.id === userId);
  
  const addMemberMutation = useAddProjectMember();
  const removeMemberMutation = useRemoveProjectMember();
  const { permissions } = useUserPermissions();
  
  const canAddMember = hasPermission(permissions, PERMISSIONS.PROJECT_MEMBER.ADD);
  const canRemoveMember = hasPermission(permissions, PERMISSIONS.PROJECT_MEMBER.REMOVE);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to parent context menus
    openMenu(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    const timer = setTimeout(() => {
      const touch = e.touches[0];
      openMenu(touch.clientX, touch.clientY);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const openMenu = (x, y) => {
    const menuWidth = 320;
    const menuHeight = 250;
    
    let posX = x;
    let posY = y;
    
    if (x + menuWidth > window.innerWidth) {
      posX = window.innerWidth - menuWidth - 16;
    }
    
    if (y + menuHeight > window.innerHeight) {
      posY = y - menuHeight - 16;
    }
    
    setPosition({ x: posX, y: posY });
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
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

  const handleInsertMention = () => {
    if (!user) return;
    const mention = `@${user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name} `;
    onInsertMention?.(mention);
    closeMenu();
  };

  const handleAddMember = async () => {
    if (!userId || !projectId) return;

    try {
      await addMemberMutation.mutateAsync({ projectId, userId });
      closeMenu();
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (!userId || !projectId) return;

    if (!window.confirm(`Remove ${user?.name || 'this user'} from project?`)) {
      return;
    }

    try {
      await removeMemberMutation.mutateAsync({ projectId, userId });
      closeMenu();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const isPending = addMemberMutation.isPending || removeMemberMutation.isPending;

  if (!user) {
    return <>{children}</>;
  }

  const userAvatarUrl = resolveAvatarUrl(user?.avatar);

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
          className="3xl:w-80 2xl:w-64 xl:w-56 lg:w-42 w-40 bg-background border border-border rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4">
            <div className="flex items-start justify-between mb-3 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">
              <div className="flex items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
                <div className="w-6 lg:w-6.5 xl:w-8.5 2xl:w-9.5 3xl:w-12 h-6 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 lg:w-3 xl:w-4 2xl:w-5 3xl:w-6 h-6 lg:h-3 xl:h-4 2xl:h-5 3xl:h-6 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-[10px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'Unknown User'}
                  </h4>
                  <p className="text-[7px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground">
                    {user?.role || 'Member'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4 lg:mb-1.5 xl:mb-2 2xl:mb-3 3xl:mb-4">
              <div className="flex items-center gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">
                <Mail className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 shrink-0" />
                <span className="truncate">{user?.email || 'No email'}</span>
              </div>
            </div>

            <div className="space-y-1">
              {onInsertMention ? (
                <button
                  onClick={handleInsertMention}
                  className="w-full flex items-center gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-left rounded-lg hover:bg-muted transition-colors"
                >
                  <AtSign className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-primary" />
                  <span className="text-foreground">Mention in comment</span>
                </button>
              ) : (
                <button
                  onClick={handleInsertMention}
                  className="w-full flex items-center gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-left rounded-lg hover:bg-muted transition-colors"
                >
                  <AtSign className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-muted-foreground" />
                  <span>Copy @mention</span>
                </button>
              )}

              {(canAddMember || canRemoveMember) && (
                <>
                  {!isMember && canAddMember && (
                    <button
                      onClick={handleAddMember}
                      disabled={isPending}
                      className="w-full flex items-center gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-left text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                      )}
                      <span>Add to Project</span>
                    </button>
                  )}

                  {isMember && canRemoveMember && (
                    <button
                      onClick={handleRemoveMember}
                      disabled={isPending}
                      className="w-full flex items-center gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                      ) : (
                        <UserMinus className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                      )}
                      <span>Remove from Project</span>
                    </button>
                  )}
                </>
              )}
            </div>
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
