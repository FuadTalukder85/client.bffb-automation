import React, { useRef, useState } from "react";
import { Link } from "react-router";
import { 
  Eye
} from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { NoData } from "@/components/ui/NoData";

const STATUS_COLORS = {
  "Pending": "bg-yellow-500/10 text-yellow-600 border-yellow-200/50",
  "Incomplete": "bg-red-500/10 text-red-600 border-red-200/50",
  "Complete": "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
  "Other": "bg-slate-500/10 text-slate-600 border-slate-200/50"
};

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const MonthCellMobile = ({ days, monthName }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  
  if (!days || days.length === 0) {
    return <span className="text-muted-foreground/30">—</span>;
  }

  const sortedDays = [...days].sort((a, b) => a.day - b.day);
  const totalCount = sortedDays.length;
  
  let displayedDays, hasMore;
  
  if (totalCount <= 2) {
    displayedDays = sortedDays;
    hasMore = false;
  } else {
    displayedDays = sortedDays.slice(0, 1);
    hasMore = true;
  }

  const handleTouch = (e) => {
    // Prevent default to avoid scroll issues while tapping cells
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const tooltipWidth = 288; // w-72 matching desktop
      
      let left = rect.left + rect.width / 2;
      
      if (left - tooltipWidth / 2 < 20) {
        left = 20 + tooltipWidth / 2;
      } else if (left + tooltipWidth / 2 > viewportWidth - 20) {
        left = viewportWidth - 20 - tooltipWidth / 2;
      }

      setPosition({ top: rect.top - 10, left });
    }
    setIsHovered(true);
    // On mobile, tooltips are usually dismissed by tapping again or elsewhere
    // We'll keep the dismiss-only-on-tap-out or manual dismiss behavior
  };

  const tooltipContent = isHovered ? (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
      }}
      onClick={(e) => { e.stopPropagation(); setIsHovered(false); }}
      className="w-72 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
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
        onClick={handleTouch}
        className="relative flex flex-col items-center justify-center min-h-10 py-1 cursor-default group overflow-hidden"
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
      {isHovered && (
        <div 
          className="fixed inset-0 z-[9998] bg-transparent" 
          onClick={() => setIsHovered(false)}
        />
      )}
    </>
  );
};

export default function MaintenanceCalendarMobileView({ 
  data, 
  onEdit, 
  onDelete, 
  onRestore,
  noDataMessage,
  noDataDescription,
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-md flex flex-col min-h-0 relative">
        {/* Table Container with Horizontal Scroll */}
        <div className="flex-1 overflow-auto custom-scrollbar flex flex-col min-h-0">
          {data?.length > 0 ? (
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-border/50">
                <th className="sticky left-0 z-30 bg-slate-50 dark:bg-slate-800 px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 min-w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Machinery
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 min-w-[140px]">
                  Department
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500 min-w-[100px]">
                  Frequency
                </th>
                {MONTHS_SHORT.map((month) => (
                  <th key={month} className="px-4 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-500 min-w-[64px]">
                    {month}
                  </th>
                ))}
                <th className="px-4 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-500 min-w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors h-16">
                  {/* Sticky Machinery Column */}
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-4 py-2 border-r border-border/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <span className="text-[13px] font-bold text-foreground line-clamp-1">{row.machinery}</span>
                  </td>

                  {/* Scrollable Columns */}
                  <td className="px-4 py-2">
                    <span className="text-[12px] font-semibold text-foreground/80">{row.department}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-[12px] font-semibold text-foreground/80">{row.frequency}</span>
                  </td>

                  {/* Month Data Cells */}
                  {row.months.map((monthData, idx) => (
                    <td key={idx} className="px-1 text-center">
                      <MonthCellMobile days={monthData} monthName={MONTHS_SHORT[idx]} />
                    </td>
                  ))}

                  {/* Actions Column */}
                  <td className="px-3">
                    <div className="flex items-center justify-end gap-0 h-full">
                      {row.isActive ? (
                        <>
                          <Link to={`/maintenance/maintenance-calendar/${row.id}`}>
                            <button className="flex items-center justify-center gap-1.5 w-auto h-8 px-2 py-1 text-sm font-semibold rounded-l-md rounded-r-none text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => onEdit(row)}
                            className="flex items-center justify-center gap-1.5 w-auto h-8 px-2 py-1 text-sm font-semibold rounded-none text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                          >
                             <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"/></svg>
                          </button>
                          <button 
                            onClick={() => onDelete(row)}
                            className="flex items-center justify-center gap-1.5 w-auto h-8 px-2 py-1 text-sm font-semibold rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                          >
                             <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => onRestore(row)}
                          className="flex items-center justify-center gap-1.5 w-auto h-8 px-2 py-1 text-sm font-semibold rounded-md text-nav-highlight border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        >
                          <AiFillThunderbolt className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
            <NoData
              message={noDataMessage}
              description={noDataDescription}
            />
          )}
        </div>
      </div>
    </div>
  );
}
