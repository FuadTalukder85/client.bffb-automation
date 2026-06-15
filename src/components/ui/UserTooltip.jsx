import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail } from 'lucide-react';

// @deprecated - This component is deprecated and should not be used
// const UserTooltip = ({ user, children, delay = 300 }) => {
//     const [isVisible, setIsVisible] = useState(false);
//     const [coords, setCoords] = useState({ x: 0, y: 0 });
//     const timerRef = useRef(null);
//     const triggerRef = useRef(null);
//
//     const handleMouseEnter = (e) => {
//         const rect = e.currentTarget.getBoundingClientRect();
//         setCoords({
//             x: rect.left + rect.width / 2,
//             y: rect.top
//         });
//
//         timerRef.current = setTimeout(() => {
//             setIsVisible(true);
//         }, delay);
//     };
//
//     const handleMouseLeave = () => {
//         if (timerRef.current) clearTimeout(timerRef.current);
//         setIsVisible(false);
//     };
//
//     useEffect(() => {
//         return () => {
//             if (timerRef.current) clearTimeout(timerRef.current);
//         };
//     }, []);
//
//     const tooltipContent = (
//         <AnimatePresence>
//             {isVisible && (
//                 <motion.div
//                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: -10, scale: 1 }}
//                     exit={{ opacity: 0, y: 5, scale: 0.95 }}
//                     transition={{ duration: 0.15, ease: "easeOut" }}
//                     style={{
//                         position: 'fixed',
//                         left: coords.x,
//                         top: coords.y,
//                         transform: 'translate(-50%, -100%)',
//                         zIndex: 9999,
//                         pointerEvents: 'none'
//                     }}
//                     className="w-64 bg-background border border-border rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden"
//                 >
//                     <div className="p-4 flex flex-col items-center text-center gap-3">
//                         <div className="relative">
//                             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
//                                 {user?.avatar ? (
//                                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
//                                 ) : (
//                                     <User className="w-8 h-8 text-primary" />
//                                 )}
//                             </div>
//                             <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" title="Online"></div>
//                         </div>
//
//                         <div className="space-y-1">
//                             <h4 className="font-bold text-foreground text-lg leading-tight">
//                                 {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || 'Unknown User'}
//                             </h4>
//                             <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
//                                 <Mail className="w-3 h-3" />
//                                 <span className="truncate max-w-[180px]">{user?.email || 'No email provided'}</span>
//                             </div>
//                         </div>
//
//                         <div className="w-full pt-3 mt-1 border-t border-border/50">
//                             <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
//                                 {user?.role || 'Member'}
//                             </p>
//                         </div>
//                     </div>
//                 </motion.div>
//             )}
//         </AnimatePresence>
//     );
//
//     return (
//         <>
//             <div
//                 ref={triggerRef}
//                 onMouseEnter={handleMouseEnter}
//                 onMouseLeave={handleMouseLeave}
//                 className="inline-block"
//             >
//                 {children}
//             </div>
//             {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
//         </>
//     );
// };

// export default UserTooltip;
