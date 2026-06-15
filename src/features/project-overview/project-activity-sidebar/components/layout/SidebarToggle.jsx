import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useProjectActivityStore } from '../../stores/ProjectActivityStore';

const SidebarToggle = ({ onToggle, isExpanded: externalIsExpanded }) => {
    const { isExpanded: storeIsExpanded, toggleSidebar } = useProjectActivityStore();
    const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : storeIsExpanded;

    const handleToggle = () => {

        if (onToggle) {
            onToggle();
        }
    };


    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle();
            }}
            className={`
                fixed z-[600] bg-primary 3xl:border-2 2xl:border-2 xl:border-[1.5px] lg:border border-border 3xl:rounded-lg 2xl:rounded-md xl:rounded-sm lg:rounded-sm p-1 shadow-lg
                hover:shadow-xl active:scale-95 transition-all duration-200 ease-in-out
                3xl:h-12 2xl:h-9 xl:h-7 lg:h-6 3xl:w-8 2xl:w-6 xl:w-5 lg:w-4 flex items-center justify-center touch-manipulation
                hidden lg:flex


                lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:-left-4 lg:right-auto
            `}
            style={{

                pointerEvents: 'auto',
                touchAction: 'manipulation'
            }}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
            {isExpanded ? (
                <ChevronRight className="3xl:w-6 2xl:w-5 xl:w-4 lg:w-3 w-2 3xl:h-6 2xl:h-5 xl:h-4 lg:h-3 h-2 text-primary-shade-2" />
            ) : (
                <ChevronLeft className="3xl:w-6 2xl:w-5 xl:w-4 lg:w-3 w-2 3xl:h-6 2xl:h-5 xl:h-4 lg:h-3 h-2 text-primary-shade-2" />
            )}
        </button>
    );
};


export default SidebarToggle;
