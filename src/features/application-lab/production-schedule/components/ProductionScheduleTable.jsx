import React, { useState, useCallback } from "react";
import { ChevronRight, Plus, Check, X, Loader2, Trash2 } from "lucide-react";
import { DeleteEntryModal } from "./DeleteEntryModal";
import { RestoreScheduleModal } from "./RestoreScheduleModal";
import { AiFillThunderbolt } from "react-icons/ai";
import { NoData } from "@/components/ui/NoData";

const CustomSelect = ({ value, options, onChange, bgColor, disabled }) => {
  const [open, setOpen] = useState(false);
  const selectRef = React.useRef(null);

  const selected = options.find((opt) => opt.value === value);

  const getBorderColor = (optionValue) => {
    switch (optionValue) {
      case "w": return "border-[#FFD0A5]";
      case "m": return "border-[#CDF3E6]";
      case "pr": return "border-[#3FE5FF]";
      case "pk": return "border-[#FFE2F4]";
      default: return "border-[#C4DAFF]";
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={selectRef} className="relative w-full h-full text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full h-full min-h-[24px] lg:min-h-[12px] xl:min-h-[14px] 2xl:min-h-[18px] 3xl:min-h-[24px] rounded-[40px] text-center pr-6 lg:pr-2 xl:pr-3 2xl:pr-4 3xl:pr-6 dark:text-gray-600 ${
          value ? bgColor : "bg-transparent"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-opacity-80"}`}
      >
        {selected?.label || ""}
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-border z-50 overflow-hidden flex flex-col gap-1 p-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-1 lg:px-1 lg:py-0.5 xl:px-1.5 xl:py-0.5 2xl:px-2 2xl:py-1 3xl:px-3 3xl:py-1 border ${getBorderColor(option.value)} rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-center text-[inherit] transition-colors`}
            >
              {option.label}
            </button>
          ))}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full px-3 py-1 lg:px-1 lg:py-0.5 xl:px-1.5 xl:py-0.5 2xl:px-2 2xl:py-1 3xl:px-3 3xl:py-1 border border-red-200 hover:border-red-300 dark:border-red-900/50 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer flex items-center justify-center text-red-500 transition-colors"
              title="Remove value"
            >
              <Trash2 className="w-3.5 h-3.5 lg:w-2 lg:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 3xl:w-3.5 3xl:h-3.5" />
            </button>
          )}
        </div>
      )}

      {value && (
        <svg 
          className="absolute right-1 lg:right-0.5 xl:right-0.75 2xl:right-1 3xl:right-1.5 top-1/2 -translate-y-1/2 pointer-events-none w-[6px] lg:w-[3.5px] xl:w-[4px] 2xl:w-[5px] 3xl:w-[6px] h-[2px] lg:h-[1.2px] xl:h-[1.5px] 2xl:h-[1.75px] 3xl:h-[2px]" 
          viewBox="0 0 6 2" 
          fill="none"
        >
          <path d="M6 0L3 2L0 0H6Z" fill="currentColor" />
        </svg>
      )}
    </div>
  );
};

export default function ProductionScheduleTable({
  scheduleData,
  timeSlots,
  activityOptions,
  projectsList,
  editingProject,
  isExpanded,
  isLoading,
  onActivityChange,
  onProjectCodeChange,
  onProjectClick,
  onDeleteRow,
  onRestoreRow,
  onToggleExpand,
  setEditingProject,
  onAddRow,
  isArchived = false,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [editingRows, setEditingRows] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});



  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setIsDeleteModalOpen(true);
  };

  const handleRestoreClick = (row) => {
    setSelectedItem(row);
    setIsRestoreModalOpen(true);
  };

  const handleDeleteConfirm = async (item) => {
    await onDeleteRow(item.id);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleRestoreConfirm = async (item) => {
    await onRestoreRow(item.id);
    setIsRestoreModalOpen(false);
    setSelectedItem(null);
  };

  const toggleEditMode = useCallback((rowId) => {
    setEditingRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
    if (!editingRows[rowId]) {
      setPendingChanges(prev => ({ ...prev, [rowId]: {} }));
    }
  }, [editingRows]);

  const handleCellChange = useCallback((rowId, timeSlot, value) => {
    setPendingChanges(prev => ({ ...prev, [rowId]: { ...prev[rowId], [timeSlot]: value } }));
  }, []);

  const handleSaveRow = useCallback(async (row) => {
    const changes = pendingChanges[row.id];
    if (!changes) return;
    for (const [timeSlot, value] of Object.entries(changes)) {
      await onActivityChange(row.id, timeSlot, value);
    }
    setEditingRows(prev => ({ ...prev, [row.id]: false }));
    setPendingChanges(prev => ({ ...prev, [row.id]: {} }));
  }, [pendingChanges, onActivityChange]);

  const handleCancelEdit = useCallback((rowId) => {
    setEditingRows(prev => ({ ...prev, [rowId]: false }));
    setPendingChanges(prev => ({ ...prev, [rowId]: {} }));
  }, []);

  const getCellValue = useCallback((row, timeSlot) => {
    const pending = pendingChanges[row.id]?.[timeSlot];
    if (pending !== undefined) return pending;
    return row.schedule[timeSlot] || "";
  }, [pendingChanges]);

  const handleProjectChange = async (rowId, projectCode) => {
    await onProjectCodeChange(rowId, projectCode);
    setEditingProject(null);
  };

  const getBgColor = (value) => {
    switch (value) {
      case "w": return "bg-[#FFD0A5]";
      case "m": return "bg-[#CDF3E6]";
      case "pr": return "bg-[#3FE5FF]";
      case "pk": return "bg-[#FFE2F4]";
      default: return "bg-transparent";
    }
  };

  return (
    <div className="bg-background rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl border border-border overflow-hidden flex flex-col flex-1 min-h-0 max-h-full w-full md:flex-1 md:flex md:flex-col md:min-h-0">
      <div className="overflow-auto custom-scrollbar scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0">
        <table className="w-full border-collapse text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
          <thead>
            <tr className="dark:bg-gray-800">
              <th className="bg-white border-b border-primary px-10 lg:px-5 xl:px-7 2xl:px-8 3xl:px-10 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 text-left font-medium sticky left-0 dark:bg-gray-800 z-20 transition-all duration-700 whitespace-nowrap">Project Code</th>
              <th className={`text-left font-medium dark:bg-gray-800 overflow-hidden whitespace-nowrap transition-all duration-700 ease-in-out ${isExpanded ? "border-b border-primary px-4 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 w-37.5 lg:w-20 xl:w-26 2xl:w-30 3xl:w-37.5 opacity-100" : "px-0 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 max-w-0 opacity-0"}`}>
                <span className={`transition-opacity duration-700 ${isExpanded ? "opacity-100" : "opacity-0"}`}>Project Name</span>
              </th>
              <th className={`text-left font-medium dark:bg-gray-800 overflow-hidden whitespace-nowrap transition-all duration-700 ease-in-out ${isExpanded ? "border-b border-primary px-4 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 w-37.5 lg:w-20 xl:w-26 2xl:w-30 3xl:w-37.5 opacity-100" : "px-0 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 max-w-0 opacity-0"}`} style={{ transitionDelay: isExpanded ? "50ms" : "0ms" }}>
                <span className={`transition-opacity duration-700 ${isExpanded ? "opacity-100" : "opacity-0"}`}>Purpose Name</span>
              </th>
              <th className={`text-left font-medium dark:bg-gray-800 overflow-hidden whitespace-nowrap transition-all duration-700 ease-in-out ${isExpanded ? "border-b border-primary px-4 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 w-37.5 lg:w-20 xl:w-26 2xl:w-30 3xl:w-37.5 opacity-100" : "px-0 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 max-w-0 opacity-0"}`} style={{ transitionDelay: isExpanded ? "100ms" : "0ms" }}>
                <span className={`transition-opacity duration-700 ${isExpanded ? "opacity-100" : "opacity-0"}`}>Objective Details</span>
              </th>
              <th className={`text-left font-medium dark:bg-gray-800 overflow-hidden whitespace-nowrap transition-all duration-700 ease-in-out ${isExpanded ? "border-b border-primary px-4 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 w-37.5 lg:w-20 xl:w-26 2xl:w-30 3xl:w-37.5 opacity-100" : "px-0 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 max-w-0 opacity-0"}`} style={{ transitionDelay: isExpanded ? "150ms" : "0ms" }}>
                <span className={`transition-opacity duration-700 ${isExpanded ? "opacity-100" : "opacity-0"}`}>Recipe Code</span>
              </th>
              {timeSlots.map((time) => (
                <th key={time} className="border border-border px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-3 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-3 text-center font-medium min-w-15 lg:min-w-8 xl:min-w-9.5 2xl:min-w-12 3xl:min-w-15 transition-all duration-700">{time}</th>
              ))}
              <th className="bg-white border border-border px-4 py-3 lg:py-1.5 xl:py-1.5 2xl:py-2 3xl:py-3 text-center font-medium sticky right-0 dark:bg-gray-800 z-20 min-w-25 transition-all duration-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.length === 0 ? (
              <tr>
                <td colSpan={timeSlots.length + 6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading schedules...</span>
                    </div>
                  ) : (
                    <NoData
                      message="No Records Found"
                      description="No production schedules found for this date. Click 'Create New Schedule Entry' to add one."
                    />
                  )}
                </td>
              </tr>
            ) : (
              scheduleData.map((row, rowIndex) => {
                const isNewRow = String(row.id).startsWith('new-');
                const hasProject = row.projectCode && row.projectCode !== '';
                const isEditing = editingRows[row.id];
                const hasChanges = pendingChanges[row.id] && Object.keys(pendingChanges[row.id]).length > 0;

                return (
                  <React.Fragment key={row.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="border-b border-border p-2 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 sticky left-0 bg-white dark:bg-gray-900 z-10 transition-all duration-700">
                        {editingProject === row.id && isNewRow ? (
                          <select
                            value={row.projectCode || ''}
                            onChange={(e) => handleProjectChange(row.id, e.target.value)}
                            onBlur={() => setEditingProject(null)}
                            autoFocus
                            className="w-full px-2 py-1 border border-gray-300 rounded bg-white dark:bg-gray-800 text-sm lg:text-[18px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! whitespace-nowrap"
                            disabled={isLoading}
                          >
                            <option value="">Select Project</option>
                            {projectsList?.map((project) => (
                              <option key={project.id} value={project.code}>{project.code} - {project.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div
                            onClick={() => isNewRow && !isLoading && onProjectClick && onProjectClick(row.id)}
                            className={`px-9 lg:px-5.5 xl:px-6.5 2xl:px-7.5 3xl:px-9 py-1 font-medium rounded transition-colors flex items-center gap-2 text-sm lg:text-[8px]! xl:text-[10px]! 2xl:text-xs! 3xl:text-sm! whitespace-nowrap ${
                              isLoading ? 'cursor-not-allowed opacity-50' : isNewRow ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            {row.projectCode || (isNewRow ? <span className="text-gray-400 italic">Click to select</span> : <span className="text-gray-400 italic">Unknown</span>)}
                          </div>
                        )}
                      </td>
                      <td className={`dark:bg-gray-900 overflow-hidden whitespace-nowrap transition-all duration-700 ease-in-out ${isExpanded ? "border-b border-border px-4 lg:px-2 xl:px-2.5 2xl:px-3.5 3xl:px-4 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 w-37.5 lg:w-20 xl:w-26 2xl:w-30 3xl:w-37.5 opacity-100" : "px-0 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 max-w-0 opacity-0"}`}>
                        <span className={`transition-opacity duration-700 ${isExpanded ? "opacity-100" : "opacity-0"}`}>{row.projectName}</span>
                      </td>
                      <td className={`dark:bg-gray-900 overflow-hidden whitespace-nowrap transition-all duration-700 ease-in-out ${isExpanded ? "border-b border-border px-4 lg:px-2 xl:px-2.5 2xl:px-3.5 3xl:px-4 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 w-37.5 lg:w-20 xl:w-26 2xl:w-30 3xl:w-37.5 opacity-100" : "px-0 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 max-w-0 opacity-0"}`} style={{ transitionDelay: isExpanded ? "50ms" : "0ms" }}>
                        <span className={`transition-opacity duration-700 ${isExpanded ? "opacity-100" : "opacity-0"}`}>{row.purposeName}</span>
                      </td>
                      <td className={`dark:bg-gray-900 overflow-hidden whitespace-nowrap transition-all duration-700 ease-in-out ${isExpanded ? "border-b border-border px-4 lg:px-2 xl:px-2.5 2xl:px-3.5 3xl:px-4 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 w-37.5 lg:w-20 xl:w-26 2xl:w-30 3xl:w-37.5 opacity-100" : "px-0 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 max-w-0 opacity-0"}`} style={{ transitionDelay: isExpanded ? "100ms" : "0ms" }}>
                        <span className={`transition-opacity duration-700 ${isExpanded ? "opacity-100" : "opacity-0"}`}>{row.objectiveDetails}</span>
                      </td>
                      <td className={`dark:bg-gray-900 overflow-hidden whitespace-nowrap transition-all duration-700 ease-in-out ${isExpanded ? "border-b border-border px-4 lg:px-2 xl:px-2.5 2xl:px-3.5 3xl:px-4 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 w-30 lg:w-16 xl:w-21 2xl:w-24 3xl:w-30 opacity-100" : "px-0 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 max-w-0 opacity-0"}`} style={{ transitionDelay: isExpanded ? "150ms" : "0ms" }}>
                        <span className={`transition-opacity duration-700 ${isExpanded ? "opacity-100" : "opacity-0"}`}>{row.recipeCode}</span>
                      </td>
                      
                      {timeSlots.map((time) => {
                        const cellValue = isNewRow ? (row.schedule[time] || "") : getCellValue(row, time);
                        const isDisabled = isLoading || (isNewRow ? !hasProject : !isEditing);

                        return (
                          <td key={time} className={`border border-border px-1 py-1 text-center transition-all duration-700 ${isNewRow && !hasProject ? 'bg-gray-50 dark:bg-gray-800/50' : ''} ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <div className="relative w-full h-full min-h-[28px] lg:min-h-[16px] xl:min-h-[18px] 2xl:min-h-[22px] 3xl:min-h-[28px]">
                              <CustomSelect
                                value={cellValue}
                                options={activityOptions}
                                bgColor={getBgColor(cellValue)}
                                onChange={(newValue) => isEditing && !isNewRow ? handleCellChange(row.id, time, newValue) : onActivityChange(row.id, time, newValue)}
                                disabled={isDisabled}
                              />
                            </div>
                          </td>
                        );
                      })}
                      
                      <td className="bg-white border border-border px-4 lg:px-2 xl:px-2.5 2xl:px-3.5 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 sticky right-0 dark:bg-gray-900 z-10 transition-all duration-700">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing && !isNewRow ? (
                            <div className="border border-gray-200 rounded-[30px] flex items-center">
                              <button onClick={() => handleSaveRow(row)} disabled={!hasChanges || isLoading} className={`px-3 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-3 py-1 lg:py-0.5 xl:py-0.5 2xl:py-[3px] 3xl:py-1 flex items-center justify-center rounded-l-[30px] transition-colors ${hasChanges ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`} title="Save Changes"><Check className="action-button-icon" /></button>
                              <button onClick={() => handleCancelEdit(row.id)} disabled={isLoading} className="px-3 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-3 py-1 lg:py-0.5 xl:py-0.5 2xl:py-[3px] 3xl:py-1 flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 rounded-r-[30px] transition-colors" title="Cancel"><X className="action-button-icon" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              {isArchived ? (
                                <button
                                  onClick={() => handleRestoreClick(row)}
                                  disabled={isLoading}
                                  className={`px-3 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-3 py-1 lg:py-0.5 xl:py-0.5 2xl:py-[3px] 3xl:py-1 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 rounded-[30px] transition-colors ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                  title="Restore Row"
                                >
                                  <AiFillThunderbolt className="action-button-icon" />
                                </button>
                              ) : (
                                <>
                                  <button onClick={() => toggleEditMode(row.id)} disabled={isLoading || isNewRow} className={`action-button flex items-center justify-center gap-1.5 rounded-l-md rounded-r-none hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer ${isLoading || isNewRow ? 'cursor-not-allowed opacity-50' : ''}`} title="Edit Schedule">
                                      <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                                  </button>
                                  <button onClick={() => handleDeleteClick(row)} disabled={isLoading} className={`action-button flex items-center justify-center gap-1.5 rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`} title="Archive Row">
                                    <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {rowIndex === 1 && (
                      <tr className="relative h-0">
                        <td colSpan={timeSlots.length + (isExpanded ? 6 : 2)} className="border-0 p-0 h-0">
                          <div className={`absolute -top-3 z-20 transition-all duration-700 ease-in-out ${isExpanded ? "left-208 lg:left-122 xl:left-148 2xl:left-180 3xl:left-208" : "left-47 lg:left-25 xl:left-33 2xl:left-37 3xl:left-47"}`}>
                            <button onClick={onToggleExpand} className="w-8 lg:w-4.5 xl:w-5.5 2xl:w-6.5 3xl:w-8 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8 rounded-full bg-[#EEEBF4] dark:bg-gray-800 border border-border shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center">
                              <ChevronRight className={`w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-gray-600 dark:text-gray-400 transition-transform duration-700 ${isExpanded ? "rotate-180" : "rotate-0"}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex-none border-t border-[#EEEBF4] dark:border-gray-700 py-4 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-3 px-4 lg:px-2 xl:px-2.5 2xl:px-3.5 3xl:px-4">
        <button onClick={onAddRow} disabled={isLoading} className="flex items-center gap-2 text-[16px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[16px] px-4 lg:px-2 xl:px-2.5 2xl:px-3.5 3xl:px-4 py-2 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 rounded-full bg-primary text-white! hover:bg-primary/90 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" /> : <Plus className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />}
          <span>Create New Schedule Entry</span>
        </button>
      </div>

      <DeleteEntryModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} item={selectedItem} onConfirm={handleDeleteConfirm} isLoading={isLoading} />
      <RestoreScheduleModal open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen} item={selectedItem} onConfirm={handleRestoreConfirm} isLoading={isLoading} />
    </div>
  );
}
