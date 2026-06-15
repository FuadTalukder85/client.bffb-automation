import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ProductionPieChart Component
 * Displays product category breakdown as a high-fidelity donut chart.
 */
const ProductionPieChart = ({ metrics, isLoading, dateRangeLabel }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [pinnedIdx, setPinnedIdx] = useState(null);

  const rawData = metrics?.productCategoryBreakdown || [];

  // Process data from the API: metrics.productCategoryBreakdown
  const chartData = useMemo(() => {
    if (rawData.length === 0) return [];
    return rawData
      .sort((a, b) => (Number(b.recipeCount) || 0) - (Number(a.recipeCount) || 0))
      .map((item, idx) => ({
        label: item.categoryName || "Uncategorized",
        value: Number(item.recipeCount) || 0,
        color: [
          "#552E8E",
          "#A88CD5",
          "#D3C5EA",
          "#EBE4F6",
          "#F4F0FB",
        ][idx % 5] || "#F4F0FB"
      }));
  }, [rawData]);

  const total = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData]);
  const size = 260;
  const radius = 80;
  const strokeWidth = 38;
  const gap = 10; 
  const chartRotation = -40;

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const segments = useMemo(() => {
    const built = chartData.reduce(
      (acc, item, index) => {
        const startParam = acc.sum;
        const endParam = startParam + item.value;
        const startAngle = (startParam / total) * 360 + chartRotation;
        const endAngle = (endParam / total) * 360 + chartRotation;
        const midAngle = (startAngle + endAngle) / 2;
        const start = polarToCartesian(size / 2, size / 2, radius, startAngle);
        const end = polarToCartesian(size / 2, size / 2, radius, endAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return {
          sum: endParam,
          list: [
            ...acc.list,
            {
              ...item,
              index,
              path: [`M`, start.x, start.y, `A`, radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(" "),
              start,
              end,
              midAngle,
            },
          ],
        };
      },
      { sum: 0, list: [] }
    );

    return built.list;
  }, [chartData, total, chartRotation]);

  const dateRangeText = dateRangeLabel ? ` (${dateRangeLabel})` : "";
  const activeIdx = pinnedIdx ?? hoveredIdx;
  const activeSegment = segments[activeIdx];
  const hasData = chartData.length > 0 && total > 0;

  if (isLoading) {
    return (
      <div className="w-full h-100 bg-white dark:bg-[#1A1125] rounded-4xl p-8 animate-pulse flex flex-col md:gap-6">
        <div className="h-6 w-48 bg-gray-100 dark:bg-white/5 rounded-md" />
        <div className="flex-1 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-30 border-gray-50 dark:border-white/5 filter grayscale" />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full bg-white dark:bg-[#1A1125] rounded-xl md:rounded-2xl p-4 md:p-8 border border-primary/15 dark:border-nav-highlight/15 flex flex-col md:gap-6 font-jakarta h-full overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-invite-status-text" />
            <h3 className="text-[16px] font-bold text-gray-800 dark:text-gray-200 tracking-tight">
              Product Category Breakdown
            </h3>
          </div>
        </div>

        <div className="flex min-h-[260px] items-center justify-center px-6 text-center">
          <p className="w-120 text-md lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-md font-medium text-gray-600 dark:text-gray-300">No production category breakdown data found for the selected date range {dateRangeText}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#1A1125] rounded-xl md:rounded-2xl p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 border border-primary/15 dark:border-nav-highlight/15 flex flex-col md:gap-6 font-jakarta h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5">
          <div className="w-2.5 h-2.5 lg:h-1 xl:h-1.5 2xl:h-2 3xl:h-2.5 lg:w-1 xl:w-1.5 2xl:w-2 3xl:w-2.5 rounded-full bg-[#5B2DA3] dark:bg-[#A88CD5] shadow-[0_0_10px_rgba(91,45,163,0.3)]" />
          <h3 className="text-xs lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base font-bold text-[#1E1E1E] dark:text-gray-200 tracking-tight">
            Product Category Breakdown
          </h3>
        </div>
        {/* <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F1FF] dark:bg-primary-shade-2 text-invite-status-text cursor-pointer hover:bg-[#EDEBFF] transition-colors">
          <span className="text-[12px] font-bold">Week 1</span>
          <ChevronDown className="w-4 h-4" />
        </div> */}
      </div>

      {/* Content Area */}
      <div className="md:flex items-center justify-between gap-8 flex-1">
        <div className="relative w-64 h-64 flex items-center justify-center shrink-0 mx-auto md:mx-0 mb-6 md:mb-0">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
            <defs>
              <filter id="activeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dx="0" dy="4" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.2" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {segments.map((seg, idx) => {
              const isActive = activeIdx === idx;
              const ir = radius - strokeWidth / 2;
              const or = isActive ? radius + strokeWidth / 2 + 10 : radius + strokeWidth / 2;

              // Build high-fidelity sector path
              const getSectorPath = (startA, endA, innerR, outerR) => {
                const rad = (a) => (a * Math.PI) / 180;
                const sO = { x: size / 2 + outerR * Math.cos(rad(startA)), y: size / 2 + outerR * Math.sin(rad(startA)) };
                const eO = { x: size / 2 + outerR * Math.cos(rad(endA)), y: size / 2 + outerR * Math.sin(rad(endA)) };
                const sI = { x: size / 2 + innerR * Math.cos(rad(startA)), y: size / 2 + innerR * Math.sin(rad(startA)) };
                const eI = { x: size / 2 + innerR * Math.cos(rad(endA)), y: size / 2 + innerR * Math.sin(rad(endA)) };
                const largeArc = endA - startA <= 180 ? 0 : 1;

                return [
                  `M ${sO.x} ${sO.y}`,
                  `A ${outerR} ${outerR} 0 ${largeArc} 1 ${eO.x} ${eO.y}`,
                  `L ${eI.x} ${eI.y}`,
                  `A ${innerR} ${innerR} 0 ${largeArc} 0 ${sI.x} ${sI.y}`,
                  "Z"
                ].join(" ");
              };

              const startAngle = (seg.index === 0 ? 0 : segments.slice(0, seg.index).reduce((acc, s) => acc + (s.value / total) * 360, 0)) + chartRotation;
              const endAngle = startAngle + (seg.value / total) * 360;

              return (
                <g 
                  key={idx} 
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setPinnedIdx((prev) => (prev === idx ? null : idx))}
                  className="cursor-pointer"
                >
                  <motion.path
                    d={getSectorPath(startAngle, endAngle, ir, or)}
                    fill={seg.color}
                    initial={false}
                    animate={{
                      fillOpacity: activeIdx === null || isActive ? 1 : 0.45,
                      filter: isActive ? "url(#activeShadow)" : "none",
                    }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="stroke-white dark:stroke-[#1A1125]"
                    strokeWidth="1.5"
                  />

                  {/* Highlight Ring Anchor (Recharts Style) */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.path
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: 1, pathLength: 1 }}
                        exit={{ opacity: 0 }}
                        d={`M ${size / 2 + (or + 6) * Math.cos((startAngle * Math.PI) / 180)} ${size / 2 + (or + 6) * Math.sin((startAngle * Math.PI) / 180)} A ${or + 6} ${or + 6} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${size / 2 + (or + 6) * Math.cos((endAngle * Math.PI) / 180)} ${size / 2 + (or + 6) * Math.sin((endAngle * Math.PI) / 180)}`}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}
                  </AnimatePresence>
                </g>
              );
            })}

            {/* Center Information Overlay */}
            <AnimatePresence mode="wait">
              {activeSegment ? (
                <motion.g
                  key={`active-${activeIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <text x={size/2} y={size/2 - 10} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[10px] font-bold uppercase tracking-wider">
                    {activeSegment.label}
                  </text>
                  <text x={size/2} y={size/2 + 12} textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-[24px] font-black" style={{ fill: activeSegment.color }}>
                    {activeSegment.value}
                  </text>
                  <text x={size/2} y={size/2 + 30} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[11px] font-bold">
                    {((activeSegment.value / total) * 100).toFixed(1)}%
                  </text>
                </motion.g>
              ) : (
                <motion.g
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <text x={size/2} y={size/2 - 5} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[9px] font-bold uppercase tracking-widest opacity-60">
                    Grand Total
                  </text>
                  <text x={size/2} y={size/2 + 18} textAnchor="middle" className="fill-gray-800 dark:fill-gray-200 text-[18px] font-black">
                    {total}
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>


        {/* Legend */}
        <div className="flex-1 flex flex-col gap-4 xl:pl-0 2xl:pl-16 3xl:pl-36 pr-1">
          {segments.map((item) => (
            <div 
              key={item.label} 
              className="flex items-center justify-between w-full group cursor-pointer p-0.5"
              onMouseEnter={() => setHoveredIdx(item.index)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setPinnedIdx((prev) => (prev === item.index ? null : item.index))}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span
                  className="text-body font-semibold transition-opacity text-gray-700 dark:text-gray-400"
                  style={{ opacity: activeIdx === null || activeIdx === item.index ? 1 : 0.5 }}
                >
                  {item.label}
                </span>
              </div>
              <span
                className="text-body font-bold transition-opacity tabular-nums text-gray-800 dark:text-gray-200"
                style={{ opacity: activeIdx === null || activeIdx === item.index ? 1 : 0.5 }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProductionPieChart;

