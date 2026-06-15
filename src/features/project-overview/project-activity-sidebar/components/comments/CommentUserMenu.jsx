import React, { useState, useRef, useEffect, useMemo, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, UserMinus, UserPlus, X, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/useUsers';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useRemoveProjectMember, useAddProjectMember } from '@/hooks/mutations/useProjectMemberMutations';
import { PERMISSIONS } from '@/constants/permissions';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

// @deprecated - This component is deprecated and should not be used
// const CommentUserMenu = ({ userId, projectId, children, className = "", memberStatusMap }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [coords, setCoords] = useState({ x: 0, y: 0 });
//     const menuRef = useRef(null);
//     const triggerRef = useRef(null);
//
//     const queryClient = useQueryClient();
//
//     // Only fetch user data when menu is open and userId exists
//     const shouldFetch = isOpen && userId;
//     const { data: user, isLoading, error } = useUser(shouldFetch ? userId : null);
//
//     // Check if current user has permission to remove/add members
//     const { permissions } = useUserPermissions();
//     const canRemoveMember = permissions.includes(PERMISSIONS.PROJECT_MEMBER.REMOVE);
//     const canAddMember = permissions.includes(PERMISSIONS.PROJECT_MEMBER.ADD);
//
//     // Get member status from parent (for when this component is used independently)
//     const isProjectMember = useMemo(() => {
//         // If no memberStatusMap provided, default to true (safe fallback)
//         if (!memberStatusMap) return true;
//
//         return memberStatusMap.has(userId) ? memberStatusMap.get(userId) : true;
//     }, [memberStatusMap, userId]);
//
//     // Remove and add member mutations
//     const removeMemberMutation = useRemoveProjectMember();
//     const addMemberMutation = useAddProjectMember();
//
//     const handleClick = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//
//         const rect = e.currentTarget.getBoundingClientRect();
//         setCoords({
//             x: rect.left + rect.width / 2,
//             y: rect.bottom + 4
//         });
//
//         setIsOpen(!isOpen);
//     };
//
//     // Close menu when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (menuRef.current && !menuRef.current.contains(event.target) &&
//                 triggerRef.current && !triggerRef.current.contains(event.target)) {
//                 setIsOpen(false);
//             }
//         };
//
//         if (isOpen) {
//             document.addEventListener('mousedown', handleClickOutside);
//         }
//
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isOpen]);
//
//     // Close menu when pressing Escape
//     useEffect(() => {
//         const handleEscape = (event) => {
//             if (event.key === 'Escape' && isOpen) {
//                 setIsOpen(false);
//             }
//         };
//
//         if (isOpen) {
//             document.addEventListener('keydown', handleEscape);
//         }
//
//         return () => {
//             document.removeEventListener('keydown', handleEscape);
//         };
//     }, [isOpen]);
//
//     const handleRemoveMember = async () => {
//         if (!userId || !projectId) return;
//
//         if (!window.confirm(`Are you sure you want to remove ${user?.name || user?.firstName || 'this user'} from project?`)) {
//             return;
//         }
//
//         try {
//             await removeMemberMutation.mutateAsync({ projectId, userId });
//             setIsOpen(false);
//         } catch (error) {
//             console.error('Failed to remove member:', error);
//             // You could show a toast notification here
//         }
//     };
//
//     const handleAddMember = async () => {
//         if (!userId || !projectId) return;
//
//         try {
//             await addMemberMutation.mutateAsync({ projectId, userId });
//             setIsOpen(false);
//         } catch (error) {
//             console.error('Failed to add member:', error);
//             // You could show a toast notification here
//         }
//     };
//
//     const menuContent = (
//         <AnimatePresence>
//             {isOpen && (
//                 <motion.div
//                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                     transition={{ duration: 0.15, ease: "easeOut" }}
//                     style={{
//                         position: 'fixed',
//                         left: coords.x,
//                         top: coords.y,
//                         transform: 'translate(-50%, 0%)',
//                         zIndex: 9999,
//                     }}
//                     ref={menuRef}
//                     className="w-80 bg-background border border-border rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden"
//                 >
//                     {isLoading ? (
//                         <div className="p-4 flex flex-col items-center text-center gap-3">
//                             <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
//                             <div className="space-y-2 w-full">
//                                 <div className="h-4 bg-muted rounded animate-pulse" />
//                                 <div className="h-3 bg-muted rounded animate-pulse w-3/4 mx-auto" />
//                             </div>
//                             <div className="w-full pt-3 mt-1 border-t border-border/50">
//                                 <div className="h-3 bg-muted rounded animate-pulse w-1/2 mx-auto" />
//                             </div>
//                         </div>
//                     ) : error ? (
//                         <div className="p-4 flex flex-col items-center text-center gap-3">
//                             <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
//                                 <X className="w-8 h-8 text-muted-foreground" />
//                             </div>
//                             <div className="space-y-1">
//                                 <h4 className="font-bold text-foreground text-lg leading-tight">
//                                     Error Loading User
//                                 </h4>
//                                 <p className="text-sm text-muted-foreground">
//                                     Unable to fetch user information
//                                 </p>
//                             </div>
//                         </div>
//                     ) : user ? (
//                         <>
//                             <div className="p-4 flex flex-col items-center text-center gap-3">
//                                 <div className="relative">
//                                     <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 overflow-hidden ${
//                                         isProjectMember ? 'bg-primary/10 border-primary/20' : 'bg-red-50 border-red-200'
//                                     }`}>
//                                         {user?.avatar ? (
//                                             <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
//                                         ) : (
//                                             <User className={`w-8 h-8 ${isProjectMember ? 'text-primary' : 'text-red-600'}`} />
//                                         )}
//                                     </div>
//                                     <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-background rounded-full ${
//                                         isProjectMember ? 'bg-green-500' : 'bg-red-500'
//                                     }`} title={isProjectMember ? 'Project Member' : 'Not a Project Member'}></div>
//                                 </div>
//
//                                 <div className="space-y-1">
//                                     <h4 className={`font-bold text-lg leading-tight ${
//                                         isProjectMember ? 'text-foreground' : 'text-red-600'
//                                     }`}>
//                                         {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'Unknown User'}
//                                         {!isProjectMember && (
//                                             <span className="block text-xs text-red-500 font-normal mt-1">Not a Project Member</span>
//                                         )}
//                                     </h4>
//                                     <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
//                                         <Mail className="w-3 h-3" />
//                                         <span className="truncate max-w-[180px]">{user?.email || 'No email provided'}</span>
//                                     </div>
//                                 </div>
//
//                                 <div className="w-full pt-3 mt-1 border-t border-border/50">
//                                     <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
//                                         {user?.role || 'Member'}
//                                     </p>
//                                 </div>
//                             </div>
//
//                             {/* Add/Remove Member Action */}
//                             {(canRemoveMember || canAddMember) && (
//                                 <div className="w-full p-3 border-t border-border/50 bg-muted/30">
//                                     {isProjectMember && canRemoveMember ? (
//                                         <button
//                                             onClick={handleRemoveMember}
//                                             disabled={removeMemberMutation.isPending}
//                                             className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
//                                         >
//                                             {removeMemberMutation.isPending ? (
//                                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                             ) : (
//                                                 <UserMinus className="w-4 h-4" />
//                                             )}
//                                             {removeMemberMutation.isPending ? 'Removing...' : 'Remove from Project'}
//                                         </button>
//                                     ) : !isProjectMember && canAddMember ? (
//                                         <button
//                                             onClick={handleAddMember}
//                                             disabled={addMemberMutation.isPending}
//                                             className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
//                                         >
//                                             {addMemberMutation.isPending ? (
//                                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                             ) : (
//                                                 <UserPlus className="w-4 h-4" />
//                                             )}
//                                             {addMemberMutation.isPending ? 'Adding...' : 'Add to Project'}
//                                         </button>
//                                     ) : null}
//                                 </div>
//                             )}
//                         </>
//                     ) : (
//                         <div className="p-4 flex flex-col items-center text-center gap-3">
//                             <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
//                                 <User className="w-8 h-8 text-muted-foreground" />
//                             </div>
//                             <div className="space-y-1">
//                                 <h4 className="font-bold text-foreground text-lg leading-tight">
//                                     User Not Found
//                                 </h4>
//                             </div>
//                         </div>
//                     )}
//                 </motion.div>
//             )}
//         </AnimatePresence>
//     );
//
//     return (
//         <>
//             <div
//                 ref={triggerRef}
//                 onClick={handleClick}
//                 className="inline-block"
//         >
//             <div>
//                 {cloneElement(children, {
//                     className: isProjectMember
//                         ? children.props.className
//                         : `${children.props.className || ''} text-red-600/70 hover:text-red-700`
//                 })}
//             </div>
//         </div>
//         {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
//         </>
//     );
// };
//
// export default CommentUserMenu;