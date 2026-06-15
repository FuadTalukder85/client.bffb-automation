import React, { useMemo, useState } from "react";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  PauseCircle, 
  XSquare, 
  PieChart, 
  Send, 
  FlaskConical, 
  CheckCircle,
  TrendingUp,
  Package
} from "lucide-react";
import { useMainDashboard } from "@/hooks/useMainDashboard";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { Skeleton } from "@/components/ui/Skeleton";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { cn, hasPermission } from "@/lib/utils";

/**
 * Metric Card Component
 */
function MetricCard({ title, value, icon: IconComponent, description, isLoading, colorClass }) {
  const iconElement = IconComponent ? <IconComponent className="w-5 h-5" /> : null;

  return (
    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn("p-2 rounded-lg", colorClass)}>
          {iconElement}
        </div>
      </div>
      <div className="flex flex-col">
        {isLoading ? (
          <Skeleton className="h-8 w-16 my-1" />
        ) : (
          <span className="text-2xl font-bold">{value}</span>
        )}
        <span className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{description}</span>
      </div>
    </div>
  );
}

const CHART_COLORS = [
  "#5a2ea6",
  "#8f72c2",
  "#b19bd6",
  "#cdbfe4",
  "#e0d6ee",
  "#7c56b7",
  "#9e86ca",
  "#beaedc",
  "#d8cdea",
  "#ebe4f3",
];

function ChartCard({ title, icon: IconComponent, rightSlot, children }) {
  const iconElement = IconComponent ? <IconComponent className="h-4 w-4 text-primary" /> : null;

  return (
    <div className="rounded-3xl border border-nav-highlight/20 bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {iconElement}
          <h3 className="text-[1.08rem] font-semibold text-foreground">{title}</h3>
        </div>
        {rightSlot ? <div>{rightSlot}</div> : null}
      </div>
      {children}
    </div>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartRowsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="space-y-2.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

function getColorByIndex(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

function ProjectPipelineDistribution({ data }) {
  if (!data.length) {
    return <EmptyChartState message="No project distribution data found for the selected date range." />;
  }

  const maxCount = Math.max(1, ...data.map((entry) => Number(entry.count) || 0));

  return (
    <div className="space-y-2">
      {data.map((entry, idx) => {
        const count = Number(entry.count) || 0;
        const widthPercent = Math.round((count / maxCount) * 100);
        return (
          <div key={`${entry.status || idx}`} className="space-y-1">
            <div className="flex justify-between text-sm font-medium text-foreground">
              <span>{entry.status || "Unknown"}</span>
              <span>{count}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusSummaryPie({ data }) {
  const safeData = Array.isArray(data) ? data : [];

  if (!safeData.length) {
    return <EmptyChartState message="No status summary data found for the selected date range." />;
  }

  const total = safeData.reduce((sum, entry) => sum + (Number(entry.count) || 0), 0);
  if (total === 0) {
    return <EmptyChartState message="No status summary data found for the selected date range." />;
  }

  const normalizedPieData = safeData.reduce(
    (acc, entry, idx) => {
      const value = Number(entry.count) || 0;
      const percent = total ? (value / total) * 100 : 0;
      const start = acc.current;
      const end = start + percent;

      acc.stops.push(`${CHART_COLORS[idx % CHART_COLORS.length]} ${start}% ${end}%`);
      acc.current = end;
      return acc;
    },
    { current: 0, stops: [] }
  );

  const gradientStopsString = normalizedPieData.stops.join(", ");

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
      <div className="mx-auto h-[180px] w-[180px]">
        <div
          className="relative h-full w-full rounded-full"
          style={{
            backgroundImage: `conic-gradient(${gradientStopsString || `${CHART_COLORS[0]} 0% 100%`})`,
          }}
        >
          <div className="absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card" />
        </div>
      </div>
      <div className="space-y-2">
        {safeData.map((entry, idx) => {
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          return (
            <div key={`${entry.status || idx}`} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{entry.status || "Unknown"}</span>
              </div>
              <span>{entry.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductionDepartmentChart({ weeklyData, categoryNames, categoryColorMap }) {
  if (!weeklyData.length) {
    return <EmptyChartState message="No weekly production data found for the selected date range." />;
  }

  const maxValue = weeklyData.reduce((max, week) => {
    return categoryNames.reduce((acc, categoryName) => {
      const currentCount = Number(week.categoryCounts?.[categoryName]) || 0;
      return Math.max(acc, currentCount);
    }, max);
  }, 0);

  const roundedMax = Math.max(5, Math.ceil(maxValue / 5) * 5);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(roundedMax * ratio));

  const chartWidth = 860;
  const chartHeight = 350;
  const margin = { top: 15, right: 20, bottom: 58, left: 58 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;

  const groupWidth = plotWidth / Math.max(weeklyData.length, 1);
  const groupPadding = 22;
  const barsPerGroup = Math.max(categoryNames.length, 1);
  const innerAvailableWidth = Math.max(20, groupWidth - groupPadding);
  const barGap = barsPerGroup <= 6 ? 4 : 3;
  const rawBarWidth = (innerAvailableWidth - barGap * (barsPerGroup - 1)) / barsPerGroup;
  const barWidth = Math.max(6, Math.min(18, rawBarWidth));
  const usedWidth = barsPerGroup * barWidth + (barsPerGroup - 1) * barGap;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        {categoryNames.map((name) => (
          <div key={name} className="flex items-center gap-2 text-xs text-foreground/90">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: categoryColorMap[name] || CHART_COLORS[0] }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-[330px] min-w-[720px] w-full"
          role="img"
          aria-label="Production by department weekly chart"
        >
          {yTicks.map((tickValue) => {
            const ratio = roundedMax > 0 ? tickValue / roundedMax : 0;
            const y = margin.top + plotHeight - ratio * plotHeight;

            return (
              <g key={`grid-${tickValue}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
                <text
                  x={margin.left - 14}
                  y={y + 4}
                  fill="currentColor"
                  opacity="0.5"
                  fontSize="12"
                  textAnchor="end"
                >
                  {tickValue}
                </text>
              </g>
            );
          })}

          {weeklyData.map((week, weekIndex) => {
            const groupLeft = margin.left + weekIndex * groupWidth + (groupWidth - usedWidth) / 2;

            return (
              <g key={week.key}>
                {categoryNames.map((categoryName, categoryIndex) => {
                  const value = Number(week.categoryCounts?.[categoryName]) || 0;
                  const height = roundedMax > 0 ? (value / roundedMax) * plotHeight : 0;
                  const x = groupLeft + categoryIndex * (barWidth + barGap);
                  const y = margin.top + plotHeight - height;

                  return (
                    <g key={`${week.key}-${categoryName}`}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        rx="4"
                        fill={categoryColorMap[categoryName] || CHART_COLORS[0]}
                      >
                        <title>{`${categoryName}: ${value}`}</title>
                      </rect>
                    </g>
                  );
                })}

                <text
                  x={margin.left + weekIndex * groupWidth + groupWidth / 2}
                  y={chartHeight - 20}
                  fill="currentColor"
                  opacity="0.65"
                  fontSize="13"
                  textAnchor="middle"
                >
                  {`Week ${week.weekNumber}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function ProductCategoryDonut({ data, categoryColorMap }) {
  const safeData = Array.isArray(data) ? data : [];

  if (!safeData.length) {
    return <EmptyChartState message="No product category data found for the selected date range." />;
  }

  const sortedData = [...safeData].sort((a, b) => {
    const aValue = Number(a?.recipeCount) || 0;
    const bValue = Number(b?.recipeCount) || 0;
    return bValue - aValue;
  });

  const total = sortedData.reduce((sum, item) => sum + (Number(item?.recipeCount) || 0), 0);
  const donutStops = sortedData
    .reduce(
      (acc, item) => {
        const categoryName = item?.categoryName || "Uncategorized";
        const value = Number(item?.recipeCount) || 0;
        const start = acc.current;
        const segmentPercent = total > 0 ? (value / total) * 100 : 0;
        const end = start + segmentPercent;
        const color = categoryColorMap[categoryName] || CHART_COLORS[0];

        acc.stops.push(`${color} ${start}% ${end}%`);
        acc.current = end;
        return acc;
      },
      { current: 0, stops: [] }
    );

  const donutGradient = Array.isArray(donutStops.stops) ? donutStops.stops.join(", ") : "";

  return (
    <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-center">
      <div className="mx-auto h-[210px] w-[210px]">
        <div
          className="relative h-full w-full rounded-full"
          style={{
            backgroundImage: `conic-gradient(${donutGradient || `${CHART_COLORS[0]} 0% 100%`})`,
          }}
        >
          <div className="absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card" />
        </div>
      </div>

      <div className="space-y-4">
        {sortedData.map((item) => {
          const categoryName = item?.categoryName || "Uncategorized";
          const value = Number(item?.recipeCount) || 0;

          return (
            <div key={item?.categoryId || categoryName} className="flex items-center justify-between gap-4 text-[1.02rem]">
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: categoryColorMap[categoryName] || CHART_COLORS[0] }}
                />
                <span className="font-semibold text-foreground/95">{categoryName}</span>
              </div>
              <span className="font-semibold text-foreground/90">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectOverview() {
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });

  const { permissions, loading: permissionsLoading, error: permissionsError } = useUserPermissions();
  const canReadDashboard = hasPermission(permissions, PERMISSIONS.DASHBOARD.READ);
  const { data: metrics, isLoading, error } = useMainDashboard({
    enabled: !permissionsLoading && (canReadDashboard || Boolean(permissionsError)),
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
  });

  const handleDateRangeChange = (event) => {
    const nextValue = event?.target?.value || {};
    setDateRange({
      start: nextValue.start || null,
      end: nextValue.end || null,
    });
  };

  const clearDateRange = () => {
    setDateRange({ start: null, end: null });
  };

  const productCategoryBreakdown = metrics?.productCategoryBreakdown || [];
  const productionByDepartmentWeekly = metrics?.productionByDepartmentWeekly || [];
  const projectPipelineDistribution = metrics?.projectPipelineDistribution || [];
  const statusSummary = metrics?.statusSummary || [];

  const categoryNames = useMemo(() => {
    const orderedNames = [];
    const nameSet = new Set();

    for (const item of productCategoryBreakdown) {
      if (!item?.categoryName || nameSet.has(item.categoryName)) {
        continue;
      }

      orderedNames.push(item.categoryName);
      nameSet.add(item.categoryName);
    }

    for (const item of productionByDepartmentWeekly) {
      if (!item?.categoryName || nameSet.has(item.categoryName)) {
        continue;
      }

      orderedNames.push(item.categoryName);
      nameSet.add(item.categoryName);
    }

    return orderedNames;
  }, [productCategoryBreakdown, productionByDepartmentWeekly]);

  const categoryColorMap = useMemo(() => {
    return categoryNames.reduce((acc, name, idx) => {
      acc[name] = getColorByIndex(idx);
      return acc;
    }, {});
  }, [categoryNames]);

  const weeklyProductionChartData = useMemo(() => {
    const bucket = new Map();

    for (const row of productionByDepartmentWeekly) {
      const weekYear = Number(row?.weekYear) || 0;
      const weekNumber = Number(row?.weekNumber) || 0;
      const sampleCount = Number(row?.sampleCount) || 0;
      const categoryName = row?.categoryName || "Uncategorized";
      const key = `${weekYear}-${String(weekNumber).padStart(2, "0")}`;

      if (!bucket.has(key)) {
        bucket.set(key, {
          key,
          weekYear,
          weekNumber,
          totalSamples: 0,
          categories: [],
        });
      }

      const weekData = bucket.get(key);
      weekData.totalSamples += sampleCount;
      weekData.categories.push({
        categoryName,
        sampleCount,
      });
    }

    return Array.from(bucket.values())
      .sort((a, b) => {
        if (a.weekYear !== b.weekYear) {
          return a.weekYear - b.weekYear;
        }
        return a.weekNumber - b.weekNumber;
      })
      .map((weekData) => ({
        ...weekData,
        categories: weekData.categories.sort((a, b) => b.sampleCount - a.sampleCount),
      }));
  }, [productionByDepartmentWeekly]);

  const weeklyDepartmentSeries = useMemo(() => {
    return weeklyProductionChartData.map((weekData) => {
      const categoryCounts = weekData.categories.reduce((acc, category) => {
        const categoryName = category?.categoryName || "Uncategorized";
        acc[categoryName] = Number(category?.sampleCount) || 0;
        return acc;
      }, {});

      return {
        key: weekData.key,
        weekNumber: weekData.weekNumber,
        categoryCounts,
      };
    });
  }, [weeklyProductionChartData]);

  if (!permissionsLoading && !permissionsError && !canReadDashboard) {
    return (
      <div className="p-6 text-center text-amber-700 bg-amber-50 rounded-lg border border-amber-200 m-6">
        <h3 className="text-lg font-semibold">You do not have permission to view the dashboard</h3>
        <p className="text-sm">Contact your administrator if you need access to these metrics.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg border border-red-200 m-6">
        <h3 className="text-lg font-semibold">Failed to load dashboard metrics</h3>
        <p className="text-sm">{error?.message || "Please try again later"}</p>
      </div>
    );
  }

  const sections = [
    {
      title: "Pipeline Overview",
      cards: [
        {
          title: "Active Projects",
          value: metrics?.activeClientProjects || 0,
          description: "Status NOT IN: Not Started, Paused, Lost, Adopted",
          icon: BarChart3,
          colorClass: "bg-blue-100 text-blue-600",
        },
        {
          title: "Active Campaigns",
          value: metrics?.activePromotionalProjects || 0,
          description: "Purpose: Campaign\nStatus NOT IN: Not Started, Paused, Lost, Adopted",
          icon: BarChart3,
          colorClass: "bg-amber-100 text-amber-600",
        },
        {
          title: "(Total) Number of Projects in Rework",
          value: metrics?.totalNumberOfProjectsInRework || 0,
          description: "Status NOT IN: Not Started, Completed, In Progress, Paused, Lost, Adopted, Approved",
          icon: TrendingUp,
          colorClass: "bg-indigo-100 text-indigo-600",
        },
        {
          title: "Adopted Projects",
          value: metrics?.approvedCommercial || 0,
          description: "Status: Adopted",
          icon: CheckCircle,
          colorClass: "bg-emerald-100 text-emerald-600",
        },
      ],
    },
    {
      title: "Key Totals",
      cards: [
        {
          title: "Total Production",
          value: metrics?.totalProduction || 0,
          description: "Count of total samples produced across all projects (within selected date range)",
          icon: Package,
          colorClass: "bg-slate-100 text-slate-600",
        },
        {
          title: "(Total) Sensory Tasted",
          value: metrics?.totalSensoryTasted || 0,
          description: "Count of sensory top sheets submitted across all projects (within selected date range)",
          icon: FlaskConical,
          colorClass: "bg-teal-100 text-teal-600",
        },
        {
          title: "(Total) Product Approvals",
          value: metrics?.totalProductApprovals || 0,
          description: "Count of projects where status is Approved",
          icon: CheckCircle,
          colorClass: "bg-emerald-100 text-emerald-600",
        },
        {
          title: "Average Project Duration (days)",
          value: Number(metrics?.avgDevTime || 0).toFixed(2),
          description: "From masterProject.startDate to masterProject.endDate or now",
          icon: Clock,
          colorClass: "bg-cyan-100 text-cyan-600",
        },
        {
          title: "(Total) Projects in Rework",
          value: metrics?.totalNumberOfProjectsInRework || 0,
          description: "Count of projects where status NOT IN: Not Started, Completed, In Progress, Paused, Lost, Adopted, Approved",
          icon: TrendingUp,
          colorClass: "bg-indigo-100 text-indigo-600",
        },
      ],
    },
    {
      title: "Development Stage",
      cards: [
        {
          title: "Client Forwarded (PD)",
          value: metrics?.clientProjectsInPD || 0,
          description: "Purpose: Client, Sent to PD\nNOT: Sent to AL/Sensory/Schedule",
          icon: Send,
          colorClass: "bg-purple-100 text-purple-600",
        },
        {
          title: "Campaign Forwarded (PD)",
          value: metrics?.promotionalProjectsInPD || 0,
          description: "Purpose: Campaign, Sent to PD\nNOT: Sent to AL/Sensory/Schedule",
          icon: Send,
          colorClass: "bg-pink-100 text-pink-600",
        },
        {
          title: "Sensory Approved",
          value: metrics?.totalSensoryApproval || 0,
          description: "Sensory Approval Date exists",
          icon: FlaskConical,
          colorClass: "bg-teal-100 text-teal-600",
        },
        {
          title: "BD Approved",
          value: metrics?.totalBdApproval || 0,
          description: "BD Approval Date exists",
          icon: CheckCircle2,
          colorClass: "bg-green-100 text-green-600",
        },
      ],
    },
    {
      title: "Status Monitoring",
      cards: [
        {
          title: "Not Started",
          value: metrics?.projectsNotStarted || 0,
          description: "Status: Not Started",
          icon: Clock,
          colorClass: "bg-slate-100 text-slate-600",
        },
        {
          title: "Paused",
          value: metrics?.projectPaused || 0,
          description: "Status: Paused",
          icon: PauseCircle,
          colorClass: "bg-orange-100 text-orange-600",
        },
        {
          title: "Not Feasible",
          value: metrics?.projectsNotSelected || 0,
          description: "Status: Not Feasible",
          icon: XSquare,
          colorClass: "bg-red-100 text-red-600",
        },
        {
          title: "Client Dispatches",
          value: metrics?.samplesForClients || 0,
          description: "Dispatch Type: Client",
          icon: Package,
          colorClass: "bg-cyan-100 text-cyan-600",
        },
      ],
    },
    {
      title: "Marketing",
      cards: [
        {
          title: "Selected for Promotion",
          value: metrics?.waitingForPromotion || 0,
          description: "Selected for Promotion: Yes",
          icon: PieChart,
          colorClass: "bg-violet-100 text-violet-600",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 p-6 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Project Overview</h1>
        <p className="text-muted-foreground">
          Real-time metrics and pipeline monitoring.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Date Range</h2>
          <p className="text-xs text-muted-foreground">Filter dashboard metrics by created date.</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="Select date range"
            />
          </div>
          <button
            type="button"
            onClick={clearDateRange}
            className="h-8 rounded-md border border-nav-highlight/30 px-3 text-xs text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground/80 border-b pb-2">{section.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.cards.map((card, cardIdx) => (
                <MetricCard key={cardIdx} {...card} isLoading={isLoading} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.35fr_1fr]">
        <ChartCard
          title="Production by Department"
          icon={TrendingUp}
        >
          {isLoading ? (
            <ChartRowsSkeleton />
          ) : (
            <ProductionDepartmentChart
              weeklyData={weeklyDepartmentSeries}
              categoryNames={categoryNames}
              categoryColorMap={categoryColorMap}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Product Category Breakdown"
          icon={PieChart}
          rightSlot={(
            <div className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              Overall
            </div>
          )}
        >
          {isLoading ? (
            <ChartRowsSkeleton />
          ) : (
            <ProductCategoryDonut
              data={productCategoryBreakdown}
              categoryColorMap={categoryColorMap}
            />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.35fr_1fr]">
        <ChartCard
          title="Project Pipeline Distribution"
          icon={BarChart3}
        >
          {isLoading ? (
            <ChartRowsSkeleton />
          ) : (
            <ProjectPipelineDistribution data={projectPipelineDistribution} />
          )}
        </ChartCard>

        <ChartCard
          title="Status Summary"
          icon={PieChart}
        >
          {isLoading ? (
            <ChartRowsSkeleton />
          ) : (
            <StatusSummaryPie data={statusSummary} />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

export default ProjectOverview;

