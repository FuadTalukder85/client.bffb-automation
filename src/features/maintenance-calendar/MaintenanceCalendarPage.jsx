import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { 
  useMaintenanceItems, 
  useMaintenanceScheduleOverview, 
  useBulkScheduleMaintenance, 
  useDeleteMaintenanceSchedule,
  useRestoreMaintenanceSchedule
} from "@/hooks/useMaintenance";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { DesktopFilterPills } from "@/components/ui/FilterInput/DesktopFilterInput";
import { AiFillThunderbolt } from "react-icons/ai";

import { cn } from "@/lib/utils";
import { 
  parseISO
} from "date-fns";
import PageHeader from "@/components/common/page-header";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/useIsMobile";
import EditScheduleModal from "./components/EditScheduleModal";
import DeleteScheduleModal from "./components/DeleteScheduleModal";
import RestoreScheduleModal from "./components/RestoreScheduleModal";
import { PaginatedTable, getResponsiveSize, useWindowWidth } from "@/components/ui/PaginatedTable/PaginatedTable";
import MaintenanceCalendarPageSkeleton from "./components/MaintenanceCalendarPageSkeleton";
import MaintenanceCalendarMobileView from "./components/MaintenanceCalendarMobileView";
import MaintenanceCalendarMobileSkeleton from "./components/MaintenanceCalendarMobileSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { FilterInput } from "@/components/ui/FilterInput/FilterInput";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const SCHEDULE_STATE_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Archived", value: "false" },
  { label: "All", value: "all" },
];

const STATUS_COLORS = {
  "Pending": "bg-yellow-500/10 text-yellow-600 border-yellow-200/50",
  "Incomplete": "bg-red-500/10 text-red-600 border-red-200/50",
  "Complete": "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
  "Other": "bg-slate-500/10 text-slate-600 border-slate-200/50"
};

const MonthCell = ({ days, monthName }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState("top");
  const triggerRef = useRef(null);
  
  if (!days || days.length === 0) {
    return <span className="text-muted-foreground/30">—</span>;
  }

  const sortedDays = [...days].sort((a, b) => a.day - b.day);
  const totalCount = sortedDays.length;
  
  let displayedDays, hasMore;
  
  if (totalCount <= 5) {
    displayedDays = sortedDays;
    hasMore = false;
  } else {
    displayedDays = sortedDays.slice(0, 4);
    hasMore = true;
  }

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 288; // w-72
      const tooltipHeight = 350;
      const spacing = 10;
      
      let left = rect.left + rect.width / 2;
      
      if (left - tooltipWidth / 2 < 20) {
        left = 20 + tooltipWidth / 2;
      } else if (left + tooltipWidth / 2 > viewportWidth - 20) {
        left = viewportWidth - 20 - tooltipWidth / 2;
      }

      const shouldShowBelow = rect.top < tooltipHeight + 20;
      const preferredTop = shouldShowBelow ? rect.bottom + spacing : rect.top - spacing;
      const safeTop = Math.min(Math.max(preferredTop, 10), viewportHeight - 10);

      setPlacement(shouldShowBelow ? "bottom" : "top");
      setPosition({ top: safeTop, left });
    }
    setIsHovered(true);
  };

  const tooltipContent = isHovered ? (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: placement === "top" ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        zIndex: 9999,
      }}
      className="w-72 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-none"
    >
      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 border-b border-border/50">
        <h4 className="text-[11px] font-bold text-center uppercase tracking-widest text-slate-500 dark:text-slate-400">{monthName} Schedule</h4>
      </div>
      <div className="p-4 grid grid-cols-5 gap-2 bg-white dark:bg-slate-900">
        {sortedDays.map((d, i) => (
          <div 
            key={i}
            className={cn(
              "flex items-center justify-center h-9 w-9 rounded-lg border text-sm font-bold shadow-sm transition-all",
              STATUS_COLORS[d.status] || "bg-accent/40 text-muted-foreground border-border"
            )}
          >
            {d.day}
          </div>
        ))}
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 border-t border-border/50 flex justify-between items-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
        <span>{sortedDays.length} TASKS</span>
        <span className="opacity-60">{monthName}</span>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative flex flex-col items-center justify-center min-h-10 py-1 cursor-default group overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-row items-center justify-center gap-1 w-full max-w-full">
          <div className="flex flex-row items-center gap-1 flex-nowrap min-w-0 px-1 py-1">
            {displayedDays.map((d, i) => (
              <span 
                key={i} 
                className={cn(
                  "px-1 py-0.5 rounded-md border w-7 h-5 flex items-center justify-center text-[9px] text-center transition-all shrink-0",
                  STATUS_COLORS[d.status] || "bg-accent/40 text-muted-foreground border-border"
                )}
              >
                {d.day}
              </span>
            ))}
            {hasMore && (
              <span className="text-[14px] leading-none text-muted-foreground font-bold shrink-0 w-8 h-5 flex items-center justify-center bg-accent/30 rounded-md border border-border/50">
                ...
              </span>
            )}
          </div>
        </div>
      </div>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};

export default function MaintenanceCalendarPage() {
  const isMobile = useIsMobile();
  const windowWidth = useWindowWidth();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const selectedDept = "All";
  const [selectedScheduleState, setSelectedScheduleState] = useState("true");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const noDataMessage = "No Records Found";
  const noDataDescription = searchTerm
    ? `No records match "${searchTerm}". Try adjusting your search or filter criteria.`
    : "No records match your current filters. Try adjusting your search or filter criteria.";
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  useEffect(() => {
    setSelectedRowIds([]);
  }, [currentPage, searchTerm, selectedScheduleState]);

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedItemToRestore, setSelectedItemToRestore] = useState(null);

  const { data: scheduleData, isLoading: isLoadingSchedule, error: scheduleError } = useMaintenanceScheduleOverview(currentYear, {
    isActive: selectedScheduleState,
  });
  const { data: itemsData, isLoading: isLoadingItems, error: itemsError } = useMaintenanceItems({ isActive: "true" });
  
  const error = scheduleError || itemsError;
  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load maintenance calendar";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const scheduleMutation = useBulkScheduleMaintenance();
  const deleteScheduleMutation = useDeleteMaintenanceSchedule();
  const restoreScheduleMutation = useRestoreMaintenanceSchedule();

  const maintenanceItems = useMemo(() => itemsData?.data || [], [itemsData]);
  const scheduleOverview = useMemo(
    () => scheduleData || { scheduledDates: [], itemScheduleMap: {}, itemFrequencyMap: {}, itemActiveMap: {} },
    [scheduleData]
  );

  const calendarRows = useMemo(() => {
    return Object.entries(scheduleOverview.itemScheduleMap).map(([itemId, dates]) => {
      const item = maintenanceItems.find(i => i._id === itemId);
      if (!item) return null;

      const monthsData = Array.from({ length: 12 }, () => []);
      dates.forEach(d => {
        const dateStr = typeof d === 'string' ? d : d.date;
        if (!dateStr) return;
        
        const date = parseISO(dateStr);
        if (date.getFullYear() === currentYear) {
          const status = typeof d === 'object' ? d.status : "Pending";
          const day = date.getDate();
          
          if (!monthsData[date.getMonth()].find(m => m.day === day && m.status === status)) {
            monthsData[date.getMonth()].push({ day, status });
          }
        }
      });

      return {
        id: itemId,
        scheduleId: scheduleOverview.itemToScheduleIdMap?.[itemId] || itemId,
        machinery: item.maintenanceItemName || "Unnamed Machinery",
        department: item.department || "General",
        frequency: scheduleOverview.itemFrequencyMap?.[itemId] || "Weekly",
        isActive: scheduleOverview.itemActiveMap?.[itemId] ?? true,
        months: monthsData
      };
    }).filter(Boolean);
  }, [
    scheduleOverview.itemScheduleMap,
    scheduleOverview.itemFrequencyMap,
    scheduleOverview.itemToScheduleIdMap,
    scheduleOverview.itemActiveMap,
    maintenanceItems,
    currentYear,
  ]);

  const filteredRows = useMemo(() => {
    return calendarRows.filter(row => {
      const matchesDept = selectedDept === "All" || row.department === selectedDept;
      const matchesSearch = !searchTerm || row.machinery.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [calendarRows, selectedDept, searchTerm]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (item) => {
    const itemToDelete = item || selectedItemToDelete;
    if (!itemToDelete) return;

    if (Array.isArray(itemToDelete)) {
      const results = await Promise.allSettled(
        itemToDelete.map((r) => deleteScheduleMutation.mutateAsync(r.scheduleId || r.id))
      );
      const succeeded = results.filter((res) => res.status === "fulfilled").length;
      const failed = results.filter((res) => res.status === "rejected");
      if (succeeded > 0) toast.success(`${succeeded} maintenance schedule(s) archived successfully`);
      if (failed.length > 0) toast.error(`Failed to archive ${failed.length} maintenance schedule(s)`);
      setSelectedRowIds([]);
    } else {
      await deleteScheduleMutation.mutateAsync(itemToDelete.scheduleId || itemToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setSelectedItemToDelete(null);
  };

  const handleRestoreClick = (item) => {
    setSelectedItemToRestore(item);
    setIsRestoreModalOpen(true);
  };

  const handleRestoreConfirm = () => {
    if (!selectedItemToRestore) return;

    restoreScheduleMutation.mutate(selectedItemToRestore.scheduleId || selectedItemToRestore.id, {
      onSuccess: () => {
        setIsRestoreModalOpen(false);
        setSelectedItemToRestore(null);
      },
    });
  };

  const handleSaveSchedule = (data) => {
    scheduleMutation.mutate({
      maintenanceItems: [data.itemId],
      year: currentYear,
      frequency: data.frequency,
      scheduledDates: data.scheduledDates,
      allowReschedule: true,
    }, {
      onSuccess: () => {
        setIsEditModalOpen(false);
      },
    });
  };

  const columns = useMemo(() => [
    {
      id: "serial",
      header: "SL",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-5.5 p-2 2xl:size-6.5 2xl:p-5 bg-primary/10 rounded-full mx-auto">
          <span className="font-medium text-nav-highlight">
            {((currentPage - 1) * itemsPerPage) + row.index + 1}
          </span>
        </div>
      ),
      size: getResponsiveSize(windowWidth, { lg: 60, xl: 70, '2xl': 80, '3xl': 60 }),
    },
    {
      accessorKey: "machinery",
      header: "Machinery",
      headerClassName: "",
      cell: ({ getValue }) => <div className="truncate font-medium pr-4">{getValue()}</div>,
      size: getResponsiveSize(windowWidth, { lg: 128, xl: 170, '2xl': 192, '3xl': 240 }),
    },
    {
      accessorKey: "department",
      header: "Department",
      headerClassName: "",
      cell: ({ getValue }) => <div className="font-medium pr-4">{getValue()}</div>,
      size: getResponsiveSize(windowWidth, { lg: 85, xl: 113, '2xl': 128, '3xl': 160 }),
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      headerClassName: "text-left",
      cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
      size: getResponsiveSize(windowWidth, { lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    },
    ...MONTHS_SHORT.map((month, idx) => ({
      id: `month-${idx}`,
      header: month,
      headerClassName: "text-center",
      cell: ({ row }) => <MonthCell days={row.original.months[idx]} monthName={month} />,
      size: getResponsiveSize(windowWidth, { lg: 106, xl: 142, '2xl': 160, '3xl': 200 }),
    })),
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-0 h-full">
          {row.original.isActive ? (
            <>
              <Link to={`/maintenance/maintenance-calendar/${row.original.id}`}>
                <button 
                  className="flex items-center justify-center gap-1.5 font-semibold rounded-l-md rounded-r-none text-nav-highlight hover:bg-purple-200 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2 bg-background"
                  title="View Details"
                >
                  <Eye className="action-button-icon" />
                </button>
              </Link>
              
              <button
                onClick={() => handleEditClick(row.original)}
                className="flex items-center justify-center gap-1.5   font-semibold rounded-none text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2"
                title="Edit"
              >
                <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
              </button>
              
              <button
                onClick={() => handleDeleteClick(row.original)}
                className="flex items-center justify-center gap-1.5   font-semibold rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none   px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2"
                title="Archive"
              >
                <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRestoreClick(row.original)}
              className="action-button flex items-center justify-center gap-1.5 font-semibold rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer px-2 py-1 2xl:px-3 2xl:py-1.5 3xl:px-3 3xl:py-2"
              title="Restore"
            >
              <AiFillThunderbolt className="action-button-icon" />
            </button>
          )}
        </div>
      ),
      size: getResponsiveSize(windowWidth, { lg: 64, xl: 85, '2xl': 96, '3xl': 120 }),
    }
  ], [currentPage, itemsPerPage, windowWidth]);

  const [columnPinning] = useState({
    left: ["serial", "machinery", "department", "frequency"],
    right: ["actions"]
  });

  const isPageLoading = isLoadingSchedule || isLoadingItems;

  if (isPageLoading) {
    return isMobile ? <MaintenanceCalendarMobileSkeleton /> : <MaintenanceCalendarPageSkeleton />;
  }

  return (
    <section className="flex flex-col px-0 page-section-spacing md:flex-1 md:min-h-0 min-h-[calc(100vh-6rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-none ms-0 lg:ms-5 gap-4">
        <PageHeader title="Maintenance Calendar" className="py-0 text-heading md:p-0 md:m-0" />
          <div className="items-center hidden gap-4 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 md:flex">
            <SearchInput
              placeholder="Search machinery..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <ThemeToggle />
          </div>
      </div>

      <div className="hidden md:flex md:flex-row items-center justify-between gap-2 md:gap-4 mb-4 lg:my-1.5 xl:my-2 2xl:my-3 3xl:my-4 md:ms-5 lg:mx-5">
          <div className="flex items-center">
            <button 
              onClick={() => { setCurrentYear(prev => prev - 1); setCurrentPage(1); }}
              className="flex items-center justify-center w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 bg-[#EEEBF4] dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronLeft className="action-button-icon text-foreground/70" />
            </button>
            <div className="min-w-30 lg:min-w-16 xl:min-w-21 2xl:min-w-24 3xl:min-w-30 px-4 py-0.5 border border-[#EEEBF4] rounded-md text-center">
              <span className="text-[15px] lg:text-[8px] xl:text-[10px] 2xl:text-[12px] 3xl:text-[15px] font-semibold text-primary dark:text-white"><p>{currentYear}</p></span>
            </div>
            <button 
              onClick={() => { setCurrentYear(prev => prev + 1); setCurrentPage(1); }}
              className="flex items-center justify-center w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7 bg-[#EEEBF4] dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronRight className="action-button-icon text-foreground/70" />
            </button>
          </div>
        <div className="flex items-center gap-4 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-4">
          <div className="hidden md:block">
           <DesktopFilterPills
            value={selectedScheduleState}
            options={SCHEDULE_STATE_OPTIONS}
            onChange={(value) => {
              setSelectedScheduleState(value);
              setCurrentPage(1);
            }}
          />
         </div>
          <div className="flex items-center gap-2 lg:gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 w-full md:w-auto">
          <Link to="/maintenance/schedule-maintenance" className="w-full md:w-auto">
            <Button className="w-full h-8 lg:h-5.5 xl:h-7 2xl:h-8 3xl:h-10 px-3 lg:px-3.5 xl:px-4 2xl:px-4.5 3xl:px-6 rounded-full text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              <Plus className="action-button-icon" />
              Schedule Maintenance
            </Button>
          </Link>
        </div>
        </div>
       
      </div>

      <div className="md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm pb-3 mb-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            <button 
              onClick={() => { setCurrentYear(prev => prev - 1); setCurrentPage(1); }}
              className="flex items-center justify-center w-7 h-7 bg-[#EEEBF4] dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronLeft className="action-button-icon text-foreground/70" />
            </button>
            <div className="min-w-30 px-4 py-0.5 border border-[#EEEBF4] rounded-md text-center">
              <span className="text-[15px] font-semibold text-primary dark:text-white">{currentYear}</span>
            </div>
            <button 
              onClick={() => { setCurrentYear(prev => prev + 1); setCurrentPage(1); }}
              className="flex items-center justify-center w-7 h-7 bg-[#EEEBF4] dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronRight className="action-button-icon text-foreground/70" />
            </button>
          </div>
          <Link to="/maintenance/schedule-maintenance" className="w-auto">
            <Button className="h-8 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              <Plus className="action-button-icon" />
              {/* Schedule Maintenance */}
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SearchInput
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="w-[132px] shrink-0">
            <FilterInput
              config={{
                options: SCHEDULE_STATE_OPTIONS,
                value: selectedScheduleState,
                onValueChange: (value) => {
                  setSelectedScheduleState(value);
                  setCurrentPage(1);
                },
                placeholder: "Active",
                defaultValue: "true",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 lg:mx-2 relative pb-4">
        {isMobile ? (
          hasError && filteredRows.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-center text-red-500">
              {errorMessage}
            </div>
          ) : (
            <MaintenanceCalendarMobileView
              data={filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onRestore={handleRestoreClick}
              noDataMessage={noDataMessage}
              noDataDescription={noDataDescription}
            />
          )
        ) : (
          <PaginatedTable
            data={filteredRows}
            columns={columns}
            enableSelection={selectedScheduleState === "true"}
            selectedRowIds={selectedRowIds}
            onSelectionChange={setSelectedRowIds}
            canSelectRow={(item) => item.isActive ?? true}
            onBulkArchiveClick={() => {
              const selectedObjects = filteredRows.filter(r => selectedRowIds.includes(r._id || r.id));
              setSelectedItemToDelete(selectedObjects);
              setIsDeleteModalOpen(true);
            }}
            className="flex-1 min-h-0"
            rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
            bodyRowClassName="border-0 hover:bg-muted/10 transition-colors"
            bodyCellClassName="py-3 px-4 first:rounded-l-2xl last:rounded-r-2xl"
            columnPinning={columnPinning}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredRows.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            noDataMessage={noDataMessage}
            noDataDescription={noDataDescription}
            emptyState={
              hasError ? (
                <div className="py-10 text-center text-red-500">
                  {errorMessage}
                </div>
              ) : null
            }
          />
        )}
      </div>

      {isMobile && Math.ceil(filteredRows.length / itemsPerPage) >= 1 && (
        <div className="flex justify-center w-full mt-auto mb-7 lg:mb-0! md:hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredRows.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={selectedItem}
        onSave={handleSaveSchedule}
        isSaving={scheduleMutation.isPending}
      />

      <DeleteScheduleModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setSelectedItemToDelete(null);
        }}
        item={selectedItemToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteScheduleMutation.isPending}
      />
      <RestoreScheduleModal
        open={isRestoreModalOpen}
        onOpenChange={(open) => {
          setIsRestoreModalOpen(open);
          if (!open) setSelectedItemToRestore(null);
        }}
        item={selectedItemToRestore}
        onConfirm={handleRestoreConfirm}
        isLoading={restoreScheduleMutation.isPending}
      />
    </section>
  );
}

