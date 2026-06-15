import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Edit2 } from "lucide-react";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { Pagination } from "@/components/ui/Pagination";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalFooter 
} from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select/Select";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { cn } from "@/lib/utils";
import { NoData } from "@/components/ui/NoData";

export default function SingleMaintenanceScheduleMobileView({
  paginatedRows,
  currentPage,
  totalPages,
  onPageChange,
  serialOffset,
  STATUS_OPTIONS,
  handleUpdate,
  noDataMessage,
  noDataDescription,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tempComment, setTempComment] = useState("");
  const [tempStatus, setTempStatus] = useState("");

  const handleOpenEditModal = (row) => {
    setSelectedRow(row);
    setTempComment(row.comment || "");
    setTempStatus(row.status || "Pending");
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (selectedRow) {
      const updates = [];
      if (tempComment !== selectedRow.comment) {
        updates.push(handleUpdate(selectedRow, "comment", tempComment));
      }
      if (tempStatus !== selectedRow.status) {
        updates.push(handleUpdate(selectedRow, "status", tempStatus));
      }
      
      await Promise.all(updates);
      setIsEditModalOpen(false);
    }
  };

  // Helper to get status styling
  const getStatusStyle = (status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || "text-muted-foreground bg-slate-100";
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-16 touch-pan-y pt-1">
        {paginatedRows.length === 0 ? (
          <NoData
            message={noDataMessage}
            description={noDataDescription}
          />
        ) : (
          paginatedRows.map((row, idx) => (
            <ExpandableCard
              key={row.id}
              className="p-3 my-4 rounded-xl bg-background border border-[#F6F4F9] dark:border-border"
            >
              <ExpandableCard.Content initialHeight={140}>
                {/* Header Section matching Master Project style */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary-shade-2 text-nav-highlight">
                    <span className="text-sm font-semibold">
                      {serialOffset + idx + 1}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col min-w-0">
                    <h3 className="text-sm font-semibold text-lighter-text line-clamp-1 uppercase tracking-tight">
                      {format(row.date, "dd MMM yyyy")}
                    </h3>
                    <span className="text-[12px] font-medium text-[#A1A1A5] capitalize">
                      {format(row.date, "eeee")}
                    </span>
                  </div>

                  <div className="flex-1 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(row)}
                      className="p-2 hover:bg-primary/5 text-primary bg-primary-shade-2 rounded-lg transition-colors border border-primary/10"
                      title="Edit Entry"
                    >
                       <svg className="action-button-icon"  xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                </div>

                {/* Details Section using InfoTable */}
                <InfoTable>
                  <InfoTable.Row label="Maintenance Status">
                    <div className="flex justify-end items-center">
                       <span className={cn(
                         "px-3 py-1 text-[11px] font-bold rounded-full inline-block min-w-[80px] text-center",
                         getStatusStyle(row.status)
                       )}>
                        {row.status}
                      </span>
                    </div>
                  </InfoTable.Row>

                  <InfoTable.Row label="Official Remark">
                    <div className="flex flex-col gap-2 w-full mt-1">
                        <div className="text-[13px] italic text-slate-500 font-medium py-1">
                           {row.comment || "—"}
                        </div>
                    </div>
                  </InfoTable.Row>
                </InfoTable>
              </ExpandableCard.Content>
            </ExpandableCard>
          ))
        )}

        {/* Pagination following MasterProjects pattern */}
        {totalPages > 0 && (
          <div className="flex justify-center w-full mt-4 mb-7 lg:mb-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      {/* Edit Entry Modal for Mobile */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="w-[calc(100%-2rem)] max-w-md p-6 rounded-[2rem] border-0 shadow-2xl">
          <ModalHeader className="mb-4">
            <ModalTitle className="text-[18px] font-bold text-center text-slate-800 dark:text-slate-100">
              Edit Maintenance Record
            </ModalTitle>
          </ModalHeader>

          <div className="space-y-6">
            {/* Status Selection using Prebuild Select */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Maintenance Status
              </span>
              <div className="h-11">
                <Select
                  value={tempStatus}
                  options={STATUS_OPTIONS}
                  onChange={(e) => setTempStatus(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
            </div>

            {/* Remark Detail using Prebuild Textarea */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Official Remark
              </span>
              <Textarea
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}
                className="min-h-[140px] rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/40 focus-visible:ring-2 focus-visible:ring-primary/20 outline-none shadow-inner"
                placeholder="Type the maintenance remark here..."
              />
            </div>
          </div>

          <ModalFooter className="flex flex-row gap-3 mt-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 h-10 rounded-lg border border-border text-[14px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-10 rounded-lg bg-primary text-white text-[14px] font-bold hover:bg-primary-shade-1 shadow-lg shadow-primary/20 transition-all"
            >
              Save Entry
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
