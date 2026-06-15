import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectActivityStore = create(
    persist(
        (set, get) => ({
            // UI State
            isExpanded: false,
            activeTab: 'history', // 'chat', 'members', 'history'
            isDrawerOpen: false, // For filters

            // Filters
            filters: {
                searchQuery: '',
                startDate: '',
                endDate: '',
                userIds: [],
            },

            // Actions
            toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
            setExpanded: (value) => set({ isExpanded: value }),
            setActiveTab: (tab) => set({ activeTab: tab }),
            toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
            setDrawerOpen: (value) => set({ isDrawerOpen: value }),

            setSearchQuery: (query) => set((state) => ({
                filters: { ...state.filters, searchQuery: query }
            })),

            setDateRange: (start, end) => set((state) => ({
                filters: { ...state.filters, startDate: start, endDate: end }
            })),

            setUserIds: (userIds) => set((state) => ({
                filters: { ...state.filters, userIds: userIds }
            })),

            clearFilters: () => set((state) => ({
                filters: { ...state.filters, searchQuery: '', startDate: '', endDate: '', userIds: [] }
            })),
        }),
        {
            name: 'project-activity-store',
            partialize: (state) => ({
                isExpanded: state.isExpanded,
                activeTab: state.activeTab
            }),
        }
    )
);
