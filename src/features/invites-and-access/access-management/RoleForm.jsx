import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaPencilAlt, FaPlus, FaTimes, FaPlay } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/common/page-header";
import { useDebounce } from "@/hooks/useDebounce";
import { ThemeToggle } from "@/components/ThemeToggle";
import GrantIcon from "@/assets/components/grant.svg?react";
import RevokeIcon from "@/assets/components/revoke.svg?react";

const EMPTY_ARRAY = [];

const RoleForm = ({
  initialRoleName = "",
  initialScope = "",
  initialSelectedPermissions = EMPTY_ARRAY,
  availablePermissions: initialAvailablePermissions = EMPTY_ARRAY,
  onSubmit,
  title,
  submitButtonText = "Create Role",
  isEditMode = false,
  onAvailableSearchChange,
  isSubmitting = false,
  defaultScope = "application",
}) => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState(initialRoleName);
  const [scope, setScope] = useState(initialScope || defaultScope);
  const [availableSearch, setAvailableSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  const debouncedAvailableSearch = useDebounce(availableSearch, 300);

  // Notify parent of search change
  useEffect(() => {
    if (onAvailableSearchChange) {
      onAvailableSearchChange(debouncedAvailableSearch);
    }
  }, [debouncedAvailableSearch, onAvailableSearchChange]);

  const [availablePermissions, setAvailablePermissions] = useState(
    initialAvailablePermissions
  );
  const [selectedPermissions, setSelectedPermissions] = useState(
    initialSelectedPermissions
  );

  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedSelectedIds, setSelectedSelectedIds] = useState([]);

  // Sync with props
  useEffect(() => {
    setRoleName(initialRoleName);
  }, [initialRoleName]);

  useEffect(() => {
    setScope(initialScope || defaultScope);
  }, [initialScope, defaultScope]);

  useEffect(() => {
    setSelectedPermissions(initialSelectedPermissions);
  }, [initialSelectedPermissions]);

  useEffect(() => {
    // When available permissions come from parent (maybe filtered by server search),
    // we still want to exclude already selected ones from the UI list.
    // AND we need to consider if we want to purely rely on props.
    // If we rely on props, we should just set state.
    // But we also have local moving logic.

    // Strategy:
    // 1. When initialAvailablePermissions changes (from server fetch), update state.
    // 2. Filter out selectedPermissions from it.
    const selectedIds = selectedPermissions.map((p) => p.id);
    setAvailablePermissions(
      initialAvailablePermissions.filter((p) => !selectedIds.includes(p.id))
    );
  }, [initialAvailablePermissions, selectedPermissions]);

  // Filtered lists
  // If onAvailableSearchChange is provided, we assume parent handles filtering (server-side),
  // so we don't filter again unless we want to double filter (e.g. while waiting for debounce).
  // But to keep it simple, if onAvailableSearchChange is provided, we display availablePermissions as is (minus selected).
  // Otherwise (client-side mode), we filter by availableSearch.
  const filteredAvailable = onAvailableSearchChange
    ? availablePermissions
    : availablePermissions.filter((p) =>
        p.name.toLowerCase().includes(availableSearch.toLowerCase())
      );

  const filteredSelected = selectedPermissions.filter((p) =>
    p.name.toLowerCase().includes(selectedSearch.toLowerCase())
  );

  // Handlers for selection
  const toggleAvailableSelection = (id) => {
    setSelectedAvailableIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectedSelection = (id) => {
    setSelectedSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Move Down / Right (Add to selected)
  const handleAddPermissions = () => {
    const itemsToMove = availablePermissions.filter((p) =>
      selectedAvailableIds.includes(p.id)
    );
    setSelectedPermissions((prev) => [...prev, ...itemsToMove]);
    // We don't need to manually remove from availablePermissions state
    // because the useEffect([initialAvailablePermissions, selectedPermissions]) will run
    // and filter them out based on the new selectedPermissions.
    // BUT, that useEffect depends on initialAvailablePermissions.
    // If we move item locally, we should update local state for immediate feedback.

    // However, since we have the useEffect filtering availablePermissions based on selectedPermissions,
    // updating selectedPermissions is enough to trigger the removal from available list
    // (because availablePermissions state is derived in the effect).

    // Wait, the effect runs when selectedPermissions changes.
    // It re-filters initialAvailablePermissions.
    // This is correct.

    setSelectedAvailableIds([]);
  };

  // Move Up / Left (Remove from selected)
  const handleRemovePermissions = () => {
    const itemsToMove = selectedPermissions.filter((p) =>
      selectedSelectedIds.includes(p.id)
    );
    // When removing from selected, they should logically go back to available.
    // The useEffect will handle re-adding them to availablePermissions
    // because they will no longer be in selectedPermissions.
    // However, this assumes initialAvailablePermissions contains them.
    // If we did a server search and the item is not in the current search results (initialAvailablePermissions),
    // it won't appear in available list even if removed from selected.
    // This is acceptable behavior for search results.

    setSelectedPermissions((prev) =>
      prev.filter((p) => !selectedSelectedIds.includes(p.id))
    );
    setSelectedSelectedIds([]);
  };

  const handleSubmit = () => {
    onSubmit({ roleName, scope, selectedPermissions });
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="flex flex-col h-full -m-5 lg:hidden">
        {/* Top Section - White Background */}
        <div className="px-5 pb-4 mt-5 bg-background">
          <PageHeader title={title} className="py-4 pb-6 md:p-0 md:m-0" />

          {/* Role Name Input */}
          <div className="relative p-0.5 border rounded-full border-table-stroke">
            <input
              type="text"
              placeholder="Enter a job role"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full p-2 text-sm border-none rounded-full pl-14 bg-primary-shade-2 text-base-color placeholder:text-lighter-text placeholder:text-sm focus:outline-none focus:ring-0"
            />
            {/* Pencil Icon */}
            <span className="absolute -translate-y-1/2 left-6 top-1/2 text-lighter-text">
              <FaPencilAlt className="w-3 h-3" />
            </span>
          </div>

          {/* Platform / Scope Input (Mobile) */}
          <div className="relative mt-3 p-0.5 border rounded-full border-table-stroke bg-primary-shade-2">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full p-2 text-sm border-none rounded-full pl-6 bg-transparent text-base-color focus:outline-none focus:ring-0 appearance-none font-medium"
            >
              <option value="application">Lab (Application)</option>
              <option value="crm">CRM</option>
              <option value="global">Global</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-lighter-text">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Bottom Section - Purple Background */}
        <div className="flex flex-col flex-1 gap-4 px-5 pt-5 pb-24 bg-[#552e8e]">
          <div className="text-lg font-semibold text-center text-white">
            Manage Permissions
          </div>

          {/* Available Permissions */}
          <div className="flex flex-col h-48 overflow-hidden bg-background rounded-xl">
            <div className="p-2 text-xs font-medium text-center text-base-color">
              Available Permissions
            </div>
            <div className="">
              <SearchInput
                placeholder="Search"
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                className="h-8 rounded-none bg-primary-shade-2 border-y border-nav-highlight border-x-0 text-base-color placeholder:text-lighter-text"
                iconClassName="text-base-color"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredAvailable.map((p) => (
                <div
                  key={p.id}
                  onClick={() => toggleAvailableSelection(p.id)}
                  className={`p-1 border-b border-table-stroke text-xs text-center cursor-pointer transition-colors ${
                    selectedAvailableIds.includes(p.id)
                      ? "bg-primary/10 text-nav-highlight font-medium"
                      : "text-lighter-text hover:bg-gray-50"
                  }`}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleRemovePermissions}
              disabled={selectedSelectedIds.length === 0}
              className="flex items-center justify-center gap-2 w-28 py-2 rounded-full shadow-sm bg-background text-primary dark:text-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RevokeIcon className="w-3 h-3" /> Revoke
            </Button>
            <Button
              onClick={handleAddPermissions}
              disabled={selectedAvailableIds.length === 0}
              className="flex items-center justify-center gap-2 w-28 py-2 rounded-full shadow-sm bg-background text-primary dark:text-white hover:bg-gray-50 disabled:opacity-50"
            >
              <GrantIcon className="w-3 h-3" /> Grant
            </Button>
          </div>

          {/* Selected Permissions */}
          <div className="flex flex-col h-48 overflow-hidden bg-background rounded-xl">
            <div className="p-2 text-xs font-medium text-center text-base-color">
              Selected Permissions
            </div>
            <div className="">
              <SearchInput
                placeholder="Search"
                value={selectedSearch}
                onChange={(e) => setSelectedSearch(e.target.value)}
                className="h-8 rounded-none bg-primary-shade-2 border-y border-nav-highlight border-x-0 text-base-color placeholder:text-lighter-text"
                iconClassName="text-base-color"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredSelected.map((p) => (
                <div
                  key={p.id}
                  onClick={() => toggleSelectedSelection(p.id)}
                  className={`p-1 border-b border-table-stroke text-xs text-center cursor-pointer transition-colors ${
                    selectedSelectedIds.includes(p.id)
                      ? "bg-primary/10 text-nav-highlight font-medium"
                      : "text-lighter-text hover:bg-gray-50"
                  }`}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 w-[80%] mx-auto">
            <Button
              intent="outline"
              onClick={() => navigate(-1)}
              className="flex-1 text-white bg-transparent border-white rounded-full hover:bg-white/10"
            >
              <FaTimes className="w-3 h-3 mr-1" /> Cancel
            </Button>
            <Button
              intent="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-white rounded-full text-primary hover:bg-gray-100 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <FaPencilAlt className="w-3 h-3 mr-1" />
                  ) : (
                    <FaPlus className="w-3 h-3 mr-1" />
                  )}
                  {submitButtonText}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex-col hidden h-full px-5 lg:flex">
        <div className="flex items-center justify-between mb-3 lg:mb-4 xl:mb-5 2xl:mb-5 3xl:mb-6">
          <PageHeader title={title} className="text-heading md:p-0 md:m-0" />
          <ThemeToggle />
        </div>

        <div className="flex flex-col flex-1 overflow-hidden bg-primary rounded-[20px] shadow-xl">
          {/* White Header Bar */}
          <div className="px-6 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 mx-6 lg:mx-3 xl:mx-4 2xl:mx-5 3xl:mx-6 mt-6 lg:mt-3 xl:mt-4 2xl:mt-5 3xl:mt-6 text-center bg-background rounded-lg shadow-sm">
            <span className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-base-color flex items-center justify-center">
              Select Permissions
            </span>
          </div>

          {/* Dual List Container */}
          <div className="flex flex-1 gap-6 lg:gap-3 xl:gap-3.5 2xl:gap-4.5 3xl:gap-6 px-6 py-6 overflow-hidden">
            {/* Left List: Available */}
            <div className="flex flex-col flex-1 overflow-hidden bg-background rounded-xl">
              <div className="p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5 3xl:p-3 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium border-b text-base-color bg-primary-shade-2/30">
                Available Permissions
              </div>
              <div className="border-b border-table-stroke">
                <SearchInput
                  placeholder="Search"
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  className="h-10 border-none rounded-none bg-primary-shade-2/30 focus:ring-0"
                  iconClassName="text-lighter-text"
                />
              </div>
              <div className="flex-1 p-0.5 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 overflow-y-auto custom-scrollbar mr-1 lg:mr-0.5 xl:mr-0.5 2xl:mr-[3px] 3xl:mr-1">
                {filteredAvailable.length === 0 ? (
                  <div className="mt-4 text-xs text-center text-lighter-text">
                    No permissions available
                  </div>
                ) : (
                  filteredAvailable.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => toggleAvailableSelection(p.id)}
                      className={`p-3 lg:p-1 xl:p-1.5 2xl:p-2.5 3xl:p-3 mb-0.5 lg:mb-[1px] xl:mb-2px 2xl:mb-[2.5px] 3xl:mb-1 rounded-lg text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm cursor-pointer transition-all border ${
                        selectedAvailableIds.includes(p.id)
                          ? "bg-primary/10 border-primary text-base-color font-medium"
                          : "border-transparent  text-base-color"
                      }`}
                    >
                      {p.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Transfer Buttons */}
            <div className="flex flex-col justify-center gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3.5 3xl:gap-4">
              <Button
                onClick={handleAddPermissions}
                disabled={selectedAvailableIds.length === 0}
                className="flex items-center justify-center w-12 lg:w-6.5 xl:w-8.5 2xl:w-9.5 3xl:w-12 h-12 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 bg-primary-shade-2 rounded-lg lg:rounded-xs xl:rounded-xs 2xl:rounded-sm 3xl:rounded-lg text-primary hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Add Selected"
              >
                <FaPlay className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
              </Button>
              <Button
                onClick={handleRemovePermissions}
                disabled={selectedSelectedIds.length === 0}
                className="flex items-center justify-center w-12 lg:w-6.5 xl:w-8.5 2xl:w-9.5 3xl:w-12 h-12 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 bg-primary-shade-2 rounded-lg lg:rounded-xs xl:rounded-xs 2xl:rounded-sm 3xl:rounded-lg text-primary hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Remove Selected"
              >
                <FaPlay className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 rotate-180" />
              </Button>
            </div>

            {/* Right List: Selected */}
            <div className="flex flex-col flex-1 overflow-hidden bg-background rounded-xl">
              <div className="p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5 3xl:p-3 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium border-b text-base-color bg-primary-shade-2/30">
                Selected Permissions
              </div>
              <div className="border-b border-table-stroke">
                <SearchInput
                  placeholder="Search"
                  value={selectedSearch}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  className="h-10 border-none rounded-none bg-primary-shade-2/30 focus:ring-0"
                  iconClassName="text-lighter-text"
                />
              </div>
              <div className="flex-1 p-0.5 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 overflow-y-auto custom-scrollbar mr-1 lg:mr-0.5 xl:mr-0.5 2xl:mr-[3px] 3xl:mr-1">
                {filteredSelected.length === 0 ? (
                  <div className="mt-4 text-xs text-center text-lighter-text">
                    No permissions selected
                  </div>
                ) : (
                  filteredSelected.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => toggleSelectedSelection(p.id)}
                      className={`p-3 lg:p-1 xl:p-1.5 2xl:p-2.5 3xl:p-3 mb-0.5 lg:mb-[1px] xl:mb-2px 2xl:mb-[2.5px] 3xl:mb-1 rounded-lg text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm cursor-pointer transition-all border ${
                        selectedSelectedIds.includes(p.id)
                          ? "bg-primary/10 border-primary text-base-color font-medium"
                          : "border-transparent  text-base-color"
                      }`}
                    >
                      {p.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#4a287c] rounded-b-[20px] mt-auto">
            {/* Role Name Input */}
            <div className="relative flex items-center w-1/4 min-w-[200px]">
              <div className="absolute -translate-y-1/2 left-4 lg:left-3 xl:left-3 2xl:left-3 3xl:left-4 top-1/2 text-lighter-text">
                <svg className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
              </div>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name"
                className="w-full py-2.5 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 pl-10 lg:pl-6.5 xl:pl-7 2xl:pl-8 3xl:pl-10 pr-4 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm bg-primary-shade-2 text-base-color border border-white/20 rounded-full focus:bg-white/10 focus:text-white transition-colors placeholder:text-lighter-text placeholder:text-sm placeholder:lg:text-[8px] placeholder:xl:text-[10px] placeholder:2xl:text-xs placeholder:3xl:text-sm focus:outline-none focus:ring-0"
              />
            </div>

            {/* Platform / Scope Select (Desktop) */}
            <div className="relative flex items-center w-1/4 min-w-[200px] ml-4">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full py-2.5 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 px-4 pr-10 text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm bg-primary-shade-2 text-base-color border border-white/20 rounded-full focus:bg-white/10 focus:text-white transition-colors focus:outline-none focus:ring-0 appearance-none font-medium"
              >
                <option value="application" className="bg-[#4a287c] text-white">Lab (Application)</option>
                <option value="crm" className="bg-[#4a287c] text-white">CRM</option>
                <option value="global" className="bg-[#4a287c] text-white">Global</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
              <Button
                intent="ghost"
                onClick={() => navigate(-1)}
                className="px-6 text-white border rounded-full hover:bg-white/10 border-white/30"
              >
                <FaTimes className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" /> Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 bg-white text-primary rounded-full hover:bg-gray-100 flex items-center gap-2 font-medium disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaPlus className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5" /> {submitButtonText}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleForm;


