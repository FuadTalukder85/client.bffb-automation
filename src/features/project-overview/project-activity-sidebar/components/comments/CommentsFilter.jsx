import React, { useState } from 'react';
import { RefreshCw, MoreVertical, X, Search, Calendar, UserPlus, Users, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useProjectActivityStore } from '../../stores/ProjectActivityStore';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';

const CommentsFilter = ({
    totalComments,
    debouncedSearch,
    isRefreshing,
    isCommentsLoading,
    onRefresh,
    canAddMembers,
    showAddMemberForm,
    setShowAddMemberForm
}) => {
    const {
        filters,
        isDrawerOpen,
        toggleDrawer,
        setDrawerOpen,
        setSearchQuery,
        setDateRange,
        setUserIds
    } = useProjectActivityStore();

    const { searchQuery, startDate, endDate, userIds } = filters;

    // User filter state
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [showUserList, setShowUserList] = useState(false);
    const debouncedUserSearch = useDebounce(userSearchTerm, 300);

    const { data: users, isLoading: usersLoading } = useUsers({
        activeOnly: true,
        ...(debouncedUserSearch.length >= 2 && { search: debouncedUserSearch })
    });

    const availableUsers = users || [];

    const toggleUserSelection = (userId) => {
        const newUserIds = userIds.includes(userId)
            ? userIds.filter(id => id !== userId)
            : [...userIds, userId];
        setUserIds(newUserIds);
    };

    const shouldShowUserList = showUserList || debouncedUserSearch.length >= 2 || userIds.length > 0;

    return (
        <div className="relative mb-3 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 z-50">
            <div className="flex items-center justify-between pb-2 lg:pb-1 xl:pb-1 2xl:pb-1.5 3xl:pb-2 border-b border-border">
                <div className="flex items-start gap-2 lg:gap-1 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
                    {(debouncedSearch || startDate || endDate || userIds.length > 0) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setDateRange("", "");
                                setUserIds([]);
                                setUserSearchTerm("");
                            }}
                            className="p-1.5 hover:bg-muted rounded transition-colors flex items-center justify-center mt-0.5"
                            title="Clear all filters"
                        >
                            <X className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 text-muted-foreground" />
                        </button>
                    )}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-muted-foreground">
                            {totalComments} comment{totalComments !== 1 ? 's' : ''}
                            {debouncedSearch && ` matching "${debouncedSearch}"`}
                        </span>
                        {(startDate || endDate || userIds.length > 0) && (
                            <div className="flex flex-col gap-0.5">
                                {(startDate || endDate) && (
                                    <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[ text-muted-foreground">
                                        {startDate && `From ${format(new Date(startDate), 'MMM d, yyyy')}`}
                                        {startDate && endDate && ' '}
                                        {endDate && `To ${format(new Date(endDate), 'MMM d, yyyy')}`}
                                    </span>
                                )}
                                {userIds.length > 0 && (
                                    <span className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[ text-muted-foreground">
                                        {userIds.length} user{userIds.length !== 1 ? 's' : ''} selected
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-1 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
                    {canAddMembers && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                            className={`p-1 rounded transition-colors ${showAddMemberForm ? 'bg-primary text-primary-shade-2' : 'hover:bg-primary/5 text-muted-foreground'}`}
                            title={showAddMemberForm ? "Close add member" : "Add project member"}
                        >
                            <UserPlus className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                        </motion.button>
                    )}
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing || isCommentsLoading}
                        className="p-1 hover:bg-primary/5 rounded transition-colors"
                        title="Refresh comments"
                    >
                        <RefreshCw className={`w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-primary ${isRefreshing || isCommentsLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={toggleDrawer}
                        className={`p-1 rounded transition-colors ${isDrawerOpen ? 'bg-primary text-primary-shade-2' : 'hover:bg-primary/5 text-muted-foreground'}`}
                        title="Filter comments"
                    >
                        <MoreVertical className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                    </button>
                </div>
            </div>

            {/* Filter Drawer */}
            {isDrawerOpen && (
                <div className="absolute top-full right-0 mt-1 w-full z-20 bg-background border border-border rounded-lg shadow-xl p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter Comments</h4>
                        <button onClick={() => setDrawerOpen(false)}>
                            <X className="w-3.5 lg:w-[7.5px] xl:w-[10px] 2xl:w-[11px] 3xl:w-3.5 h-3.5 lg:h-[7.5px] xl:h-[10px] 2xl:h-[11px] 3xl:h-3.5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="space-y-1 mb-0">
                        <label className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-semibold text-muted-foreground uppercase px-1">Search Content</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 lg:w-[7.5px] xl:w-[10px] 2xl:w-[11px] 3xl:w-3.5 h-3.5 lg:h-[7.5px] xl:h-[10px] 2xl:h-[11px] 3xl:h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type to search..."
                                className="w-full pl-8 lg:pl-4.5 xl:pl-5.5 2xl:pl-6.5 3xl:pl-8 pr-3 lg:pr-1 xl:pr-1.5 2xl:pr-2 3xl:pr-3 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 mb-0">
                        <div className="space-y-1">
                            <label className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-semibold text-muted-foreground uppercase px-1">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 w-3.5 lg:w-[7.5px] xl:w-[10px] 2xl:w-[11px] 3xl:w-3.5 h-3.5 lg:h-[7.5px] xl:h-[10px] 2xl:h-[11px] 3xl:h-3.5 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setDateRange(e.target.value, endDate)}
                                    className="w-full pl-8 lg:pl-4.5 xl:pl-5.5 2xl:pl-6.5 3xl:pl-8 pr-2 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-semibold text-muted-foreground uppercase px-1">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 w-3.5 lg:w-[7.5px] xl:w-[10px] 2xl:w-[11px] 3xl:w-3.5 h-3.5 lg:h-[7.5px] xl:h-[10px] 2xl:h-[11px] 3xl:h-3.5 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setDateRange(startDate, e.target.value)}
                                    className="w-full pl-8 lg:pl-4.5 xl:pl-5.5 2xl:pl-6.5 3xl:pl-8 pr-2 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* User Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-semibold text-muted-foreground uppercase px-1">Filter by Users</label>
                        <div className="relative">
                            <Users className="absolute left-2.5 top-2.5 w-3.5 lg:w-[7.5px] xl:w-[10px] 2xl:w-[11px] 3xl:w-3.5 h-3.5 lg:h-[7.5px] xl:h-[10px] 2xl:h-[11px] 3xl:h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-8 lg:pl-4.5 xl:pl-5.5 2xl:pl-6.5 3xl:pl-8 pr-4 lg:pr-4.5 xl:pr-5.5 2xl:pr-6.5 3xl:pr-8 py-2 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                                type="button"
                                onClick={() => setShowUserList(!showUserList)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                title={showUserList ? "Hide user list" : "Show all users"}
                            >
                                {showUserList ? (
                                    <ChevronUp className="w-3.5 lg:w-[7.5px] xl:w-[10px] 2xl:w-[11px] 3xl:w-3.5 h-3.5 lg:h-[7.5px] xl:h-[10px] 2xl:h-[11px] 3xl:h-3.5" />
                                ) : (
                                    <ChevronDown className="w-3.5 lg:w-[7.5px] xl:w-[10px] 2xl:w-[11px] 3xl:w-3.5 h-3.5 lg:h-[7.5px] xl:h-[10px] 2xl:h-[11px] 3xl:h-3.5" />
                                )}
                            </button>
                        </div>

                        {/* Selected Users Display */}
                        {userIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {userIds.map(userId => {
                                    const user = availableUsers.find(u => u._id === userId);
                                    return (
                                        <div key={userId} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full">
                                            <span>{user?.name || 'Unknown User'}</span>
                                            <button
                                                onClick={() => toggleUserSelection(userId)}
                                                className="hover:bg-primary/20 rounded-full p-0.5"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Users List */}
                        {shouldShowUserList && (
                            <div className="max-h-40 overflow-y-auto custom-scrollbar border border-border rounded-md mt-2">
                                {usersLoading ? (
                                    <div className="flex items-center justify-center 3xl:py-4 2xl:py-3.2 xl:py-2.8 lg:py-2 py-1">
                                        <div className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span className="ml-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-muted-foreground">Loading users...</span>
                                    </div>
                                ) : availableUsers.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {availableUsers.map((user) => {
                                            const isSelected = userIds.includes(user._id);
                                            return (
                                                <div
                                                    key={user._id}
                                                    onClick={() => toggleUserSelection(user._id)}
                                                    className="flex items-center p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                                        <div className="3xl:w-6 2xl:w-4.5 xl:w-4.5 lg:w-3.5 w-3 3xl:h-6 2xl:h-4.5 xl:h-4.5 lg:h-3.5 h-3 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                            <span className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-medium text-primary">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-medium text-foreground truncate">{user.name}</p>
                                                            <p className="text-[10px] lg:text-[5.5px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] text-muted-foreground truncate">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                        isSelected
                                                            ? 'bg-primary border-primary'
                                                            : 'border-muted-foreground'
                                                    }`}>
                                                        {isSelected && (
                                                            <Check className="w-3 lg:w-1.5 xl:w-2 2xl:w-2.5 3xl:w-3 h-3 lg:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="3xl:py-4 2xl:py-3.2 xl:py-2.8 lg:py-2 py-1 text-center text-muted-foreground">
                                        <Users className="3xl:w-6 2xl:w-4.5 xl:w-4.5 lg:w-3.5 w-3 3xl:h-6 2xl:h-4.5 xl:h-4.5 lg:h-3.5 h-3 mx-auto mb-1 text-muted-foreground/50" />
                                        <p className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs">
                                            {userSearchTerm ? 'No users found' : 'Start typing to search users'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Clear Filters */}
                    {(searchQuery || startDate || endDate || userIds.length > 0) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setDateRange("", "");
                            }}
                            className="w-full flex items-center justify-center gap-2 lg:gap-1 xl:gap-1 2xl:gap-1.5 3xl:gap-2 py-2 text-[10px] font-bold text-red-500 hover:bg-red-500/5 rounded transition-colors"
                        >
                            <X className="w-3 lg:w-1.5 xl:w-2 2xl:w-2.5 3xl:w-3 h-3 lg:h-1.5 xl:h-2 2xl:h-2.5 3xl:h-3" />
                            CLEAR ALL FILTERS
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentsFilter;
