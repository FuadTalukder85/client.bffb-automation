import React, { useState } from "react";
import PageHeader from "@/components/common/page-header";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useCleaningStatus,
  useAddItemToCleaningMonth,
  useRemoveItemFromCleaningMonth,
  useUpsertCleaningStatusEntry,
  useUpdateMonthItem,
} from "@/hooks/useCleaning";
import DesktopCleaningStatusTable from "./components/DesktopCleaningStatusTable";
import { months, years } from "./constants/cleaningStatusOptions";
import { ChevronDown, Plus } from "lucide-react";
import { AddCleaningStatusItemModal } from "./components/AddCleaningStatusItemModal";
import { EditCleaningStatusEntryModal } from "./components/EditCleaningStatusEntryModal";
import { ViewCleaningStatusEntryModal } from "./components/ViewCleaningStatusEntryModal";
import { EditMonthItemModal } from "./components/EditMonthItemModal";
import { IoMdArrowDropdown } from "react-icons/io";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { ArchiveCleaningStatusItemModal } from "./components/Modals/ArchiveCleaningStatusItemModal";
import { RestoreCleaningStatusItemModal } from "./components/Modals/RestoreCleaningStatusItemModal";
import { cleaningStatusStateOptions } from "./constants/cleaningStatusOptions";
import { useArchiveCleanlinessItem, useRestoreCleaningStatusMonthItem } from "@/hooks/useCleaning";

export default function CleaningStatusPage() {
  const isMobile = useIsMobile();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sorting, setSorting] = useState([]);

  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [isEditMonthItemModalOpen, setIsEditMonthItemModalOpen] = useState(false);
  const [editingMonthItem, setEditingMonthItem] = useState(null);

  const [selectedState, setSelectedState] = useState("active");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const {
    data: statusResponse,
    isLoading,
    error,
  } = useCleaningStatus({
    year: selectedYear,
    month: selectedMonth,
    page: currentPage,
    limit: itemsPerPage,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? "desc" : "asc",
    isActive: selectedState === "all" ? "all" : selectedState === "active" ? "true" : "false",
  });

  const cleaningStatusData = statusResponse?.data || [];
  const pagination = statusResponse?.pagination || { totalPages: 1 };
  const meta = statusResponse?.meta || { year: selectedYear, month: selectedMonth };

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load cleaning status";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const addItemMutation = useAddItemToCleaningMonth();
  const removeItemMutation = useRemoveItemFromCleaningMonth();
  const upsertEntryMutation = useUpsertCleaningStatusEntry();
  const updateMonthItemMutation = useUpdateMonthItem();
  const archiveItemMutation = useArchiveCleanlinessItem();
  const restoreItemMutation = useRestoreCleaningStatusMonthItem();

  const handleStateChange = (value) => {
    setSelectedState(value);
    setCurrentPage(1);
  };

  const handleAddItem = () => {
    setIsAddingNewRow(true);
  };

  const handleAddedItem = () => {
    setIsAddingNewRow(false);
    setCurrentPage(1);
  };

  const [editableDay, setEditableDay] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);

  const handleToggleEditableDay = (day) => {
    setEditableDay((prev) => (prev === day ? null : day));
  };

  const handleCellClick = (item, day, entry) => {
    if (editableDay === day) {
      setEditingEntry({
        itemId: item.itemId,
        itemName: item.itemName,
        monthItemId: item.monthItemId,
        day,
        ...entry,
      });
      setIsEditEntryModalOpen(true);
    } else {
      setViewEntry({
        itemName: item.itemName,
        day,
        entry,
      });
    }
  };

  const handleSaveEntry = async ({ status, comment }) => {
    if (!editingEntry) return;

    await upsertEntryMutation.mutateAsync({
      year: selectedYear,
      month: selectedMonth,
      day: editingEntry.day,
      cleaningItemId: editingEntry.itemId,
      status,
      comment,
    });
  };

  const closeViewEntryModal = () => {
    setViewEntry(null);
  };

  const handleRemoveItem = (item) => {
    setSelectedItem(item);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async (monthItemId) => {
    await removeItemMutation.mutateAsync(monthItemId);
    setIsArchiveModalOpen(false);
  };

  const handleRestoreItem = (item) => {
    setSelectedItem(item);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = async (monthItemId) => {
    await restoreItemMutation.mutateAsync(monthItemId);
    setIsRestoreModalOpen(false);
  };

  const [editingMonthItemId, setEditingMonthItemId] = useState(null);

  const handleEditMonthItem = (item) => {
    setEditingMonthItemId(item.monthItemId);
  };

  const handleCancelEditMonthItem = () => {
    setEditingMonthItemId(null);
  };

  const handleUpdateMonthItem = async (newItemId) => {
    if (!editingMonthItemId) return;

    await updateMonthItemMutation.mutateAsync({
      monthItemId: editingMonthItemId,
      cleaningItemId: newItemId,
    });

    setEditingMonthItemId(null);
    setCurrentPage(1);
  };

  const closeEditMonthItemModal = () => {
    setEditingMonthItemId(null);
  };

  const handleConfirmAddRow = async (itemId) => {
    await addItemMutation.mutateAsync({
      year: selectedYear,
      month: selectedMonth,
      cleaningItemId: itemId,
    });
    handleAddedItem();
  };

  const handleCancelAddRow = () => {
    setIsAddingNewRow(false);
  };
  return (
    <section className="flex flex-col flex-1 w-full h-full min-h-0 container-spacing overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 md:mb-2 md:flex-row md:items-center md:justify-between pr-2 border-b border-table-stroke border-none">
        <PageHeader
          title="Cleaning Status"
          className="py-4 text-heading md:p-0 md:m-0"
        />
        <div className="flex items-center gap-3 hidden md:block">
          <ThemeToggle />
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between gap-6 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 mb-4">
       <div className="flex items-center gap-4 lg:gap-3 xl:gap-3.5 2xl:gap-4 3xl:gap-4 border border-[#EEEBF4] dark:border-primary max-w-[317px] py-1 lg:py-0.5 xl:py-0.5 2xl:py-[3px] 3xl:py-1 px-2 rounded-md mx-auto md:mx-0">
         <div className="flex items-center gap-2">
          <span className="text-[15px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[15px] font-medium text-[#A0A0A1]">Year :</span>
          <div className="relative group flex items-center justify-center">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-[#EEEBF4] dark:bg-[#2D213D] text-nav-highlight dark:text-nav-highlight font-semibold text-sm lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[15px] px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-0.5 xl:py-0.5 2xl:py-[3px] 3xl:py-1 pr-10 lg:pr-5.5 xl:pr-6.5 2xl:pr-8 3xl:pr-10 rounded-md border-none focus:ring-1 focus:ring-nav-highlight/20 cursor-pointer transition-all"
            >
              {years.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
            <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-nav-highlight pointer-events-none group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[15px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[15px] font-medium text-[#A0A0A1]">Month :</span>
          <div className="relative group flex items-center justify-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none bg-[#EEEBF4] dark:bg-[#2D213D] text-nav-highlight dark:text-nav-highlight font-semibold text-sm lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[15px] px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1 lg:py-0.5 xl:py-0.5 2xl:py-[3px] 3xl:py-1 pr-10 lg:pr-5.5 xl:pr-6.5 2xl:pr-8 3xl:pr-10 rounded-md border-none focus:ring-1 focus:ring-nav-highlight/20 cursor-pointer transition-all"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 text-nav-highlight pointer-events-none group-hover:scale-110 transition-transform" />
          </div>
        </div>
       </div>
        {/* Desktop Filter Pills */}
        <div className="flex-none md:block mx-auto md:mx-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-start gap-4">
              <DesktopFilterPills
                value={selectedState}
                options={cleaningStatusStateOptions}
                onChange={handleStateChange}
              />
            </div>
        </div>
        </div>
      </div>
      {/* Table/List Section */}
      <div className="flex flex-col flex-1 w-full min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500 italic">Updating status...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col flex-1 min-h-0">
              <DesktopCleaningStatusTable
                data={cleaningStatusData}
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                sorting={sorting}
                onSortingChange={setSorting}
                year={selectedYear}
                month={selectedMonth}
                editableDay={editableDay}
                onToggleEditableDay={handleToggleEditableDay}
                onCellClick={handleCellClick}
                onEditMonthItem={handleEditMonthItem}
                onRemoveItem={handleRemoveItem}
                isAddingNewRow={isAddingNewRow}
                onConfirmAddRow={handleConfirmAddRow}
                onCancelAddRow={handleCancelAddRow}
                editingMonthItemId={editingMonthItemId}
                onCancelEditMonthItem={handleCancelEditMonthItem}
                onUpdateMonthItem={handleUpdateMonthItem}
                selectedState={selectedState}
                onRestoreItem={handleRestoreItem}
                emptyState={
                  hasError ? (
                    <div className="py-10 text-center text-red-500">
                      {errorMessage}
                    </div>
                  ) : null
                }
              />
              <div className="mt-3 lg:mt-3.5 xl:mt-4.5 2xl:mt-5 3xl:mt-6">
                <Button
                  onClick={handleAddItem}
                  disabled={isAddingNewRow || editingMonthItemId}
                  className="bg-[#4C2194] hover:bg-[#4C2194]/90 text-white flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 px-6 lg:px-2 xl:px-3 2xl:px-4 3xl:px-6 py-2.5 rounded-lg shadow-lg shadow-purple-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="action-button-icon" />
                  <span className="font-semibold text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
                    Create New Entry
                  </span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Removed AddCleaningStatusItemModal as per user request */}
      {/* Removed EditMonthItemModal as per user request */}

      <EditCleaningStatusEntryModal
        open={isEditEntryModalOpen}
        onOpenChange={setIsEditEntryModalOpen}
        year={selectedYear}
        month={selectedMonth}
        day={editingEntry?.day}
        itemName={editingEntry?.itemName}
        existingEntry={editingEntry || {}}
        onSave={handleSaveEntry}
      />

      <ViewCleaningStatusEntryModal
        open={Boolean(viewEntry)}
        onOpenChange={closeViewEntryModal}
        year={selectedYear}
        month={selectedMonth}
        day={viewEntry?.day}
        itemName={viewEntry?.itemName}
        entry={viewEntry?.entry}
      />

      <ArchiveCleaningStatusItemModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        item={selectedItem}
        onConfirm={handleArchiveConfirm}
      />

      <RestoreCleaningStatusItemModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        item={selectedItem}
        onConfirm={handleRestoreConfirm}
      />
    </section>
  );
}
