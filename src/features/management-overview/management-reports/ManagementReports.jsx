import React from "react";
import { useMainDashboard } from "@/hooks/useMainDashboard";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { hasPermission } from "@/lib/utils";
import { projectService } from "@/services/projectService";
import MetricCard from "../shared/MatricCard/MetricCard";
import { getManagementReportCards } from "../shared/MatricCard/sections";
import StatusBarChart from "./statusChart/StatusBarChart";
import StatusPieChart from "./statusChart/StatusPieChart";
import DateRangePicker from "../shared/DateRangePicker";

function ManagementReports() {
  const [dateRange, setDateRange] = React.useState({
    start: null,
    end: null,
  });

  const normalizeDateInput = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "object") {
      if (value.$d instanceof Date && !Number.isNaN(value.$d.getTime())) {
        return value.$d;
      }

      if (typeof value.toDate === "function") {
        const parsed = value.toDate();
        if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) {
          return parsed;
        }
      }

      if (
        Object.prototype.hasOwnProperty.call(value, "year") &&
        Object.prototype.hasOwnProperty.call(value, "month") &&
        Object.prototype.hasOwnProperty.call(value, "day")
      ) {
        const parsed = new Date(value.year, value.month - 1, value.day);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      }
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleDateRangeChange = (event) => {
    const nextValue = event?.target?.value || {};

    const startRaw =
      nextValue.start ??
      nextValue.from ??
      nextValue.startDate ??
      nextValue?.range?.start ??
      null;

    const endRaw =
      nextValue.end ??
      nextValue.to ??
      nextValue.endDate ??
      nextValue?.range?.end ??
      null;

    setDateRange({
      start: normalizeDateInput(startRaw) || null,
      end: normalizeDateInput(endRaw) || null,
    });
  };

  const {
    permissions,
    loading: permissionsLoading,
    error: permissionsError,
  } = useUserPermissions();
  const canReadDashboard = hasPermission(
    permissions,
    PERMISSIONS.DASHBOARD.READ,
  );
  const {
    data: metrics,
    isLoading,
    error,
  } = useMainDashboard({
    enabled:
      !permissionsLoading && (canReadDashboard || Boolean(permissionsError)),
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
  });
  const cards = React.useMemo(
    () => getManagementReportCards(metrics),
    [metrics],
  );

  const [isExporting, setIsExporting] = React.useState(false);
  const [isGeneratingBlankTemplate, setIsGeneratingBlankTemplate] = React.useState(false);
  const [isExportingApplicationFormula, setIsExportingApplicationFormula] = React.useState(false);

  const hasSelectedDateRange = Boolean(dateRange.start && dateRange.end);
  const hasMetricsData = React.useMemo(() => {
    if (!metrics) return false;

    const numericKeys = Object.keys(metrics).filter(
      (key) => typeof metrics[key] === "number",
    );
    const hasNumeric = numericKeys.some((key) => metrics[key] > 0);

    const arrayKeys = [
      metrics.projectPipelineDistribution,
      metrics.statusSummary,
      metrics.productionByDepartmentWeekly,
      metrics.productCategoryBreakdown,
    ];
    const hasArrayData = arrayKeys.some(
      (value) => Array.isArray(value) && value.length > 0,
    );

    return hasNumeric || hasArrayData;
  }, [metrics]);

  const shouldShowNoDataMessage =
    hasSelectedDateRange && !isLoading && !error && !hasMetricsData;

  if (!permissionsLoading && !permissionsError && !canReadDashboard) {
    return (
      <div className="p-6 text-center text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/50 m-6">
        <h3 className="text-lg font-semibold">
          You do not have permission to view the dashboard
        </h3>
        <p className="text-sm">
          Contact your administrator if you need access to these metrics.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/50 m-6">
        <h3 className="text-lg font-semibold">
          Failed to load dashboard metrics
        </h3>
        <p className="text-sm">{error?.message || "Please try again later"}</p>
      </div>
    );
  }

  const formatDateRange = (range) => {
    const startDate = normalizeDateInput(range?.start);
    const endDate = normalizeDateInput(range?.end);
    if (!startDate || !endDate) return "";
    const options = { day: "numeric", month: "long", year: "numeric" };
    const start = startDate.toLocaleDateString("en-GB", options);
    const end = endDate.toLocaleDateString("en-GB", options);
    return `${start} To ${end}`;
  };

  const selectedDateRangeLabel = formatDateRange(dateRange);

  const isOverallLoading = isLoading || permissionsLoading;
  const canExportPdf = hasPermission(
    permissions,
    PERMISSIONS.DASHBOARD.EXPORT_PDF,
  );

  const getDownloadFileName = () => {
    const date = new Date();
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return `management-report-${dateKey}.pdf`;
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start.toISOString();
      if (dateRange.end) params.endDate = dateRange.end.toISOString();

      const response = await projectService.exportMainDashboardPdf(params);
      const blob = new Blob([response.data], { type: "application/pdf" });
      downloadBlob(blob, getDownloadFileName());
    } catch (exportError) {
      console.error("Failed to export management report PDF:", exportError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBlankTemplate = async () => {
    try {
      setIsGeneratingBlankTemplate(true);
      const response = await projectService.exportMainDashboardBlankTemplatePdf();
      const blob = new Blob([response.data], { type: "application/pdf" });
      downloadBlob(blob, `management-report-blank-template-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (exportError) {
      console.error("Failed to export blank dashboard template PDF:", exportError);
    } finally {
      setIsGeneratingBlankTemplate(false);
    }
  };

  const handleExportApplicationFormulaTemplate = async () => {
    try {
      setIsExportingApplicationFormula(true);
      const response = await projectService.exportApplicationFormulaTemplatePdf();
      const blob = new Blob([response.data], { type: "application/pdf" });
      downloadBlob(blob, `application-formula-template-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (exportError) {
      console.error("Failed to export application formula template PDF:", exportError);
    } finally {
      setIsExportingApplicationFormula(false);
    }
  };

  return (
    <div className="px-0 pb-6 rounded-b-xl md:rounded-b-4xl md:overflow-y-auto custom-scrollbar min-h-full">
      {/* Mobile Header */}
      <div className="md:hidden bg-background dark:bg-[#0B0B0F] pt-2 -mt-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Main Dashboard
        </h1>
      </div>

      {/* Mobile Sticky Picker */}
      <div className="md:hidden sticky -top-5 z-30 bg-background dark:bg-[#0B0B0F] pt-4 pb-2">
        <div className="flex justify-center w-full">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>

      {/* Sticky Header Section */}
      <div className="hidden md:block sticky -top-2 z-30 bg-background dark:bg-[#0B0B0F] pt-2.5 pb-2 md:pb-6 -mt-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 3xl:gap-10 2xl:gap-8 xl:gap-6 lg:gap-4 w-full md:w-auto">
            <h1 className="md:block text-heading font-bold tracking-tight text-foreground">
              Main Dashboard
            </h1>
            <div className="flex justify-center md:block w-full md:w-auto">
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>
          </div>

          <div className="items-center gap-3 md:flex">
            {canExportPdf && (
              <>
                {/* <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExporting || isOverallLoading}
                  className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {isExporting ? "Exporting…" : "Export PDF"}
                </button>
                <button
                  type="button"
                  onClick={handleExportApplicationFormulaTemplate}
                  disabled={isExportingApplicationFormula || isOverallLoading}
                  className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {isExportingApplicationFormula ? "Exporting…" : "Formula Template"}
                </button> */}
                {/* <button
                  type="button"
                  onClick={handleExportBlankTemplate}
                  disabled={isGeneratingBlankTemplate || isOverallLoading}
                  className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {isGeneratingBlankTemplate ? "Generating…" : "Blank Template"}
                </button> */}
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-4 xl:gap-3 3xl:gap-7">
        <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-6 mt-4 md:mt-2">
          {cards.map((card, cardIdx) => (
            <MetricCard
              key={cardIdx}
              {...card}
              isLoading={isOverallLoading}
              patternIndex={cardIdx % 6}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4 lg:gap-4 xl:gap-5 3xl:gap-7 md:mt-5">
          <div className="xl:col-span-3">
            <StatusBarChart
              data={metrics?.projectPipelineDistribution}
              dateRangeLabel={selectedDateRangeLabel}
              isLoading={isOverallLoading}
            />
          </div>
          <div className="xl:col-span-2">
            <StatusPieChart
              data={metrics?.statusSummary}
              dateRangeLabel={selectedDateRangeLabel}
              isLoading={isOverallLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagementReports;
