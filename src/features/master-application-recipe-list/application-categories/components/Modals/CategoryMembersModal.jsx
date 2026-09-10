import React, { useEffect, useState, useRef } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select/Select";
import { Loader2, Plus, Trash2, X, ChevronLeft } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/utils/apiError";
import { categoryService } from "@/services/categoryService";
import { toast } from "sonner";

const responsibilityOptions = [
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

function CheckboxMultiSelect({ value = [], onChange, options = [], disabled = false }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = (optValue) => {
        if (value.includes(optValue)) {
            onChange(value.filter((v) => v !== optValue));
        } else {
            onChange([...value, optValue]);
        }
    };

    return (
        <div className="relative w-full text-base-color" ref={dropdownRef}>
            <div
                className={cn(
                    "bg-white/90 rounded-md min-h-8 lg:min-h-4.5 xl:min-h-5.5 2xl:min-h-6.5 3xl:min-h-8 flex flex-wrap items-center px-3 py-1 cursor-pointer",
                    disabled ? "opacity-50 pointer-events-none" : ""
                )}
                onClick={() => !disabled && setOpen(!open)}
            >
                {value.length === 0 ? (
                    <span className="text-gray-400 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm truncate">Select Responsibility</span>
                ) : (
                    <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium truncate">{value.length} selected</span>
                )}
            </div>
            {open && (
                <div className="absolute bottom-[calc(100%+4px)] left-0 w-full min-w-[150px] lg:min-w-[120px] xl:min-w-[150px] 2xl:min-w-[180px] 3xl:min-w-[200px] max-h-60 lg:max-h-36 xl:max-h-44 2xl:max-h-52 3xl:max-h-60 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-md z-50 p-2 lg:p-1 xl:p-1.5 2xl:p-1.5 3xl:p-2">
                    {options.length === 0 ? (
                        <div className="p-2 lg:p-1 xl:p-1.5 2xl:p-1.5 3xl:p-2 text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-500">No responsibilities available</div>
                    ) : (
                        options.map((opt) => (
                            <label
                                key={opt.value}
                                className="flex items-center gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-1.5 3xl:gap-2 p-2 lg:p-1 xl:p-1.5 2xl:p-1.5 3xl:p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 2xl:w-3.5 2xl:h-3.5 3xl:w-4 3xl:h-4 text-[#482D79] border-gray-300 rounded focus:ring-[#482D79]"
                                    checked={value.includes(opt.value)}
                                    onChange={() => handleToggle(opt.value)}
                                />
                                <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-white">{opt.label}</span>
                            </label>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function AddResponsibilityMenu({ memberId, existingResponsibilities, onAdd }) {
    const [open, setOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState('bottom');
    const [dropdownAlign, setDropdownAlign] = useState('left');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const availableOptions = responsibilityOptions.filter(opt =>
        !existingResponsibilities.includes(opt.value)
    );

    if (availableOptions.length === 0) return null;

    const handleToggle = (e) => {
        if (!open && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const scrollContainer = dropdownRef.current.closest('.overflow-y-auto');

            let spaceBelow, spaceAbove;

            if (scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect();
                spaceBelow = containerRect.bottom - rect.bottom;
                spaceAbove = rect.top - containerRect.top;
            } else {
                spaceBelow = window.innerHeight - rect.bottom;
                spaceAbove = rect.top;
            }

            if (spaceBelow < 180 && spaceAbove > spaceBelow) {
                setDropdownPos('top');
            } else {
                setDropdownPos('bottom');
            }

            const btn = e.currentTarget;
            const container = btn.closest('.flex-wrap') || btn.parentElement;
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const btnRect = btn.getBoundingClientRect();
                const btnCenter = btnRect.left + btnRect.width / 2;
                const containerCenter = containerRect.left + containerRect.width / 2;
                setDropdownAlign(btnCenter > containerCenter ? 'right' : 'left');
            }
        }
        setOpen(!open);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                className="inline-flex items-center gap-1 px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 py-1 lg:py-[1px] xl:py-0.5 2xl:py-[3px] 3xl:py-1 rounded-full text-[10px] lg:text-[7px] xl:text-[9px] 2xl:text-[10px] 3xl:text-xs font-semibold bg-transparent border border-dashed border-[#482D79]/30 text-[#482D79] hover:bg-[#482D79]/5 dark:border-purple-300/30 dark:text-purple-300 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
            >
                <Plus className="w-2.5 h-2.5 lg:w-2 xl:w-2.5 2xl:w-2.5 3xl:w-3 lg:h-2 xl:h-2.5 2xl:h-2.5 3xl:h-3" /> Add
            </button>

            {open && (
                <div className={`absolute ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} ${dropdownPos === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} w-48 lg:w-32 xl:w-36 2xl:w-44 3xl:w-48 max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-background border border-gray-200 shadow-xl rounded-md z-50 py-1`}>
                    {availableOptions.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className="w-full text-left px-3 py-1.5 text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-white"
                            onClick={() => {
                                onAdd(memberId, opt.value);
                                setOpen(false);
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function CategoryMembersModal({
    open,
    onOpenChange,
    category,
    onSuccess,
    className,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMembers, setIsFetchingMembers] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [currentMemberId, setCurrentMemberId] = useState("");
    const [currentResponsibility, setCurrentResponsibility] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
        searchTerm: debouncedSearchTerm,
        limit: 500,
    });
    const employees = employeesData?.data || [];

    // Load category members whenever modal opens
    useEffect(() => {
        if (!open || !category?._id) {
            setSelectedMembers([]);
            setCurrentMemberId("");
            setCurrentResponsibility([]);
            setError(null);
            return;
        }

        let isMounted = true;
        const fetchMembers = async () => {
            try {
                setIsFetchingMembers(true);
                setError(null);

                const response = await categoryService.getCategoryMembers(category._id);
                const membersData = response?.data || response || [];

                if (isMounted) {
                    const formatted = (Array.isArray(membersData) ? membersData : []).map(m => {
                        const userObj = (typeof m.userId === "object" && m.userId) 
                            ? m.userId 
                            : ((typeof m.user === "object" && m.user) ? m.user : null);
                        const uid = userObj?._id || m.userId || m.user || m._id;
                        const resps = Array.isArray(m.responsibilities)
                            ? m.responsibilities
                            : (Array.isArray(m.responsibility) ? m.responsibility : (m.responsibility ? [m.responsibility] : []));

                        return {
                            _id: uid,
                            id: uid,
                            name: userObj?.name || userObj?.username || "Unknown",
                            email: userObj?.email || "",
                            role: userObj?.role || "Jr. Analyst",
                            responsibilities: resps,
                        };
                    });

                    setSelectedMembers(formatted);
                }
            } catch (err) {
                console.error("Failed to load category members:", err);
                if (isMounted) {
                    // Fallback to members if already in category prop
                    if (category.members && Array.isArray(category.members)) {
                        const fallbackFormatted = category.members.map(m => {
                            const userObj = (typeof m.userId === "object" && m.userId) 
                                ? m.userId 
                                : ((typeof m.user === "object" && m.user) ? m.user : null);
                            const uid = userObj?._id || m.userId || m.user || m._id;
                            const resps = Array.isArray(m.responsibilities)
                                ? m.responsibilities
                                : (Array.isArray(m.responsibility) ? m.responsibility : (m.responsibility ? [m.responsibility] : []));
                            return {
                                _id: uid,
                                id: uid,
                                name: userObj?.name || userObj?.username || "Unknown",
                                email: userObj?.email || "",
                                role: userObj?.role || "Jr. Analyst",
                                responsibilities: resps,
                            };
                        });
                        setSelectedMembers(fallbackFormatted);
                    }
                }
            } finally {
                if (isMounted) {
                    setIsFetchingMembers(false);
                }
            }
        };

        fetchMembers();

        return () => {
            isMounted = false;
        };
    }, [open, category?._id]);

    useEffect(() => {
        setCurrentResponsibility([]);
    }, [currentMemberId]);

    const currentSelectedMember = selectedMembers.find((m) => (m._id || m.id) === currentMemberId);
    const alreadyAssigned = currentSelectedMember ? (currentSelectedMember.responsibilities || []) : [];

    const filteredResponsibilityOptions = responsibilityOptions.filter(
        (opt) => !alreadyAssigned.includes(opt.value)
    );

    const employeeOptions = (employees || []).map((emp, index) => {
        const name = emp.name || emp.username || "Unknown";
        const email = emp.email || "";
        const employeeId = emp.employeeId || "?";

        return {
            value: emp._id || emp.id,
            searchText: `${name} ${email} ${employeeId}`,
            label: (
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 lg:w-3 xl:w-4 2xl:w-5 3xl:w-6 h-6 lg:h-3 xl:h-4 2xl:h-5 3xl:h-6 text-[10px] lg:text-[6px] xl:text-[7px] 2xl:text-[8px] 3xl:text-[10px] font-medium rounded-full bg-primary-shade-2 text-primary shrink-0 border border-primary/15 dark:border-primary dark:text-white">
                        {index + 1}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm font-medium leading-none">{name}</span>
                        {email && (
                            <span className="text-[10px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm text-muted-foreground leading-none">
                                {email}
                            </span>
                        )}
                    </div>
                </div>
            ),
        };
    });

    const handleAddMember = () => {
        if (!currentMemberId || currentResponsibility.length === 0) return;

        const existingMemberIndex = selectedMembers.findIndex(m => (m._id || m.id) === currentMemberId);
        if (existingMemberIndex !== -1) {
            const updatedMembers = [...selectedMembers];
            const newResps = [...new Set([...(updatedMembers[existingMemberIndex].responsibilities || []), ...currentResponsibility])];
            updatedMembers[existingMemberIndex].responsibilities = newResps;
            setSelectedMembers(updatedMembers);
        } else {
            const memberToAdd = employees.find((e) => (e._id || e.id) === currentMemberId);
            if (memberToAdd) {
                setSelectedMembers([
                    ...selectedMembers,
                    {
                        ...memberToAdd,
                        responsibilities: currentResponsibility,
                    },
                ]);
            }
        }
        setCurrentMemberId("");
        setCurrentResponsibility([]);
    };

    const handleAddResponsibility = (memberId, responsibility) => {
        setSelectedMembers(prev => prev.map(m => {
            if ((m._id || m.id) === memberId) {
                return { ...m, responsibilities: [...(m.responsibilities || []), responsibility] };
            }
            return m;
        }));
    };

    const handleRemoveResponsibility = (memberId, responsibility) => {
        setSelectedMembers(prev => prev.map(m => {
            if ((m._id || m.id) === memberId) {
                return { ...m, responsibilities: (m.responsibilities || []).filter(r => r !== responsibility) };
            }
            return m;
        }).filter(m => (m.responsibilities || []).length > 0));
    };

    const handleRemoveUser = (memberId) => {
        setSelectedMembers(prev => prev.filter(m => (m._id || m.id) !== memberId));
    };

    const handleClose = (isOpen) => {
        if (!isLoading) {
            onOpenChange(isOpen);
        }
    };

    const handleSave = async () => {
        if (!category?._id) return;
        setIsLoading(true);
        setError(null);
        try {
            const membersPayload = selectedMembers.map(m => ({
                userId: m._id || m.id,
                responsibilities: m.responsibilities || []
            }));

            await categoryService.updateCategoryMembers(category._id, membersPayload);
            toast.success("Category members updated successfully");
            onSuccess?.();
            handleClose(false);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to update category members"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onOpenChange={handleClose}>
            <ModalContent
                className={cn(
                    "max-w-[500px] lg:max-w-[533px] xl:max-w-[711px] 2xl:max-w-[800px] 3xl:max-w-[1000px] p-0 overflow-hidden gap-0 rounded-2xl",
                    className
                )}
            >
                <div className="relative p-4 lg:p-4.5 xl:p-5.5 2xl:p-6.5 3xl:p-8">
                    {/* Close Button */}
                    <button
                        onClick={() => handleClose(false)}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4 lg:h-2 xl:h-3 2xl:h-3.5 3xl:h-4 lg:w-2 xl:w-3 2xl:w-3.5 3xl:w-4" />
                    </button>

                    <ModalHeader className="mb-2 lg:mb-3 xl:mb-4 2xl:mb-5 3xl:mb-6 p-0">
                        <ModalTitle className="text-sm lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-2xl font-bold text-center">
                            Add Category Members ({category?.name || "Category"})
                        </ModalTitle>
                    </ModalHeader>

                    {error && (
                        <div className="p-2.5 mb-3 text-xs text-red-600 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                            {error}
                        </div>
                    )}

                    <div>
                        <div className="max-h-[65vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                            <div className="flex flex-col space-y-3">
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    {/* Table Header */}
                                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                                        <div className="w-[35%] text-lg lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-lg font-semibold text-base-color">Category Members</div>
                                        <div className="w-[20%] text-lg lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-lg font-semibold text-base-color">Role</div>
                                        <div className="w-[35%] text-lg lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-lg font-semibold text-base-color">Responsibility</div>
                                        <div className="w-[10%] text-lg lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-lg font-semibold text-base-color text-right">Action</div>
                                    </div>

                                    {/* Scrollable List */}
                                    <div className="max-h-[280px] lg:max-h-[140px] xl:max-h-[190px] 2xl:max-h-[220px] 3xl:max-h-[280px] overflow-y-auto custom-scrollbar p-2 lg:p-[4px] xl:p-[5px] 2xl:p-[6px] 3xl:p-2 space-y-2 lg:space-y-[4px] xl:space-y-[5px] 2xl:space-y-[6px] 3xl:space-y-2 bg-white dark:bg-gray-800 min-h-[180px] lg:min-h-[96px] xl:min-h-[128px] 2xl:min-h-[144px] 3xl:min-h-[180px]">
                                        {isFetchingMembers ? (
                                            <div className="flex flex-col items-center justify-center h-36 gap-2 text-sm text-lighter-text">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                <p>Loading category members...</p>
                                            </div>
                                        ) : selectedMembers.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-36 text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm text-lighter-text">
                                                <p>No members added yet.</p>
                                            </div>
                                        ) : (
                                            selectedMembers.map((member, index) => {
                                                const memberId = member._id || member.id;
                                                const displayId = index + 1;

                                                return (
                                                    <div key={memberId} className="flex items-center justify-between p-2.5 lg:p-1 xl:p-1.5 2xl:p-2 3xl:p-2.5 transition-all bg-white dark:bg-gray-800 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                                                        <div className="w-[35%] flex items-center gap-2.5">
                                                            <div className="flex items-center justify-center w-9 lg:w-6 xl:w-7 2xl:w-8 3xl:w-9 h-9 lg:h-6 xl:h-7 2xl:h-8 3xl:h-9 text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm font-bold rounded-full bg-purple-50 dark:bg-purple-900/30 text-primary shrink-0">
                                                                {displayId}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base font-semibold text-base-color truncate">
                                                                    {member.name || member.username}
                                                                </span>
                                                                {member.email && (
                                                                    <span className="text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm text-lighter-text truncate">
                                                                        {member.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="w-[20%] text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm font-medium text-base-color truncate pr-2">
                                                            {member.role || "Jr. Analyst"}
                                                        </div>
                                                        <div className="w-[35%] pr-2 flex flex-wrap items-center gap-1.5 lg:gap-[1px] xl:gap-0.5 2xl:gap-1 3xl:gap-1.5">
                                                            {member.responsibilities?.map(resp => (
                                                                <span key={resp} className="inline-flex items-center gap-1 px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 py-1 lg:py-[1px] xl:py-0.5 2xl:py-[3px] 3xl:py-1 rounded-full text-[10px] lg:text-[7px] xl:text-[9px] 2xl:text-[10px] 3xl:text-xs font-semibold bg-[#482D79]/10 text-[#482D79] dark:bg-purple-900/30 dark:text-purple-300">
                                                                    {resp}
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={() => handleRemoveResponsibility(memberId, resp)}
                                                                        className="ml-1 hover:bg-[#482D79]/20 rounded-full p-0.5 transition-colors cursor-pointer text-[#482D79] dark:text-purple-300 flex items-center justify-center"
                                                                    >
                                                                        <X className="w-3 h-3 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 2xl:w-2.5 2xl:h-2.5 3xl:w-3 3xl:h-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                            <AddResponsibilityMenu
                                                                memberId={memberId}
                                                                existingResponsibilities={member.responsibilities || []}
                                                                onAdd={handleAddResponsibility}
                                                            />
                                                        </div>
                                                        <div className="w-[10%] flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveUser(memberId)}
                                                                className="p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 transition-colors bg-primary-shade-2 dark:bg-gray-400 rounded hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                                                title="Remove User"
                                                            >
                                                                <Trash2 className="w-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 h-4 lg:h-2 xl:h-3 2xl:h-3.5 3xl:h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Purple Action Bar */}
                                <div className="bg-[#482D79] rounded-xl lg:rounded-sm xl:rounded-md 2xl:rounded-lg 3xl:rounded-xl p-2.5 lg:p-1 xl:p-1.5 2xl:p-2 3xl:p-2.5 flex items-center justify-between gap-3">
                                    <div className="w-[35%]">
                                        <Select
                                            value={currentMemberId}
                                            onChange={(e) => setCurrentMemberId(e.target.value)}
                                            options={employeeOptions}
                                            placeholder={isLoadingEmployees ? "Loading..." : "Select User"}
                                            className="w-full text-base border-0 text-base-color h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8"
                                            containerClassName="bg-white/90 rounded-md"
                                            disabled={isLoadingEmployees || isLoading}
                                            searchable={true}
                                            onSearchChange={setSearchTerm}
                                            position="top"
                                        />
                                    </div>
                                    <div className="text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base text-white/70 font-medium min-w-[60px] max-w-[100px] truncate">
                                        {employees?.find((e) => (e._id || e.id) === currentMemberId)?.role || "N/A"}
                                    </div>
                                    <div className="w-[35%]">
                                        <CheckboxMultiSelect
                                            value={currentResponsibility}
                                            onChange={(newValues) => setCurrentResponsibility(newValues)}
                                            options={filteredResponsibilityOptions}
                                            disabled={!currentMemberId || isLoading}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleAddMember}
                                        disabled={!currentMemberId || currentResponsibility.length === 0 || isLoading}
                                        className="text-primary bg-primary-shade-2 dark:text-gray-50 px-5 font-semibold h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 rounded-full text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base transition-transform hover:scale-105"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <ModalFooter className="flex justify-end gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 mt-7 lg:mt-4 xl:mt-5 2xl:mt-5.5 3xl:mt-7 p-0">
                            <Button
                                type="button"
                                intent="outline"
                                onClick={() => handleClose(false)}
                                disabled={isLoading}
                                className="px-7 lg:px-3.5 xl:px-5 2xl:px-5.5 3xl:px-7 h-10 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 border-primary/20 text-primary dark:hover:bg-purple-900/20 rounded-lg text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base font-medium flex items-center gap-2 cursor-pointer"
                            >
                                <ChevronLeft className="w-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5" />
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-9 lg:px-5 xl:px-6 2xl:px-7 3xl:px-9 h-10 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 bg-[#482D79] hover:bg-[#3b2366] text-white rounded-lg text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base font-medium flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save
                            </Button>
                        </ModalFooter>
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
}
