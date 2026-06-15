import React, { useState, useEffect } from "react";
import { Select } from "@/components/ui/Select/Select";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEmployees } from "@/hooks/useEmployees";
import { useDebounce } from "@/hooks/useDebounce";

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

export function AddMembersStep({
    selectedMembers,
    setSelectedMembers,
    isSubmitting,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentMemberId, setCurrentMemberId] = useState("");
    const [currentResponsibility, setCurrentResponsibility] = useState("");

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch employees from API using TanStack Query with search
    const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
        statusFilter: "active",
        searchTerm: debouncedSearchTerm,
        limit: 500,
    });
    const employees = employeesData?.data || [];

    // Reset responsibility when selected member changes
    useEffect(() => {
        setCurrentResponsibility("");
    }, [currentMemberId]);

    // Filter responsibility options: hide ones already assigned to the selected user
    const alreadyAssigned = selectedMembers
        .filter((m) => (m._id || m.id) === currentMemberId)
        .map((m) => m.responsibility);

    const filteredResponsibilityOptions = responsibilityOptions.filter(
        (opt) => !alreadyAssigned.includes(opt.value)
    );

    const employeeOptions = (employees || []).map((emp, index) => {
        const name = emp.name || emp.username || "Unknown";
        const email = emp.email || "";
        const employeeId = emp.employeeId || "?";
        const displayId = index + 1;

        return {
            value: emp._id || emp.id,
            searchText: `${name} ${email} ${employeeId}`,
            label: (
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 text-[10px] font-medium rounded-full bg-primary-shade-2 text-primary shrink-0 border border-primary/15 dark:border-primary dark:text-white">
                        {displayId}
                        {/* {employeeId} */}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-medium leading-none">{name}</span>
                        {email && (
                            <span className="text-[10px] text-muted-foreground leading-none">
                                {email}
                            </span>
                        )}
                    </div>
                </div>
            ),
        };
    });

    const handleAddMember = () => {
        if (!currentMemberId || !currentResponsibility) return;

        const memberToAdd = employees.find(
            (e) => (e._id || e.id) === currentMemberId
        );
        if (memberToAdd) {
            setSelectedMembers([
                ...selectedMembers,
                { ...memberToAdd, responsibility: currentResponsibility }
            ]);
            setCurrentMemberId("");
            setCurrentResponsibility("");
        }
    };

    const handleRemoveMember = (memberId, responsibility) => {
        setSelectedMembers(
            selectedMembers.filter((m) => !((m._id || m.id) === memberId && m.responsibility === responsibility))
        );
    };

    return (
        <div className="flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-[1.8fr_1fr_1.8fr_40px] gap-3 px-3 mb-2 text-xs font-medium text-lighter-text">
                <div className="font-semibold text-base-color">Assign to</div>
                <div className="font-semibold text-base-color">Role</div>
                <div className="font-semibold text-base-color">Responsibility</div>
                <div className="text-right"></div>
            </div>

            {/* Members List */}
            <div className="flex-1 pr-1 space-y-2 overflow-y-auto custom-scrollbar max-h-[220px] mb-3">
                {selectedMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-sm text-lighter-text">
                        <p>No members added yet.</p>
                        <p className="text-xs">Add members using the form below.</p>
                    </div>
                ) : (
                    selectedMembers.map((member, index) => {
                        const memberId = member._id || member.id;
                        const displayId = index + 1;

                        return (
                            <div
                                key={`${memberId}-${member.responsibility}`}
                                className="grid grid-cols-[1.8fr_1fr_1.8fr_40px] gap-3 items-center p-2 bg-primary-shade-2/10 border border-gray-100 dark:border-white/5 rounded-lg hover:border-primary/30 transition-colors"
                            >
                                {/* User Info */}
                                <div className="flex items-center min-w-0 gap-2">
                                    <div className="flex items-center justify-center w-7 h-7 text-[10px] font-medium rounded-full bg-primary/10 text-primary shrink-0">
                                        {displayId}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-medium truncate text-base-color">
                                            {member.name || member.username || "Unknown"}
                                        </span>
                                        <span className="text-[10px] truncate text-lighter-text">
                                            {member.email || "No email"}
                                        </span>
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="min-w-0">
                                    <span className="block text-[11px] font-medium truncate text-lighter-text">
                                        {member.role || "Jr. Analyst"}
                                    </span>
                                </div>

                                {/* Responsibility */}
                                <div className="min-w-0">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#482D79]/10 text-[#482D79] dark:bg-purple-900/30 dark:text-purple-300">
                                        {member.responsibility}
                                    </span>
                                </div>

                                {/* Delete Action */}
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(memberId, member.responsibility)}
                                        className="p-1 transition-colors rounded-md hover:bg-red-50 text-base-color hover:text-red-500"
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Member Bar */}
            <div className="py-3 px-3 bg-primary-shade-2/20 rounded-lg border border-primary-shade-2/30">
                <div className="grid grid-cols-[4fr_2fr_4fr_auto] gap-3 items-center">
                    <div className="w-full">
                        <Select
                            value={currentMemberId}
                            onChange={(e) => setCurrentMemberId(e.target.value)}
                            options={employeeOptions}
                            placeholder={isLoadingEmployees ? "Loading..." : "Select User"}
                            className="w-full text-xs bg-white border-table-stroke"
                            disabled={isLoadingEmployees || isSubmitting}
                            position="top"
                            searchable={true}
                            onSearchChange={setSearchTerm}
                        />
                    </div>
                    <div className="text-xs text-lighter-text truncate max-w-[80px]">
                        {employees?.find((e) => (e._id || e.id) === currentMemberId)
                            ?.role || "-"}
                    </div>
                    <div className="w-full">
                        <Select
                            value={currentResponsibility}
                            onChange={(e) => setCurrentResponsibility(e.target.value)}
                            options={filteredResponsibilityOptions}
                            placeholder="Select Responsibility"
                            className="w-full text-xs bg-white border-table-stroke"
                            disabled={!currentMemberId || isSubmitting}
                            position="top"
                        />
                    </div>
                    <div className="text-right">
                        <Button
                            type="button"
                            onClick={handleAddMember}
                            disabled={!currentMemberId || !currentResponsibility || isSubmitting}
                            className="px-3 py-1 text-xs font-medium text-white rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50 h-8"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
