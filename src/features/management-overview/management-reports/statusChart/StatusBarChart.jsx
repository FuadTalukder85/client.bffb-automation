import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * StatusBarChart Component
 * Designed to match the Project Pipeline Distribution chart in the reference image.
 */
const StatusBarChart = ({ data, dateRangeLabel, isLoading }) => {
  const statusColors = {
    "Not Started": { color: "#FFD6E8", text: "#D81B60" },
    "In Progress": { color: "#D1D9FF", text: "#3F51B5" },
    "Completed": { color: "#C0EBFF", text: "#00BCD4" },
    "Rework": { color: "#FFF2C2", text: "#B08968" },
    "Approved": { color: "#D1F2D6", text: "#2E7D32" },
    "Paused": { color: "#FFE0CC", text: "#E67E22" },
    "Cancelled": { color: "#FFD1D1", text: "#E53935" },
    "Adopted": { color: "#BFFFBE", text: "#388E3C" },
  };

  const normalizeStatus = (s) => {
    if (!s) return "";
    return s.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const isHiddenStatus = (label) => label.trim().toLowerCase() === "none";

  const chartData = (data || []).map(item => {
    const label = normalizeStatus(item.status);
    return {
      label,
      count: Number(item.count) || 0,
      color: statusColors[label]?.color || "#E5E7EB",
      text: statusColors[label]?.text || "#6B7280"
    };
  }).filter(item => item.count > 0 && item.label && !isHiddenStatus(item.label));

  const dateRangeText = dateRangeLabel ? ` (${dateRangeLabel})` : "";
  const displayData = chartData;
  const [activeIdx, setActiveIdx] = useState(null);

  const hasData = displayData.length > 0;
  const maxVal = Math.max(...displayData.map(d => d.count), 1);
  const roundedMax = Math.ceil(maxVal / 20) * 20;
  const yTicks = [roundedMax, Math.round(roundedMax * 0.75), Math.round(roundedMax * 0.5), Math.round(roundedMax * 0.25), 0];

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-[#1A1125] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-nav-highlight/15 flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="w-48 h-6 rounded-md" />
        </div>
        <div className="relative h-[260px] 2xl:h-[300px] 3xl:h-[380px] w-full flex pt-4">
          <div className="flex flex-col justify-between h-[210px] 2xl:h-[250px] 3xl:h-[330px] pr-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-6 h-3 rounded-sm" />
            ))}
          </div>
          <div className="flex-1 flex justify-around items-end pb-10 px-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <Skeleton 
                  className="w-6 md:w-12 rounded-t-[10px]" 
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
                <Skeleton className="w-12 md:w-16 h-3 md:h-4 rounded-sm mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#1A1125] rounded-xl md:rounded-2xl p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-primary/15 dark:border-nav-highlight/15 flex flex-col gap-6 font-urbanist">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5">
          <TrendingUp className="w-5 h-5 lg:h-2 xl:h-3 2xl:h-4 3xl:h-5 lg:w-2 xl:w-3 2xl:w-4 3xl:w-5 text-[#552E8E] dark:text-[#A88CD5]" />
          <h3 className="text-xs lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base border-gray-800 font-bold text-gray-800 dark:text-gray-200">
            Project Pipeline Distribution
          </h3>
        </div>
      </div>

      {/* Chart Body */}
      <div className="relative h-[260px] 2xl:h-[300px] 3xl:h-[380px] w-full flex">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-[210px] 2xl:h-[250px] 3xl:h-[330px] pr-4 text-xs font-semibold text-gray-400 dark:text-gray-500">
          {yTicks.map((tick) => (
            <span key={tick} className="h-0 flex items-center justify-end">
              {tick}
            </span>
          ))}
        </div>

        {/* Content Area Wrap */}
        <div className="flex-1 overflow-x-auto custom-scrollbar pb-2">
          {hasData ? (
            <div className="relative h-full flex flex-col min-w-[500px]">
              {/* Grid Lines */}
              <div className="absolute inset-0 top-0 bottom-10 flex flex-col justify-between pointer-events-none">
                {yTicks.map((tick) => (
                  <div
                    key={`line-${tick}`}
                    className="w-full border-t border-dashed border-gray-100 dark:border-white/5"
                  />
                ))}
              </div>

              {/* Bars Container */}
              <div className="absolute inset-x-0 top-0 bottom-10 flex justify-around items-end z-10 px-10">
                {displayData.map((item, index) => (
                  <div
                    key={item.label}
                    className="relative group flex flex-col items-center"
                    style={{ height: `${(item.count / roundedMax) * 100}%` }}
                    onMouseEnter={() => setActiveIdx(index)}
                    onMouseLeave={() => setActiveIdx(null)}
                    onClick={() => setActiveIdx(activeIdx === index ? null : index)}
                  >
                    {/* Bar */}
                    <div
                      className="w-6 md:w-12 h-full rounded-t-[5px] md:rounded-t-[10px] transition-all duration-300 group-hover:opacity-80"
                      style={{ backgroundColor: item.color }}
                    />

                    {/* Sub-label (X-Axis) - Positioned below the bar */}
                    <div className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 w-max text-center">
                      <span
                        className="text-body font-semibold md:font-bold"
                        style={{ color: item.text }}
                      >
                        {item.label}
                      </span>
                    </div>

                    {/* Interactive Tooltip */}
                    {activeIdx === index && (
                      <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50 animate-in fade-in zoom-in duration-200">
                        <div className="bg-white dark:bg-[#2D213D] px-3 py-2 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-nav-highlight/20 min-w-[120px]">
                           <span className="text-body text-[#9C9C9C] dark:text-gray-400 font-normal leading-none mb-1">{item.label} :</span>
                           <span className="text-body font-bold pl-1" style={{ color: item.text }}>{item.count}</span>
                        </div>
                        <div className="w-4 h-4 rounded-full border-4 border-white dark:border-[#2D213D] -mt-2 shadow-sm" style={{ backgroundColor: item.text }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center px-6 text-center">
              <div>
                <p className="w-85 text-md lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-md font-medium text-gray-600 dark:text-gray-300">No status pipeline data found for the selected date range {dateRangeText}.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusBarChart;
