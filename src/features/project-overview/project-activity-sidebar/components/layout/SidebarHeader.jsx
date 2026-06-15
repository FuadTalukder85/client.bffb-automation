import React, { useState } from 'react';
import { ChevronRight, UserPlus } from 'lucide-react';
import { useProjectActivityStore } from '../../stores/ProjectActivityStore';
import { AddChatMemberModal } from '../modals/AddChatMemberModal';

const SidebarHeader = ({ onToggle, showAddMemberButton = false, className = "" }) => {
    const { toggleSidebar } = useProjectActivityStore();
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    const handleToggle = () => {
        // Use onToggle if provided, otherwise fall back to store toggle
        if (onToggle) {
            onToggle();
        } else {
            toggleSidebar();
        }
    };

    return (
        <>
            <div className={`flex items-center justify-between p-2 lg:p-2 xl:p-2.5 2xl:p-3.5 3xl:p-4 border-b border-border ${className}`}>
                {/* Mobile collapse button (Internal) */}
                <button
                    onClick={handleToggle}
                    className={`z-70 bg-primary border-2 border-border rounded-lg p-1 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-500 ease-in-out h-6 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 flex items-center justify-center lg:hidden`}
                    aria-label='Collapse sidebar'
                >
                    <ChevronRight className="w-6 lg:w-3 xl:w-4 2xl:w-5 3xl:w-6 h-6 lg:h-3 xl:h-4 2xl:h-5 3xl:h-6 text-primary-shade-2" />
                </button>
                <h3 className="flex-1 text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-foreground lg:flex-none">
                    Project Activity
                </h3>
                
                {/* Add Chat Member Button */}
                {showAddMemberButton && (
                    <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="flex items-center justify-center p-2 transition-colors rounded-lg bg-primary hover:bg-primary/90"
                        aria-label="Add chat member"
                        title="Add chat member"
                    >
                        <UserPlus size={20} className="text-primary-shade-2" />
                    </button>
                )}
            </div>

            {/* Add Chat Member Modal */}
            <AddChatMemberModal
                isOpen={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
            />
        </>
    );
};

export default SidebarHeader;
