import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";

const ProductionBarChart = ({ metrics, isLoading, dateRangeLabel }) => {
  const [activeWeek, setActiveWeek] = useState(null);

  const rawData = useMemo(() => {
    const weekly = Array.isArray(metrics?.productionByDepartmentWeekly)
      ? metrics.productionByDepartmentWeekly
      : [];

    if (weekly.length > 0) {
      return weekly;
    }

    return Array.isArray(metrics?.productionByDepartment)
      ? metrics.productionByDepartment
      : [];
  }, [metrics]);

  // added Uncategorized to map with the other departments
  const departments = useMemo(
    () => [
      { label: "Beverage", color: "#552E8E" },
      { label: "Bakery", color: "#A88CD5" },
      { label: "Confectionery", color: "#D3C5EA" },
      { label: "Dairy", color: "#EBE4F6" },
      { label: "Snacks", color: "#F4F0FB" },
      { label: "Uncategorized", color: "#D1D5DB" }, // Fallback category added
    ],
    []
  );

  const weeklyData = useMemo(() => {
    if (rawData.length === 0) {
      return [];
    }

    const normalizeDepartment = (value) => {
      const normalized = String(value || "").trim().toLowerCase();

      if (normalized === "beverage" || normalized === "beverages") return "Beverage";
      if (normalized === "bakery" || normalized === "bakery products") return "Bakery";
      if (normalized === "confectionery" || normalized === "confectionery products") return "Confectionery";
      if (normalized === "dairy" || normalized === "dairy products") return "Dairy";
      if (normalized === "snacks") return "Snacks";

      return "Uncategorized"; // Replaced empty string with Uncategorized
    };

    const formatDateLabel = (value) => {
      if (!value) return "";

      const parsedDate = new Date(value);
      if (Number.isNaN(parsedDate.getTime())) {
        return "";
      }

      const day = parsedDate.getDate();
      const monthShort = parsedDate.toLocaleString("en-GB", { month: "short" }).toUpperCase();
      const yearTwo = String(parsedDate.getFullYear()).slice(-2);

      return `${day} ${monthShort} ${yearTwo}`;
    };

    const getWeekLabel = (row) => {
      const startLabel = formatDateLabel(row.weekStartDate);
      const endLabel = formatDateLabel(row.weekEndDate);

      if (startLabel && endLabel) {
        return `${startLabel} - ${endLabel}`;
      }

      if (startLabel) {
        return startLabel;
      }

      if (row.weekNumber !== undefined && row.weekNumber !== null) {
        return `Week ${row.weekNumber}`;
      }

      return "Unknown Week";
    };

    const bucket = new Map();
    rawData.forEach(row => {
      const key = `${row.weekYear || ""}-W${row.weekNumber || ""}-${row.weekStartDate || ""}-${row.weekEndDate || ""}`;
      if (!bucket.has(key)) {
        const sortValue = new Date(row.weekStartDate || row.weekEndDate || 0).getTime() || 0;

        bucket.set(key, { 
          key,
          week: getWeekLabel(row),
          sortValue,
          // Uncategorized count tracking initialized
          values: { Beverage: 0, Bakery: 0, Confectionery: 0, Dairy: 0, Snacks: 0, Uncategorized: 0 } 
        });
      }
      const weekItem = bucket.get(key);
      const categoryName = row.categoryName || row.departmentName || "";
      const category = normalizeDepartment(categoryName);

      if (category && weekItem.values[category] !== undefined) {
        weekItem.values[category] += Number(row.sampleCount) || 0;
      }
    });

    return Array.from(bucket.values()).sort((a, b) => a.sortValue - b.sortValue);
  }, [rawData]);

  const activeDepartments = useMemo(() => {
    return departments.filter((dept) =>
      weeklyData.some((weekItem) => Number(weekItem.values?.[dept.label] || 0) > 0)
    );
  }, [weeklyData, departments]);

  const hasData = weeklyData.length > 0 && activeDepartments.length > 0;
  const maxVal = useMemo(() => {
    let max = 0;
    weeklyData.forEach(d => {
      activeDepartments.forEach((dept) => {
        const v = Number(d.values?.[dept.label] || 0);
        if (v > max) max = v;
      });
    });
    if (max <= 0) return 10;
    return Math.max(10, Math.ceil(max / 20) * 20);
  }, [weeklyData, activeDepartments]);

  const yTicks = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0].map(Math.round);
  const shouldEnableScroll = weeklyData.length > 5;
  const chartMinWidth = shouldEnableScroll ? `${weeklyData.length * 150}px` : "100%";
  const plotHeight = 260;

  if (isLoading) {
    return (
      <div className="w-full h-[450px] bg-white dark:bg-[#1A1125] rounded-[32px] p-8 animate-pulse border border-gray-50 dark:border-nav-highlight/15 shadow-sm">
        <div className="h-6 w-48 bg-gray-100 dark:bg-white/5 rounded-md mb-8" />
        <div className="flex-1 flex items-end gap-10 px-10">
           {Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="flex-1 h-32 bg-gray-50 dark:bg-white/5 rounded-t-lg" />
           ))}
        </div>
      </div>
    );
  }

  const dateRangeText = dateRangeLabel ? ` (${dateRangeLabel})` : "";

  if (!hasData) {
    return (
      <div className="w-full bg-white dark:bg-[#1A1125] rounded-xl md:rounded-2xl p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-primary/15 dark:border-nav-highlight/15 flex flex-col gap-8 font-jakarta h-full">
        <div className="md:flex items-center justify-between">
          <div className="flex items-center gap-2.5 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5">
            <TrendingUp className="w-5 h-5 lg:h-2 xl:h-3 2xl:h-4 3xl:h-5 lg:w-2 xl:w-3 2xl:w-4 3xl:w-5 text-[#552E8E] dark:text-[#A88CD5]" />
            <h3 className="text-xs lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base border-gray-800 font-bold text-gray-800 dark:text-gray-200">
              Production by Department
            </h3>
          </div>
        </div>

        <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
          <p className="w-110 text-md lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-md font-medium text-gray-600 dark:text-gray-300">No production-by-department data found for the selected date range {dateRangeText}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#1A1125] rounded-xl md:rounded-2xl p-4 md:p-8 border border-primary/15 dark:border-nav-highlight/15 flex flex-col gap-8 font-jakarta h-full">
      {/* Header */}
      <div className="md:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg">
            <TrendingUp className="w-5 h-5 text-[#552E8E] dark:text-[#A88CD5]" />
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 tracking-tight text-[16px]">
            Production by Department
          </h3>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 mt-3 md:mt-0 md:flex items-center md:gap-5 gap-2 overflow-x-auto custom-scrollbar pb-1">
          {activeDepartments.map((dept) => (
            <div key={dept.label} className="flex items-center gap-2 shrink-0">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: dept.color }}
              />
              <span className="text-body font-semibold text-gray-400 dark:text-gray-500">
                {dept.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Body */}
      <div className="relative h-[300px] w-full flex mt-4">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-[250px] pr-6 text-xs font-bold text-gray-400 dark:text-gray-500">
          {yTicks.map((tick) => (
            <span key={tick} className="h-0 flex items-center justify-end">
              {tick}
            </span>
          ))}
        </div>

        {/* Content Area Wrap with Scroll */}
        <div className={`flex-1 pb-2 ${shouldEnableScroll ? "overflow-x-auto overflow-y-visible custom-scrollbar" : "overflow-x-hidden overflow-y-visible"}`}>
          <div className="relative h-full flex flex-col pt-1" style={{ minWidth: chartMinWidth }}>
            {/* Grid Lines */}
            <div className="absolute inset-0 top-0 bottom-[40px] flex flex-col justify-between pointer-events-none">
              {yTicks.map((tick) => (
                <div
                  key={`line-${tick}`}
                  className="w-full border-t border-dashed border-gray-100 dark:border-white/5"
                />
              ))}
            </div>

            {/* Groups (Weeks) - Flex justify-around prevents overlaps by naturally spacing items */}
            <div className="absolute inset-x-0 top-0 bottom-10 flex justify-around items-end z-10 px-2 sm:px-6">
              {weeklyData.map((item, weekIndex) => {
                const weekValues = activeDepartments.map((dept) => Number(item.values?.[dept.label] || 0));
                const peakValue = Math.max(...weekValues, 0);
                const barTopY = (peakValue / maxVal) * plotHeight;
                const tooltipBottom = Math.max(44, Math.min(barTopY + 24, 140));

                return (
                <div
                  key={item.key || `${item.week}-${weekIndex}`}
                  className="relative h-full flex flex-col items-center justify-end group cursor-pointer w-[120px] md:w-[140px] shrink-0"
                  onMouseEnter={() => setActiveWeek(weekIndex)}
                  onMouseLeave={() => setActiveWeek(null)}
                >
                  {/* Tooltip Overlay */}
                  {activeWeek === weekIndex && (
                    <div
                      className="absolute flex flex-col items-center z-50 animate-in fade-in zoom-in duration-200 left-1/2 -translate-x-1/2"
                      style={{ bottom: `${tooltipBottom}px` }}
                    >
                      <div className="bg-white dark:bg-[#2D213D] p-4 rounded-xl shadow-[0_8px_32px_rgba(85,46,142,0.12)] border border-[#F5F1FF] dark:border-nav-highlight/20 mb-3 flex flex-col gap-1.5 w-[150px] relative">
                        {activeDepartments.map((dept) => (
                          <div key={dept.label} className="flex items-center justify-between gap-3">
                            <span className="text-body font-semibold text-gray-400 dark:text-gray-500">
                              {dept.label}
                            </span>
                            <span className="text-body font-bold tabular-nums text-[#552E8E] dark:text-[#A88CD5]">
                              {item.values[dept.label] || 0}
                            </span>
                          </div>
                        ))}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#2D213D] border-r border-b border-[#F5F1FF] dark:border-nav-highlight/20 rotate-45" />
                      </div>
                      <div className="w-5 h-5 rounded-full border-[3px] border-white dark:border-[#2D213D] bg-[#552E8E] dark:bg-[#A88CD5] shadow-sm z-10" />
                    </div>
                  )}

                  {/* Group of Bars */}
                  <div className="flex items-end gap-1.5 px-2">
                    {activeDepartments.map((dept, i) => {
                      const val = item.values[dept.label] || 0;
                      const height = (val / maxVal) * plotHeight;
                      if (val <= 0) return null;

                      return (
                        <div
                          key={i}
                          className="w-[14px] rounded-t-[4px] transition-all duration-300 group-hover:opacity-85"
                          style={{
                            height: `${Math.max(4, height)}px`,
                            backgroundColor: dept.color,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* X-Axis Label - perfectly centered with fixed width container */}
                  <div className="absolute bottom-[-40px] w-full text-center">
                    <span className={`text-[10px] sm:text-xs leading-4 font-bold transition-colors block ${activeWeek === weekIndex ? 'text-[#552E8E] dark:text-[#A88CD5]' : 'text-gray-400 dark:text-gray-500'}`}>
                      {item.week}
                    </span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionBarChart;