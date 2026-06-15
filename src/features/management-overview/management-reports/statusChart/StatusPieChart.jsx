import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * StatusPieChart Component
 * Designed to match the Status Summary chart with a high-fidelity active shape interaction.
 */
const StatusPieChart = ({ data, dateRangeLabel, isLoading }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [pinnedIdx, setPinnedIdx] = useState(null);

  // Status Colors
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

  const normalizeStatus = (s) =>
    s?.toLocaleLowerCase().replace(/\b\w/g, (char) => char.toLocaleUpperCase()) || "";

  const isHiddenStatus = (label) => label.trim().toLocaleLowerCase() === "none";

  const chartData = useMemo(() => {
    return (data || [])
      .map((item) => {
        const label = normalizeStatus(item.status);
        const colorData = statusColors[label] || { color: "#E5E7EB", text: "#6B7280" };
        return {
          label,
          value: Number(item.count) || 0,
          color: colorData.color,
          text: colorData.text,
        };
      })
      .filter((item) => item.value > 0 && item.label && !isHiddenStatus(item.label));
  }, [data]);

  const dateRangeText = dateRangeLabel ? ` (${dateRangeLabel})` : "";
  const displayData = chartData;
  const ringOrder = ["Adopted", "Not Started", "In Progress", "Completed", "Rework", "Approved", "Paused", "Cancelled"];

  const ringData = useMemo(() => 
    ringOrder.map((label) => displayData.find((item) => item.label === label)).filter(Boolean)
  , [displayData]);
  const hasData = displayData.length > 0;

  const activeIdx = pinnedIdx ?? hoveredIdx;
  const activeSegment = ringData[activeIdx];
  const total = ringData.reduce((acc, curr) => acc + curr.value, 0);

  const size = 320;
  const radius = 90;
  const strokeWidth = 36;
  const chartRotation = -90;

  const getPoint = (r, angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: size/2 + r * Math.cos(rad),
      y: size/2 + r * Math.sin(rad)
    };
  };

  const createSectorPath = (startA, endA, innerR, outerR) => {
    const sO = getPoint(outerR, startA);
    const eO = getPoint(outerR, endA);
    const sI = getPoint(innerR, startA);
    const eI = getPoint(innerR, endA);
    const largeArc = endA - startA <= 180 ? 0 : 1;
    return [`M ${sO.x} ${sO.y}`, `A ${outerR} ${outerR} 0 ${largeArc} 1 ${eO.x} ${eO.y}`, `L ${eI.x} ${eI.y}`, `A ${innerR} ${innerR} 0 ${largeArc} 0 ${sI.x} ${sI.y}`, "Z"].join(" ");
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-white dark:bg-[#1A1125] rounded-xl md:rounded-2xl px-4 md:px-8 py-7 border border-[#E7E2F4] dark:border-nav-highlight/15 flex flex-col md:gap-8 shadow-[0_12px_45px_-12px_rgba(85,46,142,0.08)]">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="w-32 h-6 rounded-md" />
        </div>
        <div className="md:flex items-center justify-between gap-8 flex-1 mt-4 md:mt-0">
          <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mx-auto md:mx-0">
            <Skeleton className="w-52 h-52 rounded-full border-[30px] border-slate-100 dark:border-white/5 bg-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Skeleton className="w-16 h-3 rounded-full mb-2" />
              <Skeleton className="w-12 h-8 rounded-full" />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-5 mt-8 md:mt-0 px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-3.5 h-3.5 rounded-full" />
                  <Skeleton className="w-24 h-4 rounded-md" />
                </div>
                <Skeleton className="w-8 h-4 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-[#1A1125] rounded-xl md:rounded-2xl p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-[#E7E2F4] dark:border-nav-highlight/15 flex flex-col md:gap-8 shadow-[0_12px_45px_-12px_rgba(85,46,142,0.08)] overflow-hidden">
      <div className="flex items-center gap-2.5 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5">
        <div className="w-2.5 h-2.5 lg:h-1 xl:h-1.5 2xl:h-2 3xl:h-2.5 lg:w-1 xl:w-1.5 2xl:w-2 3xl:w-2.5 rounded-full bg-[#5B2DA3] dark:bg-[#A88CD5] shadow-[0_0_10px_rgba(91,45,163,0.3)]" />
        <h3 className="text-xs lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base font-bold text-[#1E1E1E] dark:text-gray-200 tracking-tight">Status Summary</h3>
      </div>

      {hasData ? (
        <div className="md:flex items-center justify-between gap-8 flex-1">
          <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
            <defs>
              <filter id="statusActiveShadow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                <feOffset dx="0" dy="6" result="offsetblur" />
                <feComponentTransfer><feFuncA type="linear" slope="0.15" /></feComponentTransfer>
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {ringData.map((item, idx) => {
              const isActive = activeIdx === idx;
              const ir = radius - strokeWidth/2;
              const or = isActive ? radius + strokeWidth/2 + 12 : radius + strokeWidth/2;
              
              const startAngle = (idx === 0 ? 0 : ringData.slice(0, idx).reduce((acc, s) => acc + (s.value/total)*360, 0)) + chartRotation;
              const endAngle = startAngle + (item.value/total)*360;

              return (
                <g 
                   key={idx} 
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setPinnedIdx((prev) => (prev === idx ? null : idx))}
                  className="cursor-pointer"
                >
                  <motion.path
                    d={createSectorPath(startAngle, endAngle, ir, or)}
                    fill={item.color}
                    initial={false}
                    animate={{
                      fillOpacity: activeIdx === null || isActive ? 1 : 0.4,
                      filter: isActive ? "url(#statusActiveShadow)" : "none",
                    }}
                    transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    className="stroke-white dark:stroke-[#1A1125]"
                    strokeWidth="2"
                  />
                  <AnimatePresence>
                    {isActive && (
                      <motion.path
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        exit={{ opacity: 0 }}
                        d={`M ${getPoint(or + 6, startAngle).x} ${getPoint(or + 6, startAngle).y} A ${or + 6} ${or + 6} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${getPoint(or + 6, endAngle).x} ${getPoint(or + 6, endAngle).y}`}
                        fill="none"
                        stroke={item.text}
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="dark:opacity-80"
                      />
                    )}
                  </AnimatePresence>
                </g>
              );
            })}

            <AnimatePresence mode="wait">
              {activeSegment ? (
                <motion.g
                  key={`active-${activeIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <text x={size/2} y={size/2 - 12} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    {activeSegment.label}
                  </text>
                  <text x={size/2} y={size/2 + 14} textAnchor="middle" className="text-[28px] font-black" style={{ fill: activeSegment.text }}>
                    {activeSegment.value}
                  </text>
                  <text x={size/2} y={size/2 + 34} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[11px] font-bold">
                    {((activeSegment.value / total) * 100).toFixed(1)}%
                  </text>
                </motion.g>
              ) : (
                <motion.g
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <text x={size/2} y={size/2 - 6} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-50">
                    Grand Total
                  </text>
                  <text x={size/2} y={size/2 + 18} textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-[20px] font-black">
                    {total}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>

        <div className="flex-1 flex flex-col gap-4 xl:pl-0 2xl:pl-20 3xl:pl-36 pr-1">
          {displayData.map((item) => {
            const segmentIndex = ringData.findIndex((segment) => segment.label === item.label);
            const isActive = activeIdx !== null && activeIdx === segmentIndex;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between w-full cursor-pointer group"
                onMouseEnter={() => setHoveredIdx(segmentIndex)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setPinnedIdx((prev) => (prev === segmentIndex ? null : segmentIndex))}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                  <span
                    className="text-body font-semibold transition-opacity duration-200"
                    style={{ color: item.text, opacity: isActive || activeIdx === null ? 1 : 0.6 }}
                  >
                    {item.label}
                  </span>
                </div>
                <span className="text-body leading-none font-bold text-gray-800 dark:text-gray-300 tabular-nums pl-4">{item.value}</span>
              </div>
            );
          })}
        </div>
        </div>
      ) : (
        <div className="flex min-h-[260px] items-center justify-center px-6 text-center">
          <p className="w-90 text-md lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-md font-medium text-gray-600 dark:text-gray-300">No status summary data found for the selected date range {dateRangeText}.</p>
        </div>
      )}
    </div>
  );
};

export default StatusPieChart;
