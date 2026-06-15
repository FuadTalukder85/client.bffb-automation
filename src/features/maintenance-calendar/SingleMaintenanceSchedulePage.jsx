import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { format, parseISO } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/ThemeToggle";
import { BackButton } from "@/components/ui/BackButton";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Select } from "@/components/ui/Select/Select";
import { Button } from "@/components/ui/Button";
import { PaginatedTable, EditableCell, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { DatePicker } from "@/components/ui/DatePicker/DatePicker";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { 
  useMaintenanceItems, 
  useMaintenanceScheduleOverview, 
  useUpdateMaintenanceOccurrence 
} from "@/hooks/useMaintenance";
import SingleMaintenanceScheduleSkeleton from "./components/SingleMaintenanceScheduleSkeleton";
import SingleMaintenanceScheduleMobileSkeleton from "./components/SingleMaintenanceScheduleMobileSkeleton";
import SingleMaintenanceScheduleDesktopView from "./components/SingleMaintenanceScheduleDesktopView";
import SingleMaintenanceScheduleMobileView from "./components/SingleMaintenanceScheduleMobileView";

const STATUS_OPTIONS = [
  { label: "Pending", value: "Pending", color: "text-muted-foreground bg-[#F3F0FA] dark:bg-slate-800" },
  { label: "Incomplete", value: "Incomplete", color: "text-red-500 bg-red-500/10" },
  { label: "Complete", value: "Complete", color: "text-green-500 bg-green-500/10" },
  { label: "Other", value: "Other", color: "text-amber-500 bg-amber-500/10" },
];

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

function EditableSelectCell({ value: initialValue, options, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const containerRef = useRef(null);

  // Sync state if prop changes from outside
  useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  // Handle click outside to close editing mode
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  const selectedOption = options.find(opt => opt.value === currentValue);

  if (isEditing) {
    return (
      <div ref={containerRef} className="w-full min-w-[120px] lg:min-w-[64px] xl:min-w-[85px] 2xl:min-w-[96px] 3xl:min-w-[120px]">
        <Select
          value={currentValue}
          options={options}
          className="rounded-lg w-full"
          onChange={(e) => {
            const newValue = e.target.value;
            setCurrentValue(newValue);
            onSave(newValue);
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={cn(
        "inline-flex items-center justify-center px-4 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 py-1.5 lg:py-1 xl:py-[3px] 2xl:py-1 3xl:py-1.5 rounded-full text-[12px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[12px] font-bold cursor-pointer transition-all hover:opacity-80 min-w-[100px] lg:min-w-[53px] xl:min-w-[71px] 2xl:min-w-[80px] 3xl:min-w-[100px]",
        selectedOption?.color
      )}
    >
      {selectedOption?.label || initialValue}
    </div>
  );
}

export default function SingleMaintenanceSchedulePage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [currentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data: scheduleData, isLoading: isLoadingSchedule } = useMaintenanceScheduleOverview(currentYear);
  const { data: itemsData, isLoading: isLoadingItems } = useMaintenanceItems({ isActive: "true", limit: 100 });
  const updateMutation = useUpdateMaintenanceOccurrence();

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const maintenanceItem = useMemo(() => {
    return itemsData?.data?.find(i => i._id === itemId);
  }, [itemsData, itemId]);

  const scheduleId = useMemo(() => {
    if (!scheduleData || !itemId) return null;
    const schedules = Array.isArray(scheduleData) ? scheduleData : (scheduleData.data || []);
    return schedules.find(s => s.maintenanceItem?._id === itemId || s.maintenanceItem === itemId)?._id || scheduleData.scheduleId;
  }, [scheduleData, itemId]);

  const scheduleRows = useMemo(() => {
    if (!scheduleData || !itemId) return [];
    const itemScheduleMap = Array.isArray(scheduleData) ? null : scheduleData.itemScheduleMap;
    const rawData = itemScheduleMap ? (itemScheduleMap[itemId] || []) : (Array.isArray(scheduleData) ? scheduleData : []);
    
    return rawData.map((d, index) => ({
      index: index + 1,
      id: d.id || d._id,
      date: typeof d === 'string' ? parseISO(d) : parseISO(d.date),
      status: d.status || "Pending",
      comment: d.comment || "",
      scheduleId: d.scheduleId || scheduleData.itemToScheduleIdMap?.[itemId] || scheduleId
    })).sort((a, b) => a.date - b.date);
  }, [scheduleData, itemId, scheduleId]);

  const filteredRows = useMemo(() => {
    let rows = scheduleRows;
    
    // Filter by date range if set
    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      rows = rows.filter(r => r.date >= start && r.date <= end);
    }

    if (!searchTerm) return rows;
    const lower = searchTerm.toLowerCase();
    return rows.filter(r => 
      r.status.toLowerCase().includes(lower) || 
      r.comment.toLowerCase().includes(lower) ||
      format(r.date, "dd MMMM yyyy").toLowerCase().includes(lower)
    );
  }, [scheduleRows, searchTerm, startDate, endDate]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const serialOffset = (currentPage - 1) * itemsPerPage;

  const handleUpdate = async (row, columnId, value) => {
    const sId = row.scheduleId;
    if (!sId) {
      toast.error("Schedule ID not found.");
      return;
    }

    try {
      const response = await updateMutation.mutateAsync({
        id: sId,
        occurrenceId: row.id,
        payload: {
          [columnId]: value
        }
      });
      toast.success(getResponseMessage(response, "Updated successfully"));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Update failed"
      );
    }
  };

  const columns = [
    {
      id: "serial",
      header: "SL",
      headerClassName: "table-head-cell text-start",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-5.5 p-2 2xl:size-6.5 2xl:p-5 bg-primary/10 rounded-full">
          <span className="text-nav-highlight">{serialOffset + row.index + 1}</span>
        </div>
      ),
      size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
    },
    {
      accessorKey: "date",
      header: "Scheduled Date",
      headerClassName: "table-head-cell",
      cell: ({ getValue }) => (
        <span className="">
          {format(getValue(), "dd MMMM yyyy, eeee")}
        </span>
      ),
      size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
    },
    {
      accessorKey: "status",
      header: "Maintenance Status",
      headerClassName: "table-head-cell text-center",
      cell: ({ getValue, row }) => (
        <div className="flex justify-center">
          <EditableSelectCell 
            value={getValue()} 
            options={STATUS_OPTIONS}
            onSave={(val) => handleUpdate(row.original, "status", val)}
          />
        </div>
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "comment",
      header: "Comment",
      headerClassName: "table-head-cell",
      cell: ({ getValue, row }) => (
        <EditableCell
          value={getValue()}
          onSave={(val) => handleUpdate(row.original, "comment", val)}
          className="italic text-slate-500 font-medium min-h-[32px] flex items-center"
          inputClassName="w-full p-2 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 rounded-lg border outline-none bg-background"
        />
      ),
      size: getResponsiveSize({ lg: 213, xl: 285, '2xl': 320, '3xl': 400 }),
    }
  ];

  if (isLoadingSchedule || isLoadingItems) {
    return isMobile ? <SingleMaintenanceScheduleMobileSkeleton /> : <SingleMaintenanceScheduleSkeleton />;
  }

  if (!maintenanceItem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Machinery Not Found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="md:flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <BackButton className="" />
          <h1 className="text-heading font-bold text-slate-800 dark:text-white tracking-tight">
            {maintenanceItem.maintenanceItemName}
          </h1>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <SearchInput 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="hidden md:block"><ThemeToggle /></div>
          
        </div>
      </div>

      {/* From/To Selectors */}
      <div className="flex items-center justify-between gap-2 lg:gap-2 xl:gap-2 2xl:gap-3 my-4 lg:my-2 xl:my-2 2xl:my-3 3xl:my-4 border border-[#EEEBF4] dark:border-border max-w-[398px] lg:max-w-[240px] xl:max-w-[300px] 2xl:max-w-[360px] 3xl:max-w-[410px] py-1 lg:py-[1px] xl:py-[2px] 2xl:py-[3px] 3xl:py-1 px-2 rounded-md shrink-0">
        <div className="flex items-center justify-between gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3">
          <span className="text-[12px] lg:text-[8px] xl:text-[10px] 2xl:text-[12px] 3xl:text-[15px] font-medium text-[#A0A0A1] md:w-full w-[50px]">From :</span>
          <DatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            transparent={true}
            align="left"
            className="bg-[#F3F0FA] dark:bg-slate-800 px-2 lg:px-2 xl:px-2.5 2xl:px-3 py-1 rounded-md text-[12px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-slate-700 dark:text-slate-200"
          />
        </div>
        
        <div className="flex items-center justify-between gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3">
          <span className="text-[12px] lg:text-[8px] xl:text-[10px] 2xl:text-[12px] 3xl:text-[15px] font-semibold text-slate-400 md:w-full w-[50px]">To :</span>
          <DatePicker
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            transparent={true}
            align="right"
            className="bg-[#F3F0FA] dark:bg-slate-800 px-2 lg:px-2 xl:px-2.5 2xl:px-3 py-1 rounded-md text-[12px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-bold text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Main Content Area: Desktop (Table) or Mobile (Expandable Cards) */}
      {isMobile ? (
        <SingleMaintenanceScheduleMobileView
          paginatedRows={paginatedRows}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredRows.length / itemsPerPage) || 1}
          onPageChange={setCurrentPage}
          serialOffset={serialOffset}
          STATUS_OPTIONS={STATUS_OPTIONS}
          EditableSelectCell={EditableSelectCell}
          EditableCell={EditableCell}
          handleUpdate={handleUpdate}
          noDataMessage="No Records Found"
          noDataDescription={searchTerm
            ? `No records match "${searchTerm}". Try adjusting your search.`
            : "No maintenance records found for the selected criteria."}
        />
      ) : (
        <SingleMaintenanceScheduleDesktopView
          paginatedRows={paginatedRows}
          columns={columns}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredRows.length / itemsPerPage) || 1}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(Number(val));
            setCurrentPage(1);
          }}
          noDataMessage="No Records Found"
          noDataDescription={searchTerm
            ? `No records match "${searchTerm}". Try adjusting your search.`
            : "No maintenance records found for the selected criteria."}
        />
      )}
    </div>
  );
}
