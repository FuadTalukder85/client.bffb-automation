import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { useRemoveProjectMember, useUpdateProjectMemberResponsibilities } from "@/hooks/mutations";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import PERMISSIONS from "@/constants/permissions";
import { Button } from "@/components/ui/Button";
import { Trash2, Loader2, UserPlus, Pencil, X, Check } from "lucide-react";
import { AddProjectMembers } from "./AddProjectMembers";
import { hasPermission } from "@/lib/utils";

const responsibilityOptions = [
  { label: "Project Overview", value: "Project Overview" },
  { label: "Product Development", value: "Product Development" },
  { label: "Manage Project Schedule", value: "Manage Project Schedule" },
  { label: "Application Recipe", value: "Application Recipe" },
  { label: "Prepare Samples", value: "Prepare Samples" },
  { label: "Daily Production Schedule", value: "Daily Production Schedule" },
  { label: "HOD Approval", value: "HOD Approval" },
  { label: "Sensory Form", value: "Sensory Form" },
  { label: "Sensory Topsheet", value: "Sensory Topsheet" },
  { label: "Shelf Life Testing", value: "Shelf Life Testing" },
  { label: "Sample Dispatch", value: "Sample Dispatch" }
];

function ProjectMembersManagement({ projectId }) {
  const [deletingMemberId, setDeletingMemberId] = useState(null);
  const [membersSearchTerm, setMembersSearchTerm] = useState("");
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [activeDropdownMemberId, setActiveDropdownMemberId] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [tempResponsibilities, setTempResponsibilities] = useState({});
  const [dropdownAlign, setDropdownAlign] = useState('left');
  const dropdownRef = useRef(null);
  const addButtonRef = useRef(null);

  // Close active dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdownMemberId &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".add-responsibility-trigger")
      ) {
        setActiveDropdownMemberId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownMemberId]);



  const { data: members, isLoading: membersLoading, error: membersError, refetch: refetchMembers } = useProjectMembers(projectId);
  const removeMemberMutation = useRemoveProjectMember();
  const updateResponsibilitiesMutation = useUpdateProjectMemberResponsibilities();
  const { permissions } = useUserPermissions();

  // Permission checks
  const canViewMembers = hasPermission(permissions, PERMISSIONS.PROJECT_MEMBER.VIEW);
  const canAddMembers = hasPermission(permissions, PERMISSIONS.PROJECT_MEMBER.ADD);
  const canRemoveMembers = hasPermission(permissions, PERMISSIONS.PROJECT_MEMBER.REMOVE);

  const handleRemoveMember = async (userId) => {
    setDeletingMemberId(userId);
    try {
      await removeMemberMutation.mutateAsync({ projectId, userId });
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setDeletingMemberId(null);
    }
  };

  const handleResponsibilityChange = async (userId, newResponsibilities) => {
    try {
      await updateResponsibilitiesMutation.mutateAsync({
        projectId,
        userId,
        responsibilities: newResponsibilities
      });
    } catch (error) {
      console.error("Failed to update responsibilities:", error);
    }
  };

  const handleEditToggle = (member) => {
    const isCurrentlyEditing = editingMemberId === member.user._id;

    if (isCurrentlyEditing) {
      const currentTemp = tempResponsibilities[member.user._id] ?? member.responsibilities ?? [];
      handleResponsibilityChange(member.user._id, currentTemp);
      setEditingMemberId(null);
      setActiveDropdownMemberId(null);
    } else {
      if (editingMemberId) {
        const activeMember = members?.find(m => m.user._id === editingMemberId);
        if (activeMember) {
          const currentTemp = tempResponsibilities[editingMemberId] ?? activeMember.responsibilities ?? [];
          handleResponsibilityChange(editingMemberId, currentTemp);
        }
      }

      setEditingMemberId(member.user._id);
      setTempResponsibilities(prev => ({
        ...prev,
        [member.user._id]: member.responsibilities ?? []
      }));
      setActiveDropdownMemberId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingMemberId(null);
    setActiveDropdownMemberId(null);
  };

  // Filter members based on search term
  const filteredMembers = members?.filter((member) => {
    if (!membersSearchTerm) return true;
    const searchLower = membersSearchTerm.toLowerCase();
    return (
      member.user.name.toLowerCase().includes(searchLower) ||
      member.user.email.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8">
        <Loader2 className="3xl:w-6 2xl:w-4.5 xl:w-4.5 lg:w-3.5 w-3 3xl:h-6 2xl:h-4.5 xl:h-4.5 lg:h-3.5 h-3 animate-spin text-primary" />
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 text-center text-muted-foreground">
        Failed to load project members
      </div>
    );
  }

  if (!canViewMembers) {
    return (
      <div className="py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 text-center text-muted-foreground">
        You don't have permission to view project members
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative overflow-hidden">
      {/* Current Members Section - Scrollable */}
      <div className="flex-1 min-h-0 max-h-full overflow-y-auto px-2 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 pt-2 lg:pt-2 xl:pt-2.5 2xl:pt-3 3xl:pt-4 custom-scrollbar">
        <div className="">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border pb-2">
            <div className="flex items-center justify-between mb-1.5 lg:mb-1.5 xl:mb-2 2xl:mb-3 3xl:mb-4">
              <h3 className="text-lg lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-medium text-foreground">Current Members 
                {members.length > 0 && <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground ms-2">({members.length})</span>}</h3>
              <div className="flex items-center space-x-2">
                {canAddMembers && (
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                      className="min-w-8 lg:min-w-4.5 xl:min-w-5.5 2xl:min-w-6.5 3xl:min-w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8"
                    >
                      {showAddMemberForm ? <X className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" /> : <UserPlus className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Members Search */}
            {members && members.length > 0 && (
              <div className="mb-1.5 lg:mb-1.5 xl:mb-2 2xl:mb-3 3xl:mb-4">
                <input
                  type="text"
                  value={membersSearchTerm}
                  onChange={(e) => setMembersSearchTerm(e.target.value)}
                  placeholder="Search members..."
                  className="w-full px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-[4px] xl:py-[5px] 2xl:py-1.5 3xl:py-2 border border-border rounded-md bg-background text-foreground text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
          </div>

          {filteredMembers.length > 0 ? (
            <motion.div
              className="space-y-3 lg:space-y-1.5 xl:space-y-2 2xl:space-y-2.5 3xl:space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  className="flex flex-col p-3.5 lg:p-1.5 xl:p-2 2xl:p-2.5 3xl:p-3.5 bg-card border border-border rounded-xl lg:rounded-md xl:rounded-lg 2xl:rounded-xl gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 shadow-sm hover:shadow transition-shadow relative animate-fade-in"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  layout
                >
                  {/* Card Header: Avatar, Info, Edit and Remove Buttons */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5 lg:space-x-1 xl:space-x-1.5 2xl:space-x-2 3xl:space-x-2.5 min-w-0">
                      <div className="w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-primary">
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-semibold text-foreground truncate">{member.user.name}</p>
                        <p className="text-[10px] lg:text-[6px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] text-muted-foreground truncate">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {canAddMembers && (
                        <>
                          {editingMemberId === member.user._id ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="min-w-8 lg:min-w-4.5 xl:min-w-5.5 2xl:min-w-6.5 3xl:min-w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                                onClick={() => handleEditToggle(member)}
                                title="Save changes"
                              >
                                <Check className="w-3.5 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                intent="ghost"
                                className="min-w-8 lg:min-w-4.5 xl:min-w-5.5 2xl:min-w-6.5 3xl:min-w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={handleEditCancel}
                                title="Cancel editing"
                              >
                                <X className="w-3.5 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditToggle(member)}
                              className="min-w-8 lg:min-w-4.5 xl:min-w-5.5 2xl:min-w-6.5 3xl:min-w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 text-primary-shade-2 hover:bg-muted/50"
                              title="Edit responsibilities"
                            >
                              <Pencil className="w-3.5 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                      {editingMemberId !== member.user._id && canRemoveMembers && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.user._id)}
                          disabled={deletingMemberId === member.user._id}
                          className=" hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed min-w-8 lg:min-w-4.5 xl:min-w-5.5 2xl:min-w-6.5 3xl:min-w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 text-primary-shade-2"
                          title="Remove member from project"
                        >
                          {deletingMemberId === member.user._id ? (
                            <Loader2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Responsibilities list (horizontal pills) */}
                  <div className="flex flex-wrap items-center gap-1 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-1.5">
                    {(() => {
                      const isEditing = editingMemberId === member.user._id;
                      const currentResps = isEditing
                        ? (tempResponsibilities[member.user._id] ?? [])
                        : (member.responsibilities ?? []);
                      return currentResps.map((resp) => (
                        <span
                          key={resp}
                          className="inline-flex items-center gap-1 lg:gap-0.5 xl:gap-0.5 2xl:gap-1 px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 py-0.5 lg:py-0 rounded-full text-[10px] lg:text-[6.5px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] font-bold bg-primary/10 text-primary dark:bg-purple-900/30 dark:text-purple-300 border border-primary/5 max-w-[120px] lg:max-w-[90px] xl:max-w-[100px] 2xl:max-w-[110px] 3xl:max-w-[120px]"
                        >
                          <span className="truncate">{resp}</span>
                          {canAddMembers && isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentResps.filter(r => r !== resp);
                                setTempResponsibilities(prev => ({
                                  ...prev,
                                  [member.user._id]: updated
                                }));
                              }}
                              className="hover:bg-primary/20 dark:hover:bg-purple-800/40 rounded-full p-0.5 text-primary/70 hover:text-primary transition-colors cursor-pointer"
                              title={`Remove ${resp}`}
                            >
                              <X className="w-2 lg:w-1 xl:w-1.5 2xl:w-2 h-2 lg:h-1 xl:h-1.5 2xl:h-2" />
                            </button>
                          )}
                        </span>
                      ));
                    })()}

                    {/* Inline Add Button with Custom Dropdown Popover */}
                    {canAddMembers && editingMemberId === member.user._id && (
                      <div className="relative shrink-0 inline-flex items-center">
                        <button
                          type="button"
                          className="add-responsibility-trigger inline-flex items-center gap-1 lg:gap-0.5 xl:gap-1 px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 py-0.5 lg:py-0 rounded-full text-[10px] lg:text-[6.5px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground border border-dashed border-muted-foreground/30 transition-colors"
                          ref={addButtonRef}
                          onClick={(e) => {
                            if (activeDropdownMemberId === member.user._id) {
                              setActiveDropdownMemberId(null);
                            } else {
                              // Measure button position to determine dropdown direction
                              const btn = e.currentTarget;
                              const card = btn.closest('.flex.flex-wrap');
                              if (card) {
                                const cardRect = card.getBoundingClientRect();
                                const btnRect = btn.getBoundingClientRect();
                                const btnCenter = btnRect.left + btnRect.width / 2;
                                const cardCenter = cardRect.left + cardRect.width / 2;
                                setDropdownAlign(btnCenter > cardCenter ? 'right' : 'left');
                              }
                              setActiveDropdownMemberId(member.user._id);
                            }
                          }}
                        >
                          + Add
                        </button>

                        {activeDropdownMemberId === member.user._id && (
                          <div
                            ref={dropdownRef}
                            className={`absolute z-[9999] mt-1 ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} w-48 lg:w-32 xl:w-36 2xl:w-44 3xl:w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 lg:max-h-32 xl:max-h-36 2xl:max-h-44 3xl:max-h-48 overflow-y-auto custom-scrollbar`}
                          >
                            {(() => {
                              const activeMember = members?.find(m => m.user._id === activeDropdownMemberId);
                              if (!activeMember) return null;
                              const currentResps = tempResponsibilities[activeDropdownMemberId] ?? activeMember.responsibilities ?? [];
                              // Hide "Project Overview" — only the project creator should have it (assigned during creation)
                              const availableOptions = responsibilityOptions.filter(opt => opt.value !== "Project Overview" && !currentResps.includes(opt.value));
                              
                              if (availableOptions.length === 0) {
                                return (
                                  <div className="px-3 py-2 text-[10px] lg:text-[6.5px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] text-muted-foreground text-center">
                                    All responsibilities assigned
                                  </div>
                                );
                              }
                              
                              return availableOptions.map(opt => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    const updated = [...currentResps, opt.value];
                                    setTempResponsibilities(prev => ({
                                      ...prev,
                                      [activeDropdownMemberId]: updated
                                    }));
                                    setActiveDropdownMemberId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[11px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[11px] hover:bg-gray-100 dark:hover:bg-gray-700 text-foreground transition-colors font-semibold"
                                >
                                  {opt.label}
                                </button>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : members && members.length > 0 ? (
            <div className="py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 text-center text-muted-foreground">
              <Trash2 className="w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No members found matching your search.</p>
            </div>
          ) : (
            <div className="py-4 lg:py-5 xl:py-6 2xl:py-7 3xl:py-8 text-center text-muted-foreground">
              <Trash2 className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>No members assigned yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Section - Absolute overlay from bottom */}
      <AnimatePresence>
        {showAddMemberForm && canAddMembers && (
          <motion.div
            className="absolute bottom-2 left-0 right-0 bg-background border-t border-border shadow-lg z-10 py-2 px-3 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 mx-2 lg:mx-2.5 xl:mx-3 2xl:mx-3.5 3xl:mx-4"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between mb-1.5 lg:mb-1.5 xl:mb-2 2xl:mb-3 3xl:mb-4">
              {/* <h3 className="text-lg font-medium text-foreground">Add Member</h3>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddMemberForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <motion.span
                    animate={{ rotate: showAddMemberForm ? 0 : 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    ✕
                  </motion.span>
                </Button>
              </motion.div> */}
            </div>
            <AddProjectMembers projectId={projectId} members={members} onSuccess={() => { refetchMembers(); setShowAddMemberForm(false); }} />
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}

export default ProjectMembersManagement;
