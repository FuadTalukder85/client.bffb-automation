import React from "react";
import { toast } from "sonner";
import {
  Download,
  Pencil,
  Plus,
  Send,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  MessageSquareText,
  Upload,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EditableField } from "@/components/editable-field";
import { AiFillThunderbolt } from "react-icons/ai";
import { EditableFieldGroup } from "@/components/editable-field-group";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { Button } from "@/components/ui/Button";
import { ArchiveMemberModal } from "@/features/team-management/team-formation/single-team-formation/components/ArchiveMemberModal";
import { RestoreTestRecordModal } from "./RestoreTestRecordModal";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import UploadAttachmentModal from "./UploadAttachmentModal";
import DesktopShelfLifeTestRecordSkeleton from "./DesktopShelfLifeTestRecordSkeleton";
import { DATE_FORMATS, formatDate } from "@/utils";

const ScoreBadge = ({ score }) => {
  let bgColor = "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300"; // 0
  if (score >= 1 && score < 2) bgColor = "bg-[#AAFFB3] text-[#006209] dark:bg-[#006209]/20 dark:text-[#AAFFB3]"; // 1
  if (score >= 2 && score < 3) bgColor = "bg-[#D4DEFF] text-[#0039FF] dark:bg-[#0039FF]/20 dark:text-[#D4DEFF]"; // 2
  if (score >= 3 && score < 4) bgColor = "bg-[#FEEDBB] text-[#896700] dark:bg-[#896700]/20 dark:text-[#FEEDBB]"; // 3
  if (score >= 4 && score < 5) bgColor = "bg-[#FFD7C9] text-[#E33A00] dark:bg-[#E33A00]/20 dark:text-[#FFD7C9]"; // 4
  if (score >= 5) bgColor = "bg-[#FFD2E5] text-[#D6005A] dark:bg-[#D6005A]/20 dark:text-[#FFD2E5]"; // 5

  return (
    <span
      className={cn(
        "px-4 py-1.5 rounded-full text-xs font-bold min-w-15 inline-block text-center",
        bgColor,
      )}
    >
      {score}
    </span>
  );
};


const StyledTableInput = ({
  value,
  onChange,
  type = "text",
  className,
  ...props
}) => {
  const isNumber = type === "number";

  return (
    <div
      className={cn(
        "flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 px-3 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-3 py-1 bg-[#F0EBF8] dark:bg-[#2A2435] rounded-[6px] transition-all focus-within:ring-1 focus-within:ring-primary/20 border-none min-w-0 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8",
        className,
      )}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (isNumber) {
            let val = e.target.value.replace(/[^0-9]/g, "");
            if (val !== "") {
              const num = parseInt(val);
              val = Math.min(5, Math.max(0, num)).toString();
            }
            onChange(val);
          } else {
            onChange(e.target.value);
          }
        }}
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-medium text-primary dark:text-white placeholder:text-primary/40 p-0"
        {...props}
      />
      <div className="w-[1.5px] h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 bg-primary/20 dark:bg-white/20 rounded-full shrink-0" />
      {isNumber && (
        <div className="flex flex-col justify-center -space-y-1.5 shrink-0 ml-1">
          <button
            type="button"
            onClick={() => {
              const val = parseInt(value) || 0;
              onChange(Math.min(5, val + 1).toString());
            }}
            className="p-0 text-primary/40 hover:text-primary transition-colors cursor-pointer"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              const val = parseInt(value) || 0;
              onChange(Math.max(0, val - 1).toString());
            }}
            className="p-0 text-primary/40 hover:text-primary transition-colors cursor-pointer"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const stateOptions = [
  { label: "Active", value: "active" },
  { label: "Archive", value: "archive" },
];

export default function DesktopShelfLifeTestRecordView({
  record,
  mockRecord,
  handleDownload,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  onAddEntry,
  onArchiveEntry,
  onRestoreEntry,
  onUpdateEntry,
  onSaveDraft,
  onSubmit,
  setMockRecord,
  isSubmitted,
  isLoading,
  canManage,
  sampleId,
}) {
  const [editingEntry, setEditingEntry] = React.useState(null);
  const [editingData, setEditingData] = React.useState(null);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [entryToArchive, setEntryToArchive] = React.useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedEntryForUpload, setSelectedEntryForUpload] = React.useState(null);

  const liveSelectedEntryForUpload = React.useMemo(() => {
    if (!selectedEntryForUpload) return null;
    return (
      mockRecord.entries.find((entry) => entry.id === selectedEntryForUpload.id) ||
      selectedEntryForUpload
    );
  }, [selectedEntryForUpload, mockRecord.entries]);

  const handleOpenUploadModal = (entry) => {
    setSelectedEntryForUpload(entry);
    setIsUploadModalOpen(true);
  };

  const startEdit = (entry) => {
    if (editingEntry && editingEntry.toString().startsWith("temp-")) {
      setMockRecord((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== editingEntry),
      }));
    }
    setEditingEntry(entry.id);
    // convert displayed DD/MM/YYYY (en-GB) back to YYYY-MM-DD for input
    let dateIso = "";
    if (entry.checkingDate) {
      const parts = entry.checkingDate.split("/");
      if (parts.length === 3) {
        dateIso = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      } else {
        dateIso = new Date(entry.checkingDate).toISOString().slice(0, 10);
      }
    }
    setEditingData({
      id: entry.id,
      checkingDate: dateIso,
      conditions: entry.conditions.map((c) => ({
        ...c,
        microbiologicalTest: c.microbiologicalTest || "",
        comment: c.comment || "",
      })),
    });
  };

  const cancelEdit = () => {
    if (editingEntry && editingEntry.toString().startsWith("temp-")) {
      setMockRecord((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== editingEntry),
      }));
    }
    setEditingEntry(null);
    setEditingData(null);
  };

  const saveEdit = async () => {
    console.debug("saveEdit invoked", {
      editingEntry,
      editingData,
      canManage,
      onUpdateEntry,
    });
    if (!editingData) return;

    const isNewEntry = editingEntry && editingEntry.toString().startsWith("temp-");

    if (isNewEntry) {
      if (!editingData.checkingDate) {
        toast.error("Please select a date first.");
        return;
      }
    }

    // convert editingData.conditions -> storageConditions
    const payload = {
      id: editingData.id,
      checkingDate: editingData.checkingDate,
      storageConditions: editingData.conditions.map((c) => ({
        condition: c.name,
        organoleptic: c.organoleptic,
        appearance: c.appearance,
        physicalProperty: c.physical,
        moistureWaterActivity: c.moisture,
        microbiologicalTest: c.microbiologicalTest,
        comment: c.comment || "",
        score: Math.min(5, Math.max(0, Math.round(Number(c.score) || 0))),
      })),
    };
    console.debug("desktop saveEdit payload", payload);

    let success = true;
    if (isNewEntry) {
      if (onAddEntry) {
        success = await onAddEntry(payload);
      }
    } else {
      if (onUpdateEntry) {
        success = await onUpdateEntry(payload);
      }
    }

    if (success !== false) {
      const realId = isNewEntry && typeof success === "string" ? success : editingData.id;
      setMockRecord((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => {
          if (e.id === editingData.id) {
            return {
              ...e,
              id: realId,
              checkingDate: editingData.checkingDate,
              conditions: editingData.conditions.map((c) => ({
                ...c,
                name: c.name,
                organoleptic: c.organoleptic,
                appearance: c.appearance,
                physical: c.physical,
                moisture: c.moisture,
                microbiologicalTest: c.microbiologicalTest,
                comment: c.comment,
              })),
            };
          }
          return e;
        }),
      }));
      setEditingEntry(null);
      setEditingData(null);
    }
  };

  const handleAddNewEntryClick = () => {
    if (editingEntry && editingEntry.toString().startsWith("temp-")) {
      setMockRecord((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== editingEntry),
      }));
    }
    const newTempId = "temp-" + Date.now();
    const newEntry = {
      id: newTempId,
      isActive: true,
      sl: mockRecord.entries.length + 1,
      checkingDate: "",
      attachments: [],
      conditions: [
        { name: "Sunlight", organoleptic: "", appearance: "", physical: "", moisture: "", microbiologicalTest: "", comment: "", score: 0 },
        { name: "AC", organoleptic: "", appearance: "", physical: "", moisture: "", microbiologicalTest: "", comment: "", score: 0 },
        { name: "Ambient Temperature", organoleptic: "", appearance: "", physical: "", moisture: "", microbiologicalTest: "", comment: "", score: 0 },
      ]
    };
    
    setMockRecord(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry]
    }));
    
    setEditingEntry(newTempId);
    setEditingData({
      id: newTempId,
      checkingDate: "",
      conditions: newEntry.conditions.map((c) => ({
        ...c,
        microbiologicalTest: "",
        comment: "",
      })),
    });
  };

  const handleConditionChange = (idx, field, value) => {
    setEditingData((prev) => {
      const newConds = prev.conditions.map((c, i) =>
        i === idx ? { ...c, [field]: value } : c,
      );
      return { ...prev, conditions: newConds };
    });
  };


  const openArchiveModal = (entry) => {
    setEntryToArchive(entry);
    setArchiveModalOpen(true);
  };

  const [restoreModalOpen, setRestoreModalOpen] = React.useState(false);
  const [entryToRestore, setEntryToRestore] = React.useState(null);

  const openRestoreModal = (entry) => {
    setEntryToRestore(entry);
    setRestoreModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (entryToArchive && onArchiveEntry) {
      onArchiveEntry(entryToArchive.id);
    }
    setArchiveModalOpen(false);
    setEntryToArchive(null);
  };

  if (isLoading) {
    return <DesktopShelfLifeTestRecordSkeleton />;
  }
  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      {/* Premium Header */}
      <div className="flex items-center justify-between pb-4 flex-none ms-0 lg:ms-5">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton className="" />
          <div className="flex flex-col">
            <h1 className="text-[24px] lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[24px] font-bold text-foreground dark:text-white leading-tight">
              {record.projectName || "N/A"}
            </h1>
            <div className="flex items-center gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 mt-1 mt-[1px] xl:mt-[2px] 2xl:mt-[3px] 3xl:mt-1">
          <span className="px-3 lg:px-1.5 xl:px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 2xl:px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2.5 3xl:px-3 py-0.5 lg:py-[1px] xl:py-[1px] 2xl:py-0.5 3xl:py-0.5 rounded-full border border-border text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[8.5px] 3xl:text-[11px] font-semibold text-primary bg-primary/5">
            {record.projectCode || "N/A"}
          </span>
        </div>
          </div>
        </div>{" "}
        <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
          <SearchInput
            placeholder="Search samples..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ThemeToggle />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mb-4 lg:mb-2 xl:mb-2.5 2xl:mb-3 3xl:mb-4 ms-5">
        <div>
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2.5 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5 px-6 lg:px-1.5 xl:px-3 2xl:px-4 3xl:px-6 py-2.5 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-2.5 rounded-full bg-primary text-white font-bold text-[13px] lg:text-[8.5px] xl:text-[9.5px] 2xl:text-[10.5px] 3xl:text-[13px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Download className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />
            Download
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 w-full bg-white dark:bg-[#07020D] border border-[#F3F4F6] dark:border-primary/50 rounded-xl lg:rounded-2xl xl:rounded-3xl 2xl:rounded-4xl overflow-auto max-h-[calc(100vh-6rem)] custom-scrollbar">
        <div className="w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-5">
            {/* Description Section */}
            <div className="relative">
              <div className="text-center mb-5 lg:mb-2.5 xl:mb-3.5 2xl:mb-4 3xl:mb-5">
                <h3 className="3xl:text-[18px] 2xl:text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] xl:text-[13px] lg:text-[10px] text-[18px] font-semibold text-[#0D111A]">
                  Description
                </h3>
              </div>

              <EditableFieldGroup gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-4.5 xl:gap-x-5.5 2xl:gap-x-6.5 3xl:gap-x-8 gap-y-4 lg:gap-y-2 xl:gap-y-2.5 2xl:gap-y-3.5 3xl:gap-y-4">
                <EditableField
                  id="recipeCode"
                  label="Recipe Code"
                  value={mockRecord.recipeCode}
                  canEdit={false}
                  inputClassName="bg-[#F9FAFB] border-[#E5E7EB] rounded-xl px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3"
                />
                <EditableField
                  id="recipeName"
                  label="Application Recipe Name"
                  value={mockRecord.recipeName}
                  canEdit={false}
                  inputClassName="bg-[#F9FAFB] border-[#E5E7EB] rounded-xl px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3"
                />
                <EditableField
                  id="personResponsible"
                  label="Person Responsible"
                  value={mockRecord.personResponsible}
                  canEdit={false}
                  inputClassName="bg-[#F9FAFB] border-[#E5E7EB] rounded-xl px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3"
                />
                <EditableField
                  id="productionDate"
                  label="Production Date"
                  value={mockRecord.productionDate}
                  type="date"
                  canEdit={false}
                  inputClassName="bg-[#F9FAFB] border-[#E5E7EB] rounded-xl px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3"
                />
                <div className="relative group">
                  <EditableField
                    id="startDate"
                    label="Test Period Start Date"
                    value={mockRecord.startDate}
                    type="date"
                    canEdit={!isSubmitted}
                    inputClassName="bg-[#F9FAFB] border-[#E5E7EB] rounded-xl px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 focus:border-primary/30"
                    onChange={(e) =>
                      setMockRecord({
                        ...mockRecord,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="relative group">
                  <EditableField
                    id="endDate"
                    label="Test Period End Date"
                    value={mockRecord.endDate}
                    type="date"
                    canEdit={!isSubmitted}
                    inputClassName="bg-[#F9FAFB] border-[#E5E7EB] rounded-xl px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 focus:border-primary/30"
                    onChange={(e) =>
                      setMockRecord({ ...mockRecord, endDate: e.target.value })
                    }
                  />
                </div>
              </EditableFieldGroup>
            </div>

            {/* Test Record Section */}
            <div className="pt-10 lg:pt-5.5 xl:pt-6.5 2xl:pt-8 3xl:pt-10">
              <div className="text-center mb-2">
                <h3 className="3xl:text-[18px] 2xl:text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] xl:text-[13px] lg:text-[10px] text-[18px] font-semibold text-[#0D111A]">
                  Test Record
                </h3>
              </div>

              {/* Status Pill Filter */}
              <div className="flex items-center justify-start mb-8">
                <DesktopFilterPills
                  value={statusFilter}
                  options={stateOptions}
                  onChange={setStatusFilter}
                />
              </div>

              {/* The Grouped Table */}
              <div className="w-full relative z-[50] border border-[#F3F4F6] dark:border-primary/50 rounded-2xl">
                <table className="w-full table-fixed text-left border-collapse">
                  <thead className="bg-white dark:bg-transparent text-black/65 dark:text-white">
                    <tr className="">
                      <th className="w-[70px] lg:w-[37px] xl:w-[49px] 2xl:w-[56px] 3xl:w-[70px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] uppercase tracking-wider text-center border-r border-[#F3F4F6] dark:border-primary/50">
                        SL
                      </th>
                      <th className="w-[140px] lg:w-[75px] xl:w-[96px] 2xl:w-[112px] 3xl:w-[140px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider text-center border-r border-[#F3F4F6] dark:border-primary/50">
                        Checking Date
                      </th>
                      <th className="w-[200px] lg:w-[106px] xl:w-[142px] 2xl:w-[160px] 3xl:w-[200px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider border-r border-[#F3F4F6] dark:border-primary/50">
                        Sample Storage Conditions
                      </th>
                      <th className="w-[150px] lg:w-[80px] xl:w-[106px] 2xl:w-[120px] 3xl:w-[150px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">
                        Organoleptic
                      </th>
                      <th className="w-[150px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">
                        Appearance
                      </th>
                      <th className="w-[200px] lg:w-[106px] xl:w-[142px] 2xl:w-[160px] 3xl:w-[200px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">
                        Physical Property
                      </th>
                      <th className="w-[200px] lg:w-[106px] xl:w-[142px] 2xl:w-[160px] 3xl:w-[200px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">
                        Moisture | Water Activity
                      </th>
                      <th className="w-[140px] lg:w-[75px] xl:w-[96px] 2xl:w-[112px] 3xl:w-[140px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">
                        Microbiological Test
                      </th>
                      <th className="w-[140px] lg:w-[75px] xl:w-[96px] 2xl:w-[112px] 3xl:w-[140px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">
                        Comments
                      </th>
                      <th className="w-[120px] lg:w-[65px] xl:w-[85px] 2xl:w-[96px] 3xl:w-[120px] px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] tracking-wider text-left">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {mockRecord.entries.map((entry, index) => (
                      <React.Fragment key={entry.id}>
                        {entry.conditions.map((cond, condIdx) => (
                          <tr
                            key={`${entry.id}-${cond.name}`}
                            className="group border-t border-[#F3F4F6] dark:border-primary/50"
                          >
                            {condIdx === 0 && (
                              <>
                                <td
                                  rowSpan={entry.conditions.length}
                                  className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 border-r border-[#F3F4F6] dark:border-primary/50 align-middle"
                                >
                                  <div className="flex items-center justify-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                    <div className="flex items-center justify-center p-2 2xl:size-6.5 2xl:p-3 size-5.5 lg:size-5.5 xl:size-7 2xl:size-8 3xl:size-10 3xl:p-4 bg-primary/10 dark:bg-none rounded-full mx-auto">
                                      <span className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-black text-primary dark:text-nav-highlight">
                                        {index+1}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td
                                  rowSpan={entry.conditions.length}
                                  className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 text-center border-r border-[#F3F4F6] dark:border-primary/50 align-middle"
                                >
                                  {editingEntry === entry.id ? (
                                    <div className="w-full [&_svg.lucide-calendar]:hidden [&_span]:text-center! border border-[#EEEBF4] dark:border-primary/50 rounded-md">
                                      <DatePicker
                                        value={editingData.checkingDate}
                                        placeholder="Select Date"
                                        onChange={(e) =>
                                          setEditingData({
                                            ...editingData,
                                            checkingDate: e.target.value,
                                          })
                                        }
                                        className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-semibold text-center text-primary dark:text-white py-0.5"
                                        transparent={true}
                                        position="bottom"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                      <span className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-[#0D111A] dark:text-white font-medium">
                                        {entry.checkingDate ? formatDate(entry.checkingDate, DATE_FORMATS.FULL_SHORT_MONTH) : ""}
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </>
                            )}
                            <td className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-[#0D111A] dark:text-white font-medium border-r border-[#F3F4F6] dark:border-primary/50">
                              <div className="flex items-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                {cond.name}
                              </div>
                            </td>
                            <td className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 text-left text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-[#0D111A] dark:text-white font-medium border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={
                                    editingData.conditions[condIdx].organoleptic
                                  }
                                  onChange={(val) =>
                                    handleConditionChange(
                                      condIdx,
                                      "organoleptic",
                                      val,
                                    )
                                  }
                                />
                              ) : (
                                <div className="flex items-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                  {cond.organoleptic || "—"}
                                </div>
                              )}
                            </td>
                            <td className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 text-left text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-[#0D111A] dark:text-white font-medium border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={
                                    editingData.conditions[condIdx].appearance
                                  }
                                  onChange={(val) =>
                                    handleConditionChange(
                                      condIdx,
                                      "appearance",
                                      val,
                                    )
                                  }
                                />
                              ) : (
                                <div className="flex items-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                  {cond.appearance || "—"}
                                </div>
                              )}
                            </td>
                            <td className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 text-left text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-[#0D111A] dark:text-white font-medium border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={
                                    editingData.conditions[condIdx].physical
                                  }
                                  onChange={(val) =>
                                    handleConditionChange(
                                      condIdx,
                                      "physical",
                                      val,
                                    )
                                  }
                                />
                              ) : (
                                <div className="flex items-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                  {cond.physical || "—"}
                                </div>
                              )}
                            </td>
                            <td className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 text-left text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-[#0D111A] dark:text-white font-medium border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={
                                    editingData.conditions[condIdx].moisture
                                  }
                                  onChange={(val) =>
                                    handleConditionChange(
                                      condIdx,
                                      "moisture",
                                      val,
                                    )
                                  }
                                />
                              ) : (
                                <div className="flex items-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                  {cond.moisture || "—"}
                                </div>
                              )}
                            </td>
                            <td className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 text-left border-r border-[#F3F4F6] dark:border-primary/50 align-middle">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={editingData.conditions[condIdx].microbiologicalTest || ""}
                                  onChange={(val) =>
                                    handleConditionChange(condIdx, "microbiologicalTest", val)
                                  }
                                  className="w-full mx-auto"
                                />
                              ) : (
                                <div className="flex justify-left items-center h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                  <span
                                    className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-[#0D111A] dark:text-white truncate"
                                    title={cond.microbiologicalTest || ""}
                                  >
                                    {cond.microbiologicalTest || "—"}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 text-center border-r border-[#F3F4F6] dark:border-primary/50 align-middle">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={editingData.conditions[condIdx].comment || ""}
                                  onChange={(val) => handleConditionChange(condIdx, "comment", val)}
                                  className="w-full mx-auto"
                                />
                              ) : (
                                <div className="flex justify-left items-center h-8">
                                  <span
                                    className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-[#0D111A] dark:text-white truncate"
                                    title={cond.comment || ""}
                                  >
                                    {cond.comment || "—"}
                                  </span>
                                </div>
                              )}
                            </td>
                            {condIdx === 0 && (
                              <td
                                rowSpan={entry.conditions.length}
                                className="px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2 py-1 align-middle"
                              >
                                <div className="flex items-center justify-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                  {editingEntry === entry.id ? (
                                    <div className="flex items-center justify-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
                                      <button
                                        onClick={saveEdit}
                                        className="p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 text-primary bg-[#EBE7F5] dark:bg-[#322A44] hover:bg-[#E0DAF0] rounded-full transition-colors shadow-sm"
                                        title="Save"
                                      >
                                        <Save className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="p-2 lg:p-1 xl:p-1 2xl:p-1.5 3xl:p-2 text-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                                        title="Cancel"
                                      >
                                        <X className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 h-8 lg:h-4.5 xl:h-5.5 2xl:h-6.5 3xl:h-8">
                                      {canManage &&
                                        !isSubmitted &&
                                        statusFilter === "active" && (
                                          <div className="border border-gray-100 dark:border-primary/50 rounded-[30px] flex items-center overflow-hidden">
                                            <button
                                              onClick={() => handleOpenUploadModal(entry)}
                                              className="lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2.5 3xl:px-3 py-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-100 dark:border-primary/50 cursor-pointer"
                                              title="Upload"
                                            >
                                              <Upload className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5 text-primary" />
                                            </button>
                                            <button
                                              onClick={() => startEdit(entry)}
                                              className="lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2.5 3xl:px-3 py-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-100 dark:border-primary/50"
                                              title="Edit"
                                            >
                                              <Pencil className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5 text-primary" />
                                            </button>
                                            <button
                                              onClick={() => openArchiveModal(entry)}
                                              className="lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2.5 3xl:px-3 py-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                              title="Archive"
                                            >
                                              <svg className="w-4.5 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4.5 h-4.5 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4.5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                                            </button>
                                          </div>
                                        )}
                                      {canManage &&
                                        !isSubmitted &&
                                        statusFilter === "archive" && (
                                          <div className="border border-primary-shade-2 rounded-[30px] flex items-center overflow-hidden bg-primary-shade-2">
                                            <button
                                              onClick={() => openRestoreModal(entry)}
                                              className="px-3 py-1 flex items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer text-nav-highlight"
                                              title="Restore"
                                            >
                                              <AiFillThunderbolt className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {!isSubmitted && onAddEntry && (
                                <div className="mt-8">
                                  <button
                                    onClick={handleAddNewEntryClick}
                                    disabled={isLoading}
                                    className="flex items-center gap-3 px-8 lg:px-4.5 xl:px-5.5 2xl:px-6.5 3xl:px-8 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 rounded-full bg-primary text-white font-semibold text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm  hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                  >
                                    <Plus className="w-5 h-5 lg:h-2 xl:h-3 2xl:h-4 3xl:h-5 lg:w-2 xl:w-3 2xl:w-4 3xl:w-5" />
                                    New Entry
                                  </button>
                                </div>
                              )}

              {/* Comment Section */}
              <div className="mt-16 lg:mt-9 xl:mt-11 2xl:mt-13 3xl:mt-16 space-y-4 lg:space-y-1 xl:space-y-2 2xl:space-y-3 3xl:space-y-4">
                <div className="flex items-center justify-between px-2 lg:px-1 xl:px-1.5 2xl:px-2 3xl:px-2">
                  <h4 className="text-base lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[13px] 3xl:text-base font-semibold text-[#1F2937] dark:text-white">
                    Comment
                  </h4>
                </div>
                <div className="w-full px-8 lg:px-4.5 xl:px-5.5 2xl:px-6.5 3xl:px-8 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 rounded-xl border border-primary/20 bg-white dark:bg-primary/10 shadow-sm ring-1 ring-primary/5">
                  {isSubmitted ? (
                    <p className="text-[13px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[13px] font-semibold text-[#4B5563] leading-7">
                      {mockRecord.comment}
                    </p>
                  ) : (
                    <textarea
                      className="w-full min-h-[100px] lg:min-h-[55px] xl:min-h-[71px] 2xl:min-h-[80px] 3xl:min-h-[100px] text-[13px] lg:text-[7px] xl:text-[9px] 2xl:text-[11px] 3xl:text-[13px] font-semibold text-[#4B5563] dark:text-white dark:placeholder:text-white leading-7 lg:leading-3.5 xl:leading-5 2xl:leading-5.5 3xl:leading-7 bg-transparent focus:outline-none resize-y"
                      value={mockRecord.comment}
                      onChange={(e) =>
                        setMockRecord({
                          ...mockRecord,
                          comment: e.target.value,
                        })
                      }
                      placeholder="Add comments here..."
                    />
                  )}
                </div>
              </div>

              {/* Master Submit Button */}
              {!isSubmitted && canManage && (
                <div className="flex justify-end pt-12 lg:pt-6 xl:pt-8 2xl:pt-9 3xl:pt-12 gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4">
                  <Button
                    onClick={onSaveDraft}
                    disabled={isLoading}
                    variant="outline"
                    className="h-12 lg:h-6 xl:h-8 2xl:h-9 3xl:h-12 px-10 lg:px-6 xl:px-8 2xl:px-9 3xl:px-12 rounded-full border border-primary bg-transparent text-primary font-bold hover:bg-primary hover:text-white cursor-pointer transition-all shadow-sm"
                  >
                    <Save className="w-5 h-5 lg:h-2 xl:h-3 2xl:h-4 3xl:h-5 lg:w-2 xl:w-3 2xl:w-4 3xl:w-5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" /> Save Draft
                  </Button>
                  <Button
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="h-12 lg:h-6 xl:h-8 2xl:h-9 3xl:h-12 px-10 lg:px-6 xl:px-8 2xl:px-9 3xl:px-12 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-xl shadow-primary/30 transition-all hover:bg-transparent hover:text-primary border border-primary cursor-pointer"
                  >
                    <Send className="w-5 h-5 lg:h-2 xl:h-3 2xl:h-4 3xl:h-5 lg:w-2 xl:w-3 2xl:w-4 3xl:w-5 mr-2 lg:mr-0.5 xl:mr-1 2xl:mr-1.5 3xl:mr-2" />
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ArchiveMemberModal
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        onConfirm={handleConfirmArchive}
        title="Archive Entry"
        message={<>Are you sure you want to archive this entry?</>}
        subMessage="Current task progress will remain unchanged. Proceed with proper authorization."
      />
      {restoreModalOpen && (
        <RestoreTestRecordModal
          open={restoreModalOpen}
          onOpenChange={setRestoreModalOpen}
          entry={entryToRestore}
          onConfirm={onRestoreEntry}
          isLoading={isLoading}
        />
      )}

      {liveSelectedEntryForUpload && (
        <UploadAttachmentModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          entryDate={liveSelectedEntryForUpload.checkingDate}
          testRecordId={liveSelectedEntryForUpload.id}
          sampleId={sampleId}
          attachments={liveSelectedEntryForUpload.attachments || []}
          canManage={canManage && !isSubmitted}
        />
      )}
    </div>
  );
}
