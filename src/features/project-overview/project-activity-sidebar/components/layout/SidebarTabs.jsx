import React from 'react';
import { MessageCircle, Users, History } from 'lucide-react';
import { useProjectActivityStore } from '../../stores/ProjectActivityStore';

const SidebarTabs = ({ hiddenTabs = [] }) => {
    const { activeTab, setActiveTab } = useProjectActivityStore();

    const tabs = [
        { id: "history", label: "History", icon: History },
        { id: "chat", label: "Comments", icon: MessageCircle },
        { id: "members", label: "Members", icon: Users },
    ];

    const visibleTabs = tabs.filter((tab) => !hiddenTabs.includes(tab.id));

    if (visibleTabs.length === 0) {
        return null;
    }

    return (
        <div className="flex border-b border-border">
            {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium transition-colors ${activeTab === tab.id
                                ? "border-b-2 border-nav-highlight text-nav-highlight bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                            }`}
                    >
                        <Icon className="h-2.5 w-2.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default SidebarTabs;
