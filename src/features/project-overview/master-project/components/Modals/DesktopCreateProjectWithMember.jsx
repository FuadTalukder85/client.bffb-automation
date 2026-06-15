import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input.jsx";
import { Select } from "@/components/ui/Select/Select";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { Loader2, Plus, Trash2, X, ChevronLeft } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { objectiveOptions, purposeOptions, getObjectiveByPurpose } from "../../constants/projectOptions";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/numberFormatter";
import { getApiErrorMessage } from "@/utils";
import { MultiSelect } from "@/components/ui/Select/MultiSelect";
import { useAuthStore } from "@/store/useAuthStore";

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

function AddResponsibilityMenu({ memberId, existingResponsibilities, isCreator, onAdd }) {
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
        !existingResponsibilities.includes(opt.value) &&
        (isCreator || opt.value !== "Project Overview")
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

            // Estimate dropdown height (max-h-48 is ~192px)
            if (spaceBelow < 180 && spaceAbove > spaceBelow) {
                setDropdownPos('top');
            } else {
                setDropdownPos('bottom');
            }

            // Calculate horizontal alignment
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
                            className="w-full text-left px-3 py-1.5 text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm hover:bg-gray-50 transition-colors text-gray-700 dark:text-white"
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

function DesktopProjectDetailsStep({ register, errors, raisedDate, setRaisedDate, control }) {
    const inputClass = "placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs 3xl:placeholder:text-sm text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm h-5 lg:h-6 xl:h-7.5 2xl:h-8.5 3xl:h-11";
    const wrapperClass = "rounded-lg bg-primary-shade-2/10 border-0";

    return (
        <div className="space-y-3 lg:space-y-1.5 xl:space-y-2 2xl:space-y-2.5 3xl:space-y-3 py-1">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 lg:gap-y-1.5 xl:gap-y-2 2xl:gap-y-2.5 3xl:gap-y-3">
                <div className="flex flex-col gap-0">
                    <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">Raised Date <span className="text-red-500">*</span></label>
                    <Controller
                        name="raisedDate"
                        control={control}
                        rules={{ required: "Raised date is required" }}
                        render={({ field }) => (
                            <DatePicker
                                id="raisedDate"
                                transparent={true}
                                addProject={true}
                                value={field.value || ""}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setRaisedDate(e.target.value);
                                }}
                                placeholder="Select date"
                                className={`${wrapperClass} w-full h-5 lg:h-6 xl:h-7.5 2xl:h-8.5 3xl:h-11 bg-primary-shade-2`}
                                inputClassName={inputClass}
                            />
                        )}
                    />
                    {errors.raisedDate && (
                        <span className="text-red-500 font-medium text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[11px] mt-0.5">
                            {errors.raisedDate.message}
                        </span>
                    )}
                </div>


                <div className="flex flex-col gap-0">
                    <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">Purpose</label>
                    <Controller
                        name="purpose"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Select
                                options={purposeOptions}
                                placeholder="Select Purpose"
                                className={`${wrapperClass} w-full h-5 lg:h-6 xl:h-7.5 2xl:h-8.5 3xl:h-11 bg-primary-shade-2`}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />
                </div>


                <div className="flex flex-col gap-1 lg:gap-[1px] xl:gap-[2px] 2xl:gap-[3px] 3xl:gap-1">
                    <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">
                        Raised By <span className="text-red-500">*</span>
                    </label>
                    <Input
                        {...register("raisedBy", { required: "Raised by is required" })}
                        placeholder="Department or team name"
                        className={wrapperClass}
                        inputClassName={inputClass}
                    />
                    {errors.raisedBy && (
                        <span className="text-red-500 font-medium text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[11px] mt-0.5">
                            {errors.raisedBy.message}
                        </span>
                    )}
                </div>




                <div className="flex flex-col gap-1">
                    <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">Purpose Name</label>
                    <Input
                        {...register("purposeDetails")}
                        placeholder="Enter purpose details"
                        className={wrapperClass}
                        inputClassName={inputClass}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">
                        Project Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                        {...register("projectTitle", { required: "Title is required" })}
                        placeholder="Enter project title"
                        className={wrapperClass}
                        inputClassName={inputClass}
                        error={errors.projectTitle?.message}
                    />
                    {errors.projectTitle && (
                        <span className="text-red-500 font-medium text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[11px] mt-0.5">
                            {errors.projectTitle.message}
                        </span>
                    )}
                </div>



                <div className="flex flex-col gap-0">
                    <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">Objective</label>
                    <Controller
                        name="objective"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Select
                                options={objectiveOptions}
                                placeholder="Auto-selected from Purpose"
                                className={`${wrapperClass} w-full h-5 lg:h-6 xl:h-7.5 2xl:h-8.5 3xl:h-11 bg-primary-shade-2`}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                disabled
                            />
                        )}
                    />
                </div>



                <div className="flex flex-col gap-1">
                    <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">Target Cost</label>
                    <Controller
                        name="targetCost"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Input
                                placeholder="e.g. Tk 3/sachet, Tk 10/250ml. Tk 8/40gm, etc."
                                className={wrapperClass}
                                inputClassName={inputClass}
                                value={(field.value)}
                                onChange={(e) => {
                                    const rawValue = parseFormattedNumber(e.target.value);
                                    field.onChange(rawValue);
                                }}
                            />
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">Objective Details</label>
                    <Input
                        {...register("objectiveDetails")}
                        placeholder="Enter objective details"
                        className={wrapperClass}
                        inputClassName={inputClass}
                    />
                </div>



            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[8px] lg:text-[8px] xl:text-[11px] 2xl:text-[13px] 3xl:text-base font-normal text-lighter-text">Brief</label>
                <Input
                    type="textarea"
                    {...register("projectBrief")}
                    placeholder="Describe the project brief..."
                    className={wrapperClass}
                    inputClassName={`${inputClass} min-h-[64px] lg:min-h-[64px] xl:min-h-[85px] 2xl:min-h-[96px] 3xl:min-h-[120px]`}
                />
            </div>
        </div>
    );
}

function DesktopAddMembersStep({
    selectedMembers,
    setSelectedMembers,
    isSubmitting,
    creatorId,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentMemberId, setCurrentMemberId] = useState("");
    const [currentResponsibility, setCurrentResponsibility] = useState([]);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
        statusFilter: "active",
        searchTerm: debouncedSearchTerm,
        limit: 500,
    });
    const employees = employeesData?.data || [];

    // Reset responsibility when selected member changes
    useEffect(() => {
        setCurrentResponsibility([]);
    }, [currentMemberId]);

    // Filter responsibility options: hide ones already assigned to the selected user
    const currentSelectedMember = selectedMembers.find((m) => (m._id || m.id) === currentMemberId);
    const alreadyAssigned = currentSelectedMember ? (currentSelectedMember.responsibilities || []) : [];

    // Hide "Project Overview" for non-creator members (only the creator gets it by default)
    const isCurrentMemberCreator = currentMemberId === creatorId;
    const filteredResponsibilityOptions = responsibilityOptions.filter(
        (opt) => !alreadyAssigned.includes(opt.value) && (isCurrentMemberCreator || opt.value !== "Project Overview")
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
                        {/* {employeeId} */}
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
                setSelectedMembers([...selectedMembers, { ...memberToAdd, responsibilities: currentResponsibility }]);
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

    return (
        <div className="flex flex-col space-y-3">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                    <div className="w-[35%] text-lg lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-lg font-semibold text-base-color">Project Members</div>
                    <div className="w-[20%] text-lg lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-lg font-semibold text-base-color">Role</div>
                    <div className="w-[35%] text-lg lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-lg font-semibold text-base-color">Responsibility</div>
                    <div className="w-[10%] text-lg lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-lg font-semibold text-base-color text-right">Action</div>
                </div>

                {/* Scrollable List */}
                <div className="max-h-[280px] lg:max-h-[140px] xl:max-h-[190px] 2xl:max-h-[220px] 3xl:max-h-[280px] overflow-y-auto custom-scrollbar p-2 lg:p-[4px] xl:p-[5px] 2xl:p-[6px] 3xl:p-2 space-y-2 lg:space-y-[4px] xl:space-y-[5px] 2xl:space-y-[6px] 3xl:space-y-2 bg-white dark:bg-gray-800 min-h-[180px] lg:min-h-[96px] xl:min-h-[128px] 2xl:min-h-[144px] 3xl:min-h-[180px]">
                    {selectedMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-36 text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm text-lighter-text">
                            <p>No members added yet.</p>
                        </div>
                    ) : (
                        selectedMembers.map((member, index) => {
                            const memberId = member._id || member.id;
                            const displayId = index + 1;
                            const isCreator = memberId === creatorId;
                            const hasProjectOverview = isCreator && member.responsibilities?.includes("Project Overview");

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
                                            <span className="text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm text-lighter-text truncate">
                                                {member.email}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-[20%] text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-sm font-medium text-base-color truncate pr-2">
                                        {member.role || "Jr. Analyst"}
                                    </div>
                                    <div className="w-[35%] pr-2 flex flex-wrap items-center gap-1.5 lg:gap-[1px] xl:gap-0.5 2xl:gap-1 3xl:gap-1.5">
                                        {member.responsibilities?.map(resp => {
                                            const isCreatorProjectOverview = isCreator && resp === "Project Overview";
                                            return (
                                                <span key={resp} className="inline-flex items-center gap-1 px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 py-1 lg:py-[1px] xl:py-0.5 2xl:py-[3px] 3xl:py-1 rounded-full text-[10px] lg:text-[7px] xl:text-[9px] 2xl:text-[10px] 3xl:text-xs font-semibold bg-[#482D79]/10 text-[#482D79] dark:bg-purple-900/30 dark:text-purple-300">
                                                    {resp}
                                                    {!isCreatorProjectOverview && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveResponsibility(memberId, resp)}
                                                            className="ml-1 hover:bg-[#482D79]/20 rounded-full p-0.5 transition-colors cursor-pointer text-[#482D79] dark:text-purple-300 flex items-center justify-center"
                                                        >
                                                            <X className="w-3 h-3 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 2xl:w-2.5 2xl:h-2.5 3xl:w-3 3xl:h-3" />
                                                        </button>
                                                    )}
                                                </span>
                                            );
                                        })}
                                        <AddResponsibilityMenu
                                            memberId={memberId}
                                            existingResponsibilities={member.responsibilities || []}
                                            isCreator={isCreator}
                                            onAdd={handleAddResponsibility}
                                        />
                                    </div>
                                    <div className="w-[10%] flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveUser(memberId)}
                                            disabled={hasProjectOverview}
                                            className={`p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 transition-colors bg-primary-shade-2 dark:bg-gray-400 rounded ${hasProjectOverview ? "opacity-40 cursor-not-allowed" : ""}`}
                                            title={hasProjectOverview ? "Project Overview cannot be removed from the project creator" : "Remove User"}
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
                        className="w-full text-base  border-0 text-base-color h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8"
                        containerClassName="bg-white/90 rounded-md"
                        disabled={isLoadingEmployees || isSubmitting}
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
                        disabled={!currentMemberId || isSubmitting}
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!currentMemberId || currentResponsibility.length === 0 || isSubmitting}
                    className=" text-primary bg-primary-shade-2 dark:text-gray-50 px-5 font-semibold h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 rounded-full text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base transition-transform hover:scale-105"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                </Button>
            </div>
        </div>
    );
}

export function DesktopCreateProjectWithMemberModal({
    open,
    onOpenChange,
    onConfirm,
    className
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [raisedDate, setRaisedDate] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [projectData, setProjectData] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    const selectedPurpose = watch("purpose");

    useEffect(() => {
        const derivedObjective = getObjectiveByPurpose(selectedPurpose);
        setValue("objective", derivedObjective, { shouldDirty: false });
    }, [selectedPurpose, setValue]);

    const { user } = useAuthStore();

    const wasOpenRef = useRef(false);

    useEffect(() => {
        if (open && !wasOpenRef.current) {
            // Transition from closed to open
            setCurrentStep(1);
            setProjectData(null);
            setRaisedDate("");
            reset({
                raisedDate: ""
            });
            setError(null);
            if (user) {
                setSelectedMembers([
                    {
                        ...user,
                        responsibilities: ["Project Overview"]
                    }
                ]);
            } else {
                setSelectedMembers([]);
            }
        } else if (!open && wasOpenRef.current) {
            // Transition from open to closed
            setSelectedMembers([]);
        }
        wasOpenRef.current = open;
    }, [open, reset, user]);

    const handleClose = (isOpen) => {
        if (!isLoading) {
            onOpenChange(isOpen);
        }
    };

    const onSubmitStep1 = async (data) => {
        setProjectData({
            ...data,
            raisedDate: data.raisedDate
        });
        setCurrentStep(2);
        setError(null);
    };

    const onSubmitStep2 = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const members = selectedMembers.map(m => ({
                userId: m._id || m.id,
                responsibilities: m.responsibilities || []
            }));
            await onConfirm({
                projectData,
                members
            });
            handleClose(false);
        } catch (err) {
            setError(getApiErrorMessage(err, "An error occurred while creating the project"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setCurrentStep(1);
        setError(null);
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
                            {currentStep === 1 ? "Add Project" : "Add Project Members"}
                        </ModalTitle>
                    </ModalHeader>

                    {error && (
                        <div className="p-2.5 mb-3 text-xs text-red-600 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                            {error}
                        </div>
                    )}

                    {currentStep === 1 ? (
                        <form onSubmit={handleSubmit(onSubmitStep1)}>
                            <div className="max-h-[65vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                                <DesktopProjectDetailsStep
                                    register={register}
                                    errors={errors}
                                    raisedDate={raisedDate}
                                    setRaisedDate={setRaisedDate}
                                    control={control}
                                />
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <div className="p-2.5 lg:p-1 xl:p-1.5 2xl:p-2 3xl:p-2.5 mt-3 mb-0 text-xs text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-red-600 border border-red-200 dark:border-red-800 rounded-lg lg:rounded-xs xl:rounded-sm 2xl:rounded-md 3xl:rounded-lg bg-red-50 dark:bg-red-900/20">
                                    Please fill in all required fields.
                                </div>
                            )}

                            <ModalFooter className="flex justify-end gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 mt-7 p-0">
                                <Button
                                    type="button"
                                    intent="outline"
                                    onClick={() => handleClose(false)}
                                    className=" border-primary/20 text-primary  dark:hover:bg-purple-900/20 text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base font-medium cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-9 lg:px-5 xl:px-6 2xl:px-7 3xl:px-9 bg-[#482D79] hover:bg-[#3b2366] text-white text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base font-medium cursor-pointer"
                                >
                                    Next
                                </Button>
                            </ModalFooter>
                        </form>
                    ) : (
                        <div>
                            <div className="max-h-[65vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                                <DesktopAddMembersStep
                                    selectedMembers={selectedMembers}
                                    setSelectedMembers={setSelectedMembers}
                                    isSubmitting={isLoading}
                                    creatorId={user?._id || user?.id}
                                />
                            </div>

                            <ModalFooter className="flex justify-end gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 mt-7 lg:mt-4 xl:mt-5 2xl:mt-5.5 3xl:mt-7 p-0">
                                <Button
                                    type="button"
                                    intent="outline"
                                    onClick={handleBack}
                                    disabled={isLoading}
                                    className="px-7 lg:px-3.5 xl:px-5 2xl:px-5.5 3xl:px-7 h-10 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 border-primary/20 text-primary  dark:hover:bg-purple-900/20 rounded-lg text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base font-medium flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 h-5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5" />
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={onSubmitStep2}
                                    disabled={isLoading}
                                    className="px-9 lg:px-5 xl:px-6 2xl:px-7 3xl:px-9 h-10 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 bg-[#482D79] hover:bg-[#3b2366] text-white rounded-lg text-base lg:text-[7.5px] xl:text-[10px] 2xl:text-[11px] 3xl:text-base font-medium flex items-center justify-center gap-2"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </div>
            </ModalContent>
        </Modal>
    );
}
