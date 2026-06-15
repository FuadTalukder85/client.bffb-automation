import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";

export const AddChatMemberModal = ({ isOpen, onClose }) => {
    // Staged users (already added to the list)
    const [selectedUsers, setSelectedUsers] = useState([
        {
            id: 1,
            name: "Ehsanur Rahman Rhythm",
            role: "Jr. Analyst",
            email: "ehsan.rahman@banga.xyz",
        },
        {
            id: 2,
            name: "Ehsanur Rahman Rhythm",
            role: "Jr. Analyst",
            email: "ehsan.rahman@banga.xyz",
        },
    ]);

    // Available users to select from
    const [availableUsers] = useState([
        {
            id: 3,
            name: "Rachel Mary A. Gomez",
            role: "Sr. Designer",
            email: "Rachel.Mary.Gomez@banga.xyz",
        },
        {
            id: 4,
            name: "John Doe",
            role: "Developer",
            email: "john.doe@banga.xyz",
        },
        {
            id: 5,
            name: "Sarah Smith",
            role: "Product Manager",
            email: "sarah.smith@banga.xyz",
        },
    ]);

    // Currently selected user IDs in the dropdown (for multiple selection)
    const [selectedUserIdsToAdd, setSelectedUserIdsToAdd] = useState([]);

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
    };

    const handleAddUser = () => {
        if (selectedUserIdsToAdd.length === 0) return;
        
        const usersToAdd = availableUsers.filter(u => selectedUserIdsToAdd.includes(u.id));
        
        // Filter out any that might already be in the list (safety check)
        const newUsers = usersToAdd.filter(u => !selectedUsers.some(existing => existing.id === u.id));
        
        if (newUsers.length > 0) {
            setSelectedUsers([...selectedUsers, ...newUsers]);
        }
        setSelectedUserIdsToAdd([]); // Reset selection
    };

    const handleSave = () => {
        // Save logic here
        console.log("Saving members:", selectedUsers);
        onClose();
    };

    const handleOpenChange = (open) => {
        if (!open) {
            onClose();
        }
    };

    // Prepare options for AccordionSelect
    const userOptions = availableUsers
        .filter(user => !selectedUsers.some(u => u.id === user.id)) // Filter out already added users
        .map((user) => ({
            value: user.id,
            label: (
                <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.role} | {user.email}</span>
                </div>
            ),
            searchText: user.name,
        }));

    return (
        <Modal open={isOpen} onOpenChange={handleOpenChange}>
            <ModalContent className="w-[95%] max-w-md flex flex-col gap-0 px-5 py-5 rounded-2xl max-h-[85vh]">
                <ModalHeader className="shrink-0">
                    <ModalTitle className="text-lg font-semibold text-center text-foreground">
                        Add Chat Member
                    </ModalTitle>
                </ModalHeader>

                {/* Selected Users List - Scrollable */}
                <div className="h-[210px]  lm:h-[320px] overflow-y-auto min-h-0 custom-scrollbar py-2">
                    <div className="flex flex-col px-1 space-y-3">
                        {selectedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 bg-white border border-gray-100 shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700 shrink-0"
                            >
                                <div className="flex flex-col items-start flex-1 min-w-0 gap-1 mr-3">
                                    <p className="text-sm font-semibold text-foreground">
                                        {user.name}
                                    </p>
                                    <p className="w-full text-xs text-left truncate text-muted-foreground">
                                        {user.role} | {user.email}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="flex items-center justify-center w-10 h-10 transition-colors rounded-lg shrink-0 bg-primary-shade-2/50 hover:bg-primary-shade-2 text-primary dark:bg-primary/20 dark:hover:bg-primary/30"
                                >
                                    <Trash2 className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Selection Section - Fixed */}
                <div className="flex flex-col gap-5 pb-2 shrink-0">
                    {/* Divider */}
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />
                    
                    <div className="flex flex-col items-center space-y-4">
                        <AccordionSelect
                            id="user-select"
                            value={selectedUserIdsToAdd}
                            onChange={(e) => setSelectedUserIdsToAdd(e.target.value)}
                            options={userOptions}
                            placeholder="Select User"
                            searchable={true}
                            multiple={true}
                            className="bg-primary-shade-2/30 dark:bg-[#552e8e]/10 border-primary/20 dark:border-[#552e8e]/30 h-9 rounded-lg text-base-color placeholder:text-muted-foreground w-full"
                        />
                        
                        <Button
                            intent="primary"
                            className="px-6 text-sm font-medium text-white transition-all rounded-lg shadow-sm w-28 h-9 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleAddUser}
                            disabled={selectedUserIdsToAdd.length === 0}
                        >
                            Add
                        </Button>
                    </div>
                </div>

                <ModalFooter className="flex flex-row items-center justify-between h-auto gap-3 px-1 pt-3 text-xs shrink-0">
                    <Button
                        intent="outline"
                        onClick={onClose}
                        className="flex-1 h-9 border-table-stroke text-base-color "
                    >
                        Cancel
                    </Button>
                    <Button
                        intent="primary"
                        onClick={handleSave}
                        className="flex-1 text-white h-9 bg-primary hover:bg-primary/90"
                    >
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
