import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp, Plus, Check, X, Loader2, Trash2 } from "lucide-react";
import { DeleteEntryModal } from './DeleteEntryModal';
import { RestoreScheduleModal } from './RestoreScheduleModal';
import { AiFillThunderbolt } from "react-icons/ai";
import { NoData } from "@/components/ui/NoData";

import { useUsers } from "@/hooks/useUsers";

const CustomSelect = ({ value, options, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);

  const getOptionBgColor = (optionValue) => {
    switch (optionValue) {
      case "w": return "bg-[#FFD0A5]";
      case "m": return "bg-[#CDF3E6]";
      case "pr": return "bg-[#3FE5FF]";
      case "pk": return "bg-[#FFE2F4]";
      default: return "bg-transparent";
    }
  };

  useEffect(() => {
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
    <div ref={selectRef} className="relative w-full h-full min-h-[36px] text-sm">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`absolute inset-0 w-full h-full z-[1] flex items-center justify-center text-xs font-medium ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        {selected?.label || ""}
      </button>

      {value && (
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-[2]"
          width="6"
          height="2"
          viewBox="0 0 6 2"
          fill="none"
        >
          <path d="M6 0L3 2L0 0H6Z" fill="currentColor" />
        </svg>
      )}

      {open && !disabled && (
        <div className="absolute left-0 top-full mt-0 w-full bg-white dark:bg-gray-800 shadow-lg border border-border overflow-hidden z-50 flex flex-col gap-1 p-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full py-2 ${getOptionBgColor(option.value)} hover:opacity-80 cursor-pointer text-center rounded-md dark:text-gray-600`}
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
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-md cursor-pointer flex items-center justify-center transition-colors dark:bg-red-950/20 dark:hover:bg-red-900/30"
              title="Remove value"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const RecipeSelect = ({ projectId, projectCode, selectedRecipeCode, allRecipes = [], onChange, disabled }) => {
  const projectRecipes = useMemo(() => {
    if ((!projectId || projectId === 'new') && !projectCode) return [];
    return (allRecipes || []).filter(r => {
      const rProjId = r.project?._id || r.project?.id || (typeof r.project === 'string' ? r.project : null);
      if (projectId && projectId !== 'new' && rProjId && String(rProjId) === String(projectId)) {
        return true;
      }
      if (projectCode) {
        const rProjCode = r.project?.masterProject?.code || r.project?.code || r.independentDetails?.projectCode;
        if (rProjCode && rProjCode === projectCode) return true;
      }
      return false;
    });
  }, [projectId, projectCode, allRecipes]);

  const recipeOptions = useMemo(() => {
    const list = [...projectRecipes];
    if (selectedRecipeCode && !list.some(r => r.recipeCode === selectedRecipeCode)) {
      list.unshift({ recipeCode: selectedRecipeCode, name: '', _id: null });
    }
    return list;
  }, [projectRecipes, selectedRecipeCode]);

  const handleChange = (e) => {
    const code = e.target.value;
    const recipeObj = projectRecipes.find(r => r.recipeCode === code);
    onChange(code, recipeObj?._id || null);
  };

  if ((!projectId || projectId === 'new') && !projectCode) {
    return <span className="text-gray-400 italic text-[10px]">Select project</span>;
  }

  return (
    <select
      value={selectedRecipeCode || ''}
      onChange={handleChange}
      disabled={disabled}
      className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded bg-white dark:bg-gray-800"
    >
      <option value="">Select Recipe</option>
      {recipeOptions.map(r => (
        <option key={r.recipeCode || r._id} value={r.recipeCode}>
          {r.recipeCode}
        </option>
      ))}
    </select>
  );
};

const ResponsiblePersonMultiSelect = ({ selectedUsers = [], allUsers = [], onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const { data: usersFromHook = [] } = useUsers({ activeOnly: true });
  const rawList = allUsers && allUsers.length > 0 ? allUsers : usersFromHook;
  const usersList = Array.isArray(rawList) ? rawList : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const selectedIds = useMemo(() => {
    return (selectedUsers || []).map(u => (typeof u === 'object' ? (u._id || u.id) : u)).filter(Boolean);
  }, [selectedUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return usersList;
    return usersList.filter(u => {
      const name = (u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [usersList, searchTerm]);

  const toggleUser = (userId) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter(id => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const selectedUserObjects = useMemo(() => {
    return usersList.filter(u => selectedIds.includes(u._id || u.id));
  }, [usersList, selectedIds]);

  return (
    <div ref={dropdownRef} className="relative w-full text-xs">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setOpen(prev => !prev);
        }}
        disabled={disabled}
        className={`w-full min-h-[24px] px-1.5 py-0.5 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-left flex items-center justify-between gap-1 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'
        }`}
      >
        <div className="flex flex-wrap gap-1 items-center max-w-[120px] truncate">
          {selectedUserObjects.length > 0 ? (
            selectedUserObjects.map(u => (
              <span key={u._id || u.id} className="bg-primary/10 text-primary text-[9px] px-1 py-0.2 rounded truncate">
                {u.name || u.email}
              </span>
            ))
          ) : selectedIds.length > 0 ? (
            <span className="text-primary text-[10px] font-medium">{selectedIds.length} selected</span>
          ) : (
            <span className="text-gray-400 italic text-[10px]">Select Person</span>
          )}
        </div>
        <span className="text-[9px] text-gray-500 font-semibold">{selectedIds.length > 0 ? `(${selectedIds.length})` : '▾'}</span>
      </button>

      {open && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-2xl border border-border z-[100] p-1.5 max-h-48 overflow-hidden flex flex-col gap-1"
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-1.5 py-0.5 text-xs border border-border rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <div className="overflow-y-auto max-h-36 flex flex-col gap-0.5 custom-scrollbar pr-1">
            {filteredUsers.length === 0 ? (
              <span className="text-xs text-gray-400 p-1 text-center">No users</span>
            ) : (
              filteredUsers.map(user => {
                const uid = user._id || user.id;
                const isSelected = selectedIds.includes(uid);
                return (
                  <label
                    key={uid}
                    className={`flex items-center gap-1.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-xs ${
                      isSelected ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleUser(uid)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-3 w-3"
                    />
                    <span className="truncate">{user.name || user.email}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function MobileProductionScheduleCard({
  scheduleData,
  timeSlots,
  activityOptions,
  projectsList,
  editingProject,
  onActivityChange,
  onSaveRow,
  onDeleteRow,
  onAddRow,
  onProjectCodeChange,
  onProjectClick,
  setEditingProject,
  isExpanded,
  onToggleExpand,
  isLoading,
  onRestoreRow,
  isArchived = false,
  canCreateSchedule = false,
  allUsers = [],
  allRecipes = [],
  className,
}) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Track edit mode per row and pending changes
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

  // Toggle edit mode for a row
  const toggleEditMode = useCallback((row) => {
    const rowId = row.id;
    const nextState = !editingRows[rowId];
    setEditingRows(prev => ({
      ...prev,
      [rowId]: nextState
    }));
    if (nextState) {
      setPendingChanges(prev => ({
        ...prev,
        [rowId]: {
          schedule: { ...(row.schedule || {}) },
          recipeCode: row.recipeCode || '',
          recipeId: row.recipeId || null,
          responsiblePersons: Array.isArray(row.responsiblePersons)
            ? row.responsiblePersons.map(u => (typeof u === 'object' ? (u._id || u.id) : u))
            : [],
        }
      }));
    }
  }, [editingRows]);

  // Handle cell change in edit mode
  const handleCellChange = useCallback((rowId, timeSlot, value) => {
    setPendingChanges(prev => {
      const rowChanges = prev[rowId] || {};
      const currentSchedule = rowChanges.schedule || {};
      return {
        ...prev,
        [rowId]: {
          ...rowChanges,
          schedule: {
            ...currentSchedule,
            [timeSlot]: value
          }
        }
      };
    });
  }, []);

  const handleRowRecipeChange = useCallback((rowId, recipeCode, recipeId) => {
    setPendingChanges(prev => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        recipeCode,
        recipeId,
      }
    }));
  }, []);

  const handleRowResponsiblePersonsChange = useCallback((rowId, userIds) => {
    setPendingChanges(prev => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        responsiblePersons: userIds,
      }
    }));
  }, []);

  // Save all pending changes
  const handleSaveRow = useCallback(async (row) => {
    const changes = pendingChanges[row.id];
    if (onSaveRow) {
      await onSaveRow(row.id, {
        projectId: row.projectId,
        schedule: changes?.schedule !== undefined ? changes.schedule : row.schedule,
        recipeCode: changes?.recipeCode !== undefined ? changes.recipeCode : row.recipeCode,
        recipeId: changes?.recipeId !== undefined ? changes.recipeId : row.recipeId,
        responsiblePersons: changes?.responsiblePersons !== undefined ? changes.responsiblePersons : row.responsiblePersons,
      });
    } else if (changes?.schedule) {
      for (const [timeSlot, value] of Object.entries(changes.schedule)) {
        await onActivityChange(row.id, timeSlot, value);
      }
    }

    setEditingRows(prev => ({ ...prev, [row.id]: false }));
    setPendingChanges(prev => ({ ...prev, [row.id]: undefined }));
  }, [pendingChanges, onSaveRow, onActivityChange]);

  // Cancel edit mode
  const handleCancelEdit = useCallback((rowId) => {
    setEditingRows(prev => ({ ...prev, [rowId]: false }));
    setPendingChanges(prev => ({ ...prev, [rowId]: undefined }));
  }, []);

  // Get effective value (pending change or original)
  const getCellValue = useCallback((row, timeSlot) => {
    const pendingSchedule = pendingChanges[row.id]?.schedule;
    if (pendingSchedule && pendingSchedule[timeSlot] !== undefined) {
      return pendingSchedule[timeSlot];
    }
    return row.schedule?.[timeSlot] || "";
  }, [pendingChanges]);

  // Handle project change for new rows
  const handleProjectChange = async (rowId, projectCode) => {
    const isNewRow = String(rowId).startsWith('new-');
    if (isNewRow && onProjectCodeChange) {
      await onProjectCodeChange(rowId, projectCode);
      setEditingProject(null);
    }
  };

  const handleRecipeClick = useCallback((row) => {
    if (row.recipeId) {
      navigate(`/application-lab/application-recipes/version/${row.recipeId}`);
    } else if (row.projectId && row.projectId !== 'new') {
      navigate(`/application-lab/application-recipes/${row.projectId}`);
    } else if (row.recipeCode) {
      const match = (allRecipes || []).find(r => r.recipeCode === row.recipeCode);
      if (match?._id) {
        navigate(`/application-lab/application-recipes/version/${match._id}`);
      }
    }
  }, [navigate, allRecipes]);

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
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${className}`}>
      {/* Expand/Collapse Button */}
      <div className="border-b border-gray-200 py-1.5 flex justify-center shrink-0">
        <button
          onClick={onToggleExpand}
          disabled={isLoading}
          className="w-17.5 h-6.5 rounded-sm bg-[#EEEBF4] shadow-xl dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar scroll-smooth max-h-[60vh] relative">
        {scheduleData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {isLoading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Loading schedules...</p>
              </>
            ) : (
              <NoData
                message="No Records Found"
                description="No production schedules found for this date. Click 'Create New Schedule Entry' to add one."
              />
            )}
          </div>
        ) : (
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              {/* Project Code Row - Always Visible */}
              <tr className="bg-white dark:bg-gray-800">
                <th className="border-b border-r border-gray-200 dark:border-gray-700 px-3 py-2.5 text-left font-normal text-xs whitespace-nowrap sticky left-0 top-0 bg-white dark:bg-gray-800 z-30 min-w-10">
                  Project<br />Code
                </th>
                {scheduleData.map((row) => {
                  const isEditing = editingRows[row.id];
                  const isNewRow = row.isNewRow || String(row.id).startsWith('new-');
                  
                  return (
                    <th
                      key={row.id}
                      className={`border-b border-r border-gray-200 dark:border-gray-700 px-2 py-2.5 text-center font-normal text-xs whitespace-nowrap sticky top-0 z-20 min-w-25 ${
                        isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      {editingProject === row.id && isNewRow ? (
                        <select
                          value={row.projectCode || ''}
                          onChange={(e) => handleProjectChange(row.id, e.target.value)}
                          onBlur={() => setEditingProject(null)}
                          autoFocus
                          className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded bg-white dark:bg-gray-800"
                          disabled={isLoading}
                        >
                          <option value="">Select</option>
                          {projectsList?.map((project) => (
                            <option key={project.id} value={project.code}>
                              {project.code}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div 
                          onClick={() => isNewRow && !isLoading && onProjectClick && onProjectClick(row.id)}
                          className={`max-w-20 truncate mx-auto ${isNewRow && !isLoading ? 'cursor-pointer text-blue-600' : ''}`}
                        >
                          {row.projectCode || (isNewRow ? 'Select Project' : 'Unknown')}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>

              {/* Expanded Rows */}
              {isExpanded && (
                <>
                  <tr className="bg-white dark:bg-gray-800">
                    <th className="border-b border-r border-gray-200 dark:border-gray-700 px-3 py-2.5 text-left font-normal text-xs whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-30" style={{ top: "34px" }}>
                      Project Name
                    </th>
                    {scheduleData.map((row) => (
                      <td key={row.id} className="border-b border-r border-gray-200 dark:border-gray-700 px-2 py-2.5 text-center text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap sticky bg-white dark:bg-gray-800 z-20" style={{ top: "34px" }}>
                        <div className="max-w-25 truncate mx-auto">{row.projectName}</div>
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-white dark:bg-gray-800">
                    <th className="border-b border-r border-gray-200 dark:border-gray-700 px-3 py-2.5 text-left font-normal text-xs whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-30" style={{ top: "68px" }}>
                      Purpose Name
                    </th>
                    {scheduleData.map((row) => (
                      <td key={row.id} className="border-b border-r border-gray-200 dark:border-gray-700 px-2 py-2.5 text-center text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap sticky bg-white dark:bg-gray-800 z-20" style={{ top: "68px" }}>
                        <div className="max-w-25 truncate mx-auto">{row.purposeName}</div>
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-white dark:bg-gray-800">
                    <th className="border-b border-r border-gray-200 dark:border-gray-700 px-3 py-2.5 text-left font-normal text-xs whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-30" style={{ top: "102px" }}>
                      Recipe Name
                    </th>
                    {scheduleData.map((row) => (
                      <td key={row.id} className="border-b border-r border-gray-200 dark:border-gray-700 px-2 py-2.5 text-center text-xs whitespace-nowrap sticky bg-white dark:bg-gray-800 z-20" style={{ top: "102px" }}>
                        {row.recipeName ? (
                          <button
                            type="button"
                            onClick={() => handleRecipeClick(row)}
                            className="text-primary hover:underline font-semibold cursor-pointer truncate max-w-25 mx-auto block"
                          >
                            {row.recipeName}
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-white dark:bg-gray-800">
                    <th className="border-b border-r border-gray-200 dark:border-gray-700 px-3 py-2.5 text-left font-normal text-xs whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-30" style={{ top: "136px" }}>
                      Recipe Code
                    </th>
                    {scheduleData.map((row) => {
                      const isEditing = editingRows[row.id] || row.isNewRow;
                      const currentRecipeCode = pendingChanges[row.id]?.recipeCode !== undefined ? pendingChanges[row.id].recipeCode : row.recipeCode;

                      return (
                        <td key={row.id} className="border-b border-r border-gray-200 dark:border-gray-700 px-2 py-2.5 text-center text-xs whitespace-nowrap sticky bg-white dark:bg-gray-800 z-20" style={{ top: "136px" }}>
                          {isEditing ? (
                            <RecipeSelect
                              projectId={row.projectId}
                              projectCode={row.projectCode}
                              selectedRecipeCode={currentRecipeCode}
                              allRecipes={allRecipes}
                              onChange={(code, id) => handleRowRecipeChange(row.id, code, id)}
                              disabled={isLoading}
                            />
                          ) : row.recipeCode ? (
                            <button
                              type="button"
                              onClick={() => handleRecipeClick(row)}
                              className="text-primary hover:underline font-semibold cursor-pointer truncate max-w-25 mx-auto block"
                            >
                              {row.recipeCode}
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {canCreateSchedule && (
                    <tr className="bg-white dark:bg-gray-800">
                      <th className="border-b border-r border-gray-200 dark:border-gray-700 px-3 py-2.5 text-left font-normal text-xs whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-30" style={{ top: "170px" }}>
                        Responsible Person
                      </th>
                      {scheduleData.map((row) => {
                        const isEditing = editingRows[row.id] || row.isNewRow;
                        const currentResp = pendingChanges[row.id]?.responsiblePersons !== undefined ? pendingChanges[row.id].responsiblePersons : row.responsiblePersons;

                        return (
                          <td key={row.id} className="border-b border-r border-gray-200 dark:border-gray-700 px-2 py-2.5 text-center text-xs whitespace-nowrap sticky bg-white dark:bg-gray-800 z-20 overflow-visible" style={{ top: "170px" }}>
                            {isEditing ? (
                              <ResponsiblePersonMultiSelect
                                selectedUsers={currentResp}
                                allUsers={allUsers}
                                onChange={(userIds) => handleRowResponsiblePersonsChange(row.id, userIds)}
                                disabled={isLoading}
                              />
                            ) : Array.isArray(row.responsiblePersons) && row.responsiblePersons.length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-center max-w-25 mx-auto">
                                {row.responsiblePersons.map((user) => (
                                  <span
                                    key={user._id || user.id || user}
                                    className="bg-primary/10 text-primary text-[9px] px-1 py-0.2 rounded truncate max-w-20"
                                  >
                                    {user.name || user.email}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-[10px]">Unassigned</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </>
              )}
            </thead>

            <tbody>
              {/* Time Slots as Rows */}
              {timeSlots.map((time) => (
                <tr key={time} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="border-b border-r border-gray-200 dark:border-gray-700 px-3 py-2 sticky left-0 bg-white dark:bg-gray-900 z-10">
                    <div className="text-xs font-normal text-gray-900 dark:text-white">{time}</div>
                  </td>
                  {scheduleData.map((row) => {
                    const isEditing = editingRows[row.id];
                    const isNewRow = row.isNewRow || String(row.id).startsWith('new-');
                    const hasProject = row.projectCode && row.projectCode !== '';
                    const cellValue = isNewRow ? (row.schedule[time] || "") : getCellValue(row, time);
                    const isDisabled = isLoading || (isNewRow ? !hasProject : !isEditing);

                    return (
                      <td
                        key={row.id}
                        className={`border-b border-r border-gray-200 dark:border-gray-700 text-center ${getBgColor(cellValue)} ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <CustomSelect
                          value={cellValue}
                          options={activityOptions}
                          onChange={(newValue) => isEditing && !isNewRow ? handleCellChange(row.id, time, newValue) : onActivityChange(row.id, time, newValue)}
                          disabled={isDisabled}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action Row */}
              <tr className="bg-white dark:bg-gray-800">
                <td className="border-b border-r border-gray-200 dark:border-gray-700 px-3 py-2.5 sticky left-0 bg-white dark:bg-gray-900 z-10">
                  <div className="text-xs font-normal text-gray-900 dark:text-white">Action</div>
                </td>
                {scheduleData.map((row) => {
                  const isEditing = editingRows[row.id] || row.isNewRow;
                  const isNewRow = row.isNewRow || String(row.id).startsWith('new-');
                  const changes = pendingChanges[row.id];
                  const hasChanges = isNewRow ? (row.projectCode && row.projectCode !== '') : (changes && Object.keys(changes).length > 0);
                  const isRowArchived = isArchived || row.isActive === false;

                  return (
                    <td key={row.id} className="border-b border-r border-gray-200 dark:border-gray-700 text-center">
                      <div className="flex items-center justify-center">
                        {isEditing ? (
                          <div className="border border-gray-200 rounded-[30px] flex items-center">
                            <button
                              onClick={() => handleSaveRow(row)}
                              disabled={!hasChanges || isLoading}
                              className={`px-3 py-1 flex items-center justify-center rounded-l-[30px] transition-colors ${
                                hasChanges ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                              title="Save Changes"
                            >
                              <Check className="action-button-icon" />
                            </button>
                            <button
                              onClick={() => isNewRow ? onDeleteRow(row.id) : handleCancelEdit(row.id)}
                              disabled={isLoading}
                              className="px-3 py-1 flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 rounded-r-[30px] transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X className="action-button-icon" />
                            </button>
                          </div>
                        ) : isRowArchived ? (
                          <button
                            onClick={() => handleRestoreClick(row)}
                            disabled={isLoading}
                            className={`action-button flex items-center justify-center gap-1.5 rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                            title="Restore Row"
                          >
                            <AiFillThunderbolt className="action-button-icon w-4 h-4" />
                          </button>
                        ) : (
                          <div className="border border-gray-200 rounded-[30px] flex items-center">
                            <button
                              onClick={() => toggleEditMode(row)}
                              disabled={isLoading || isNewRow}
                              className={`px-3 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-3 py-1 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 rounded-l-[30px] transition-colors ${
                                isLoading || isNewRow ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                              title="Edit Schedule"
                            >
                              <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(row)}
                              disabled={isLoading}
                              className={`px-3 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-3 py-1 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 rounded-r-[30px] transition-colors ${
                                isLoading ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                              title="Archive Row"
                            >
                              <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        )}

        {/* Create New Schedule Entry Button (Gated for privileged users) */}
        {canCreateSchedule && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
            <button
              onClick={onAddRow}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="text-sm font-medium">Create New Schedule Entry</span>
            </button>
          </div>
        )}
      </div>

      <DeleteEntryModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        item={selectedItem}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
      <RestoreScheduleModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        item={selectedItem}
        onConfirm={handleRestoreConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}
