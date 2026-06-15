import React from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  X,
  Download,
  Send,
  Save,
  Upload,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";
import { ArchiveMemberModal } from "@/features/team-management/team-formation/single-team-formation/components/ArchiveMemberModal";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { cn } from "@/lib/utils";
import { AiFillThunderbolt } from "react-icons/ai";
import UploadAttachmentModal from "./UploadAttachmentModal";
import { RestoreTestRecordModal } from "./RestoreTestRecordModal";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";

const stateOptions = [
  { label: "Active", value: "active" },
  { label: "Archive", value: "archive" },
];



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
        "flex items-center gap-2 px-3 py-1 bg-[#F0EBF8] dark:bg-[#2A2435] rounded-[6px] transition-all focus-within:ring-1 focus-within:ring-primary/20 border-none min-w-0 h-8",
        className,
      )}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[12px] font-medium text-primary dark:text-white placeholder:text-primary/40 p-0"
        {...props}
      />
      <div className="w-[1.5px] h-4 bg-primary/20 dark:bg-white/20 rounded-full shrink-0" />
    </div>
  );
};

// ─── Reusable field (matches MobileSensoryTopSheetDetailPage style) ──────────
const MobileFieldInput = ({ label, value, editable, type = "text", onChange }) => (
  <div>
    <label className="block text-[14px] font-semibold text-[#1A1A1A] dark:text-white mb-2">
      {label}
    </label>
    <div className="flex items-center rounded-md bg-white dark:bg-transparent border border-[#7C5CC4] dark:border-white/10 overflow-hidden">
      {editable ? (
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          className="w-full p-2 bg-transparent text-[14px] text-[#4A4A4A] dark:text-white outline-none"
        />
      ) : (
        <div className="p-2 w-full flex items-center">
          <span className="text-[14px] text-[#4A4A4A] dark:text-white">{value || "—"}</span>
        </div>
      )}
      {editable && <Pencil size={14} className="mr-2 shrink-0 text-primary" />}
    </div>
  </div>
);

// ─── Status Scale (matches attached screenshot) ─────────────────────────────

export default function MobileShelfLifeTestRecordView({
  record,
  mockRecord,
  handleBack,
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

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState("description");
  const [editingEntry, setEditingEntry] = React.useState(null);
  const [editingData, setEditingData] = React.useState(null);
  const [entryToRestore, setEntryToRestore] = React.useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = React.useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [entryToArchive, setEntryToArchive] = React.useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedEntryForUpload, setSelectedEntryForUpload] = React.useState(null);

  const startEdit = (entry) => {
    if (editingEntry && editingEntry.toString().startsWith("temp-")) {
      setMockRecord((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== editingEntry),
      }));
    }
    setEditingEntry(entry.id);
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

  const handleConditionChange = (idx, field, value) => {
    setEditingData((prev) => {
      const newConds = prev.conditions.map((c, i) =>
        i === idx ? { ...c, [field]: value } : c,
      );
      return { ...prev, conditions: newConds };
    });
  };

  const saveEdit = async () => {
    if (!editingData) return;

    const isNewEntry = editingEntry && editingEntry.toString().startsWith("temp-");

    if (isNewEntry) {
      if (!editingData.checkingDate) {
        toast.error("Please select a date first.");
        return;
      }
    }

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

  const openRestoreModal = (entry) => {
    setEntryToRestore(entry);
    setRestoreModalOpen(true);
  };

  const openArchiveModal = (entry) => {
    setEntryToArchive(entry);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (entryToArchive && onArchiveEntry) {
      onArchiveEntry(entryToArchive.id);
    }
    setArchiveModalOpen(false);
    setEntryToArchive(null);
  };

  return (
    <div className="flex flex-col gap-2 text-[#0D111A] dark:text-white">
      {/* ── Header (matches MobileSensoryTopSheetDetailPage) ──────────────── */}
      <div className="flex items-center gap-2">
        <BackButton
          onClick={handleBack}
          className="w-8 h-8 rounded-none bg-transparent text-[#7C5CC4] dark:text-primary hover:bg-transparent border-none shadow-none shrink-0 p-0"
        />
        {!isSearchOpen ? (
          <>
            <h1 className="text-[20px] font-bold text-[#1A1A1A] dark:text-white leading-tight truncate">
              {record.projectName || "Cake Promo V1"}
            </h1>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="ml-auto flex items-center justify-center size-9 rounded-lg bg-[#EEEBF4] dark:bg-primary/20 text-primary hover:bg-[#E0DAF0] transition-colors"
            >
              <Search size={18} />
            </button>
            <button onClick={handleDownload} disabled={isLoading} className="flex items-center justify-center size-9 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 disabled:opacity-50">
              <Download size={18} />
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-2 pr-1">
            <SearchInput
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <button 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchTerm("");
              }}
              className="size-8 flex items-center justify-center text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ── Badge ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="px-2 rounded-full border border-primary bg-white dark:bg-primary/10 dark:border-primary/50">
          <span className="text-[12px] font-bold text-[#7C5CC4] dark:text-primary">
            {record.projectCode || "BC-BA-CB-0000"}
          </span>
        </div>
      </div>

      {/* ── Tab switcher ───────────────────── */}
      <div className="flex bg-white dark:bg-[#07020D] rounded-md border border-[#EEEBF4] dark:border-white/20">
        <button
          onClick={() => setActiveTab("description")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-l-md transition-all",
            activeTab === "description"
              ? "bg-[#EEEBF4] dark:bg-primary/20 text-[#1A1A1A] dark:text-foreground shadow-sm"
              : "text-[#4A4A4A]/50 dark:text-gray-400 bg-transparent"
          )}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("test-record")}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-r-md transition-all",
            activeTab === "test-record"
              ? "bg-[#EEEBF4] dark:bg-primary/20 text-[#1A1A1A] dark:text-foreground shadow-sm"
              : "text-[#4A4A4A]/50 dark:text-gray-400 bg-transparent"
          )}
        >
          Test Record
        </button>
      </div>

      {/* ── Content card ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#07020D] rounded-md dark:border-primary/50 p-3 shadow-sm">
        {activeTab === "description" && (
          /* ── Description tab ──────────────────────────────────────────── */
          <div className="flex flex-col gap-2">
            <MobileFieldInput label="Recipe Code" value={mockRecord.recipeCode} />
            <MobileFieldInput label="Application Recipe Name" value={mockRecord.recipeName} />
            <MobileFieldInput label="Person Responsible" value={mockRecord.personResponsible} />
            <MobileFieldInput label="Production Date" value={mockRecord.productionDate} />
            <MobileFieldInput 
              label="Test Period Start Date" 
              value={mockRecord.startDate} 
              editable={!isSubmitted} 
              type="date"
              onChange={(e) => setMockRecord({ ...mockRecord, startDate: e.target.value })}
            />
            <MobileFieldInput 
              label="Test Period End Date" 
              value={mockRecord.endDate} 
              editable={!isSubmitted} 
              type="date"
              onChange={(e) => setMockRecord({ ...mockRecord, endDate: e.target.value })}
            />
          </div>
        )}
        
        {activeTab === "test-record" && (
          /* ── Test Record tab ─────────────────────────────────────────── */
          <div className="flex flex-col gap-4">

            {/* Active / Archive filter */}
            <div className="flex items-center justify-center mb-1 mt-2">
              <DesktopFilterPills
                value={statusFilter}
                options={stateOptions}
                onChange={setStatusFilter}
              />
            </div>

            {/* Scrollable horizontal table */}
            <div className="overflow-x-auto -mx-3 px-3 custom-scrollbar">
              <table className="w-full border-collapse table-fixed" style={{ minWidth: 1510 }}>
                <thead>
                  <tr className="border-b border-[#F3F4F6] dark:border-primary/50">
                    <th className="w-[70px] py-4 px-2 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-center border-r border-[#F3F4F6] dark:border-primary/50">SL</th>
                    <th className="w-[140px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-center border-r border-[#F3F4F6] dark:border-primary/50">Date</th>
                    <th className="w-[200px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">Storage Condition</th>
                    <th className="w-[150px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">Organoleptic</th>
                    <th className="w-[150px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">Appearance</th>
                    <th className="w-[200px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">Physical Property</th>
                    <th className="w-[200px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-left border-r border-[#F3F4F6] dark:border-primary/50">Moisture | Water Activity</th>
                    <th className="w-[140px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-center border-r border-[#F3F4F6] dark:border-primary/50">Microbiological Test</th>
                    <th className="w-[140px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-center border-r border-[#F3F4F6] dark:border-primary/50">Comments</th>
                    <th className="w-[120px] py-4 px-3 text-[12px] font-bold text-gray-500 dark:text-white uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecord.entries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-xs text-[#4A4A4A]/50 dark:text-white/40 italic">
                        No test records yet.
                      </td>
                    </tr>
                  ) : (
                    mockRecord.entries.map((entry, idx) => (
                      <React.Fragment key={entry.id || idx}>
                        {entry.conditions.map((cond, condIdx) => (
                          <tr key={`${entry.id || idx}-${cond.name}`} className="border border-[#F3F4F6] dark:border-white/10 last:border-0">
                            {condIdx === 0 && (
                              <>
                                <td rowSpan={entry.conditions.length} className="py-3 px-2 text-[12px] font-medium text-primary dark:text-white text-center border-r border-[#F3F4F6] dark:border-primary/50 align-middle">
                                  <div className="flex items-center justify-center size-8 bg-primary/10 dark:bg-transparent rounded-full mx-auto font-black">
                                    <span className="text-primary dark:text-nav-highlight">
                                      {idx + 1}
                                    </span>
                                  </div>
                                </td>
                                <td rowSpan={entry.conditions.length} className="py-3 px-3 text-[12px] font-medium text-[#0D111A] dark:text-white border-r border-[#F3F4F6] dark:border-primary/50 text-center align-middle">
                                  {editingEntry === entry.id ? (
                                    <div className="w-full [&_svg.lucide-calendar]:hidden [&_span]:text-center! border border-[#EEEBF4] dark:border-primary/50 rounded-md overflow-hidden bg-[#F3F0FA] dark:bg-primary/5">
                                      <DatePicker
                                        value={editingData?.checkingDate}
                                        placeholder="Select Date"
                                        onChange={(e) =>
                                          setEditingData({
                                            ...editingData,
                                            checkingDate: e.target.value,
                                          })
                                        }
                                        className="text-[12px] font-medium text-[#0D111A] py-2 px-3 text-center"
                                        transparent={true}
                                        position="bottom"
                                      />
                                      </div>
                                    ) : (
                                      <div className="flex justify-center items-center h-8">
                                        {entry.checkingDate}
                                      </div>
                                    )}
                                  </td>
                              </>
                            )}
                            <td className="py-3 px-3 text-[12px] font-medium text-[#0D111A] dark:text-white border-r border-[#F3F4F6] dark:border-primary/50">
                              <div className="flex items-center h-8">
                                <span className="truncate block" title={cond.name || ""}>
                                  {cond.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-[12px] font-medium text-[#4A4A4A] dark:text-white border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={editingData?.conditions[condIdx].organoleptic || ""}
                                  onChange={(val) => handleConditionChange(condIdx, "organoleptic", val)}
                                />
                              ) : (
                                <div className="flex items-center h-8">
                                  <span className="truncate block" title={cond.organoleptic || ""}>
                                    {cond.organoleptic || "—"}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[12px] font-medium text-[#4A4A4A] dark:text-white border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={editingData?.conditions[condIdx].appearance || ""}
                                  onChange={(val) => handleConditionChange(condIdx, "appearance", val)}
                                />
                              ) : (
                                <div className="flex items-center h-8">
                                  <span className="truncate block" title={cond.appearance || ""}>
                                    {cond.appearance || "—"}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[12px] font-medium text-[#4A4A4A] dark:text-white border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={editingData?.conditions[condIdx].physical || ""}
                                  onChange={(val) => handleConditionChange(condIdx, "physical", val)}
                                />
                              ) : (
                                <div className="flex items-center h-8">
                                  <span className="truncate block" title={cond.physical || ""}>
                                    {cond.physical || "—"}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[12px] font-medium text-[#4A4A4A] dark:text-white border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={editingData?.conditions[condIdx].moisture || ""}
                                  onChange={(val) => handleConditionChange(condIdx, "moisture", val)}
                                />
                              ) : (
                                <div className="flex items-center h-8">
                                  <span className="truncate block" title={cond.moisture || ""}>
                                    {cond.moisture || "—"}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[12px] font-medium text-[#4A4A4A] dark:text-white border-r border-[#F3F4F6] dark:border-primary/50">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={editingData?.conditions[condIdx].microbiologicalTest || ""}
                                  onChange={(val) => handleConditionChange(condIdx, "microbiologicalTest", val)}
                                />
                              ) : (
                                <div className="flex justify-center items-center h-8">
                                  <span className="truncate block" title={cond.microbiologicalTest || ""}>
                                    {cond.microbiologicalTest || "—"}
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-3 text-[12px] font-medium text-[#4A4A4A] dark:text-white border-r border-[#F3F4F6] dark:border-primary/50 text-center">
                              {editingEntry === entry.id ? (
                                <StyledTableInput
                                  value={editingData?.conditions[condIdx].comment || ""}
                                  onChange={(val) => handleConditionChange(condIdx, "comment", val)}
                                  className="mx-auto"
                                />
                              ) : (
                                <div className="flex justify-center items-center h-8">
                                  <span className="truncate block" title={cond.comment || ""}>
                                    {cond.comment || "—"}
                                  </span>
                                </div>
                              )}
                            </td>
                            {condIdx === 0 && (
                              <td rowSpan={entry.conditions.length} className="py-3 px-3 text-[12px] font-medium text-center">
                                <div className="flex gap-2 justify-center items-center mt-1">
                                  {editingEntry === entry.id ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={saveEdit}
                                        className="p-1.5 text-primary bg-[#EBE7F5] dark:bg-[#322A44] hover:bg-[#E0DAF0] rounded-full transition-colors shadow-sm"
                                        title="Save"
                                      >
                                        <Save size={15} />
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        className="p-1.5 text-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                                        title="Cancel"
                                      >
                                        <X size={15} />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      {canManage && !isSubmitted && statusFilter === "active" && (
                                        <div className="border border-gray-100 dark:border-primary/30 rounded-[30px] flex items-center overflow-hidden bg-white dark:bg-gray-900">
                                          <button
                                            onClick={() => handleOpenUploadModal(entry)}
                                            className="px-2 py-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-100 dark:border-primary/50 cursor-pointer"
                                            title="Upload"
                                          >
                                            <Upload size={14} className="text-primary" />
                                          </button>
                                          <button
                                            onClick={() => startEdit(entry)}
                                            className="px-2 py-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-100 dark:border-primary/50"
                                            title="Edit"
                                          >
                                            <Pencil size={14} className="text-primary" />
                                          </button>
                                          <button
                                            onClick={() => openArchiveModal(entry)}
                                            className="px-2 py-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            title="Archive"
                                          >
                                            <svg className="w-3.5 h-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                                          </button>
                                        </div>
                                      )}
                                      {canManage && !isSubmitted && statusFilter === "archive" && (
                                        <div className="border border-primary-shade-2 rounded-[30px] flex items-center overflow-hidden bg-primary-shade-2">
                                          <button
                                            onClick={() => openRestoreModal(entry)}
                                            className="px-2 py-1 flex items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer text-nav-highlight"
                                            title="Restore"
                                          >
                                            <AiFillThunderbolt className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* New entry button */}
            {!isSubmitted && canManage && onAddEntry && (
              <Button
                onClick={handleAddNewEntryClick}
                disabled={isLoading}
                className="w-fit h-10 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              >
                <Plus size={16} className="mr-1.5" />
                New Entry
              </Button>
            )}

            {/* Comment Section */}
            <div className="mt-8 space-y-2">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                  Comment
                </h4>
              </div>
              <div className="w-full p-4 rounded-xl border border-primary/20 bg-white dark:bg-primary/10 shadow-sm">
                {isSubmitted ? (
                  <p className="text-[13px] font-semibold text-[#4B5563] dark:text-white leading-7">
                    {mockRecord.comment}
                  </p>
                ) : (
                  <textarea
                    className="w-full min-h-[100px] text-[13px] font-semibold text-[#4B5563] dark:text-white dark:placeholder:text-white/40 leading-7 bg-transparent focus:outline-none resize-y"
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

            {/* Actions */}
            {!isSubmitted && canManage && (
              <div className="flex flex-col gap-3 mt-8 pb-4">
                <Button
                  onClick={onSaveDraft}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 rounded-full border border-primary bg-transparent text-primary font-bold hover:bg-primary hover:text-white cursor-pointer transition-all shadow-sm"
                >
                  <Save className="w-5 h-5 mr-2" /> Save Draft
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="w-full h-12 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 shadow-xl shadow-primary/30 transition-all hover:bg-transparent hover:text-primary border border-primary cursor-pointer"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Done
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

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

      <ArchiveMemberModal
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        onConfirm={handleConfirmArchive}
        title="Archive Entry"
        message={<>Are you sure you want to archive this entry?</>}
        subMessage="Current task progress will remain unchanged. Proceed with proper authorization."
      />
    </div>
  );
}
