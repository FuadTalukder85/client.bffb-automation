import { useState } from "react";
import { motion } from "framer-motion";
import { useUsers } from "@/hooks/useUsers";
import { useAddProjectMember } from "@/hooks/mutations";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import PERMISSIONS from "@/constants/permissions";
import { Button } from "@/components/ui/Button";
import { UserPlus, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { hasPermission } from "@/lib/utils";

// Reusable component for adding project members with search and checkbox selection
export function AddProjectMembers({ projectId, members, onSuccess, className = "" }) {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [operationErrors, setOperationErrors] = useState([]);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: users, isLoading: usersLoading } = useUsers({
    activeOnly: true,
    ...(debouncedSearchTerm.length >= 2 && { search: debouncedSearchTerm })
  });
  const addMemberMutation = useAddProjectMember();
  const { permissions } = useUserPermissions();

  // Permission check
  const canAddMembers = hasPermission(permissions, PERMISSIONS.PROJECT_MEMBER.ADD);

  if (!canAddMembers) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        You don't have permission to add project members
      </div>
    );
  }

  // Filter out users who are already project members
  const availableUsers = users?.filter(
    (user) => !Array.isArray(members) || !members?.some((member) => member.user._id === user._id)
  ) || [];

  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) return;

    setOperationErrors([]);
    const results = [];
    const errors = [];

    // Process each member individually to handle failures gracefully
    for (const userId of selectedUserIds) {
      try {
        const result = await addMemberMutation.mutateAsync({ projectId, userId });
        results.push(result);
      } catch (error) {
        console.error(`Failed to add member ${userId}:`, error);
        const user = users?.find(u => u._id === userId);
        const errorMessage = error?.response?.data?.message ||
                           error?.response?.data?.error?.message ||
                           error.message ||
                           'Failed to add member';
        errors.push({
          userId,
          userName: user?.name || 'Unknown user',
          error: errorMessage
        });
      }
    }

    // Update state based on results
    if (results.length > 0) {
      // Clear successfully added users from selection
      const successfulUserIds = results.map(result => result?.data?.user || result?.user);
      setSelectedUserIds(prev => prev.filter(id => !successfulUserIds.includes(id)));

      onSuccess?.();
    }

    if (errors.length > 0) {
      setOperationErrors(errors);
    }

    // Only reset search if all operations were successful
    if (errors.length === 0) {
      setSearchTerm("");
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const shouldShowUserList = showUserList || debouncedSearchTerm.length >= 2;

  return (
    <div className={`space-y-4 lg:space-y-1.5 xl:space-y-2 2xl:space-y-3 3xl:space-y-4 ${className}`}>
      {/* Operation Errors */}
      {operationErrors.length > 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <h4 className="text-sm font-medium text-destructive mb-2">
            Some members couldn't be added:
          </h4>
          <ul className="space-y-1">
            {operationErrors.map((error, index) => (
              <li key={index} className="text-xs text-destructive">
                • {error.userName}: {error.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Search Input with Toggle */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users to add..."
          className="w-full px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 3xl:py-2 2xl:py-1.5 xl:py-1 lg:py-0.5 py-2 pr-5 lg:pr-5.5 xl:pr-7 2xl:pr-8 3xl:pr-10 border border-border rounded-md bg-background text-foreground text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={usersLoading}
        />
        <button
          type="button"
          onClick={() => setShowUserList(!showUserList)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          title={showUserList ? "Hide user list" : "Show all users"}
        >
          {showUserList ? (
            <ChevronUp className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
          ) : (
            <ChevronDown className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
          )}
        </button>
      </div>

      {/* Users List with Checkboxes */}
      {shouldShowUserList && (
         <div className="max-h-[15dvh] overflow-y-auto custom-scrollbar border border-border rounded-md">
          {usersLoading ? (
            <div className="flex items-center justify-center py-8 lg:py-4 xl:py-5 2xl:py-6 3xl:py-8">
              <Loader2 className="w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
            </div>
          ) : availableUsers.length > 0 ? (
            <motion.div
              className="divide-y divide-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {availableUsers.map((user, index) => {
                const isSelected = selectedUserIds.includes(user._id);
                return (
                   <motion.div
                     key={user._id}
                     onClick={() => toggleUserSelection(user._id)}
                     className="flex items-center p-1.5 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3 hover:bg-muted/50 cursor-pointer transition-colors overflow-hidden"
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.3, delay: index * 0.05 }}
                     whileTap={{ scale: 0.99 }}
                   >
                     <div className="flex items-center space-x-3 min-w-0 flex-1">
                       <div className="w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                         <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-primary">
                           {user.name.charAt(0).toUpperCase()}
                         </span>
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="font-medium text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-bas text-foreground truncate">{user.name}</p>
                         <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground truncate">{user.email}</p>
                       </div>
                     </div>
                    <div className={`w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {isSelected && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="py-8 lg:py-4 xl:py-5 2xl:py-6 3xl:py-8 text-center text-muted-foreground">
              <UserPlus className="w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">
                {searchTerm ? 'No users found matching your search' : 'No available users to add'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Members Button */}
      <Button
        onClick={handleAddMembers}
        disabled={selectedUserIds.length === 0 || addMemberMutation.isPending}
        className="w-full"
      >
        {addMemberMutation.isPending ? (
          <Loader2 className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 animate-spin mr-1 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" />
        ) : (
          <UserPlus className="h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 mr-1 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" />
        )}
        Add Members {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
      </Button>
    </div>
  );
}