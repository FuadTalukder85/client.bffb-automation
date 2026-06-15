import React from "react";
import { cn } from "@/lib/utils";

export default function MobileSOPAnalytics({ data, format, isEditMode = false, onChange }) {
  const isBakery = format === "bakery";

  const {
    benchmark = {},
    parameters = { analyticalReport: [] },
    procedureParameters = { analyticalReport: [] },
    others = "",
    productDevelopmentFeedback = "",
    procedure = { steps: [] },
    ovenTemperature,
    afterBake,
    afterBakeOthers = "",
    sensoryFeedback = "",
  } = data || {};

  // Build tunnel baking data from ovenTemperature if available
  const tunnelBaking = isBakery && ovenTemperature?.tunnelBaking ? {
    zones: [
      ...(ovenTemperature.tunnelBaking.zones || []).map((zone, zIdx) => ({
        title: `${zIdx + 1}${zIdx === 0 ? 'st' : zIdx === 1 ? 'nd' : 'rd'} Zone`,
        rows: [
          { label: zone.label === "Top Temperature" ? "Top Temperature" : zone.label, value: zone[`zone${zIdx + 1}`] || zone.zone1 || "", unit: zone.unit || "°C" },
        ],
      })),
      ...(ovenTemperature.tunnelBaking.zones || []).length > 0 ? [{
        title: "",
        rows: [
          { label: "Baking Time", value: ovenTemperature.tunnelBaking.bakingTime?.value || "", unit: ovenTemperature.tunnelBaking.bakingTime?.unit || "min" },
          { label: "Belt Speed", value: ovenTemperature.tunnelBaking.beltSpeed?.value || "", unit: "" },
        ],
      }] : [],
    ],
  } : { zones: [] };

  // Build normal baking data
  const normalBaking = isBakery && ovenTemperature?.normalBaking ? {
    zones: (ovenTemperature.normalBaking.bakings || []).map((baking, bIdx) => ({
      title: `${bIdx + 1}${bIdx === 0 ? 'st' : 'nd'} Baking`,
      rows: [
        { label: baking.label, value: baking[`baking${bIdx + 1}`] || baking.baking1 || "", unit: baking.unit || "" },
      ],
    })),
  } : { zones: [] };

  // Build batch summary (afterBake)
  const batchSummaryTable = isBakery ? (afterBake?.analyticalReport || []) : [];

  const handleInputChange = (section, field, value, extra) => {
    const updatedData = { ...data };

    if (section === "benchmark") {
      updatedData.benchmark = { ...benchmark, [field]: value };
    } else if (section === "parameters") {
      const reportIndex = parameters.analyticalReport.findIndex(p => p.label === field);
      if (reportIndex !== -1) {
        updatedData.parameters = {
          ...parameters,
          analyticalReport: parameters.analyticalReport.map((p, i) => 
            i === reportIndex ? { ...p, value } : p
          )
        };
      }
    } else if (section === "procedureParameters") {
      const reportIndex = (procedureParameters.analyticalReport || []).findIndex(p => p.label === field);
      if (reportIndex !== -1) {
        updatedData.procedureParameters = {
          ...procedureParameters,
          analyticalReport: procedureParameters.analyticalReport.map((p, i) =>
            i === reportIndex ? { ...p, value } : p
          ),
        };
      }
    } else if (section === "others") {
      updatedData.others = value;
    } else if (section === "productDevelopmentFeedback") {
      updatedData.productDevelopmentFeedback = value;
    } else if (section === "afterBake") {
      const reportIndex = afterBake.analyticalReport.findIndex(p => p.label === field);
      if (reportIndex !== -1) {
        updatedData.afterBake = {
          ...afterBake,
          analyticalReport: afterBake.analyticalReport.map((p, i) => 
            i === reportIndex ? { ...p, value } : p
          )
        };
      }
    } else if (section === "afterBakeOthers") {
      updatedData.afterBakeOthers = value;
    } else if (section === "sensoryFeedback") {
      updatedData.sensoryFeedback = value;
    } else if (section === "tunnelBaking") {
      const tb = { ...ovenTemperature.tunnelBaking };
      if (field === "Baking Time") {
        tb.bakingTime = { ...tb.bakingTime, value };
      } else if (field === "Belt Speed") {
        tb.beltSpeed = { ...tb.beltSpeed, value };
      } else {
        // Zone entries: field = Top Temperature or Bottom Temperature
        // extra = zone number (1, 2, 3)
        const zoneIndex = tb.zones.findIndex(z => z.label === field);
        if (zoneIndex !== -1) {
          const updatedZones = [...tb.zones];
          updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], [`zone${extra}`]: value };
          tb.zones = updatedZones;
        }
      }
      updatedData.ovenTemperature = { ...ovenTemperature, tunnelBaking: tb };
    } else if (section === "normalBaking") {
      const nb = { ...ovenTemperature.normalBaking };
      const bakingIndex = nb.bakings.findIndex(b => b.label === field);
      if (bakingIndex !== -1) {
        const updatedBakings = [...nb.bakings];
        updatedBakings[bakingIndex] = { ...updatedBakings[bakingIndex], [`baking${extra}`]: value };
        nb.bakings = updatedBakings;
      }
      updatedData.ovenTemperature = { ...ovenTemperature, normalBaking: nb };
    }

    onChange?.(updatedData);
  };

  return (
    <div className="flex flex-col w-full gap-8 py-4">
      {/* 1. Benchmark Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Benchmark</h2>
        <FeedbackBlock 
            title="Sensory Feedback" 
            content={benchmark.sensoryFeedback || ""}
            isEditMode={isEditMode}
            onChange={(val) => handleInputChange("benchmark", "sensoryFeedback", val)}
        />
      </div>

      {/* 2. Parameters Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Parameters</h2>
        <SummaryTable 
          title="Analytical Report" 
          rows={parameters.analyticalReport || []} 
          isEditMode={isEditMode}
          onChange={(label, val) => handleInputChange("parameters", label, val)}
        />
      </div>

      {/* 3. Procedure Parameters */}
      {procedureParameters?.analyticalReport?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-base-color px-0.5">Procedure Parameters</h2>
          <SummaryTable
            rows={procedureParameters.analyticalReport}
            isEditMode={isEditMode}
            onChange={(label, val) => handleInputChange("procedureParameters", label, val)}
          />
        </div>
      )}

      {/* 4. Oven Temperature Section (Bakery) */}
      {isBakery && (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Oven Temperature</h2>
        <NestedSummaryTable 
            title="Tunnel Baking" 
            data={tunnelBaking} 
            isEditMode={isEditMode}
            onChange={(label, val, zoneNum) => handleInputChange("tunnelBaking", label, val, zoneNum)}
        />
      </div>
      )}

      {/* 5. Normal Baking Section (Bakery) */}
      {isBakery && (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-base-color px-0.5 tracking-tight">Normal Baking</h2>
        <NestedSummaryTable 
            data={normalBaking} 
            isEditMode={isEditMode}
            onChange={(label, val, bakingNum) => handleInputChange("normalBaking", label, val, bakingNum)}
        />
      </div>
      )}

      {/* 6. Batch Summary Section (Bakery) */}
      {isBakery && (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Batch Summary</h2>
        <SummaryTable 
          rows={batchSummaryTable} 
          isEditMode={isEditMode}
          onChange={(label, val) => handleInputChange("afterBake", label, val)}
        />
      </div>
      )}

      {/* 6. Others */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Others</h2>
        <FeedbackBlock 
            content={others || ""}
            isEditMode={isEditMode}
            onChange={(val) => handleInputChange("others", null, val)}
        />
      </div>

      {/* 7. Product Development Feedback */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Product Development Feedback</h2>
        <FeedbackBlock 
            content={productDevelopmentFeedback || ""}
            isEditMode={isEditMode}
            onChange={(val) => handleInputChange("productDevelopmentFeedback", null, val)}
        />
      </div>

      {/* 8. Procedure Section */}
      <div className="space-y-4 pb-4">
        <h2 className="text-sm font-bold text-base-color px-0.5">Procedure</h2>
        <FeedbackBlock 
            title="Standard Operating Procedure" 
            content={procedure.raw || (procedure.steps || []).join('\n')}
            isEditMode={isEditMode}
            onChange={(val) => {
              const updatedData = { ...data };
              updatedData.procedure = {
                ...procedure,
                raw: val,
                steps: val.split('\n')
              };
              onChange?.(updatedData);
            }}
        />
      </div>
    </div>
  );
}

function FeedbackBlock({ title, content, isEditMode, onChange }) {
    const commonClasses = "w-full p-4 rounded-2xl text-xs font-medium leading-relaxed transition-all h-[150px] overflow-y-auto";
    const backgroundClasses = "bg-primary-shade-2 border border-nav-highlight/20";

    return (
        <div className="space-y-3">
            {title && (
                <h3 className="text-[11px] font-bold text-lighter-text px-0.5 uppercase tracking-wider">
                    {title}
                </h3>
            )}
            {isEditMode ? (
                <textarea 
                    className={cn(
                        commonClasses,
                        backgroundClasses,
                        "text-base-color resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-shadow"
                    )}
                    defaultValue={content}
                    onChange={(e) => onChange?.(e.target.value)}
                />
            ) : (
                <div className={cn(commonClasses, backgroundClasses)}>
                    <p className="text-base-color italic opacity-80 leading-relaxed font-medium">
                        {content}
                    </p>
                </div>
            )}
        </div>
    );
}

function SummaryTable({ title, rows, isEditMode, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h3 className="text-xs font-bold text-lighter-text px-0.5 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="overflow-hidden border border-border rounded-xl bg-white dark:bg-background shadow-sm">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, idx) => (
              <tr 
                key={idx} 
                className={cn(
                  "border-border h-[46px]", 
                  idx < rows.length - 1 && "border-b"
                )}
              >
                <td className="w-[45%] px-4 text-[13px] text-lighter-text font-medium bg-white dark:bg-background leading-normal">
                  {row.label}
                </td>
                <td className="w-[55%] px-4 text-[13px] text-base-color font-bold border-l border-border bg-white dark:bg-background leading-normal">
                  <div className="flex items-center justify-between gap-2 h-full">
                    {isEditMode ? (
                        <input 
                            type="text"
                            className="w-full bg-transparent border-none p-1 focus:ring-1 focus:ring-primary/40 rounded-sm focus:outline-none text-[13px] font-bold h-full transition-shadow"
                            defaultValue={row.value}
                            onChange={(e) => onChange?.(row.label, e.target.value)}
                        />
                    ) : (
                        <span className="flex items-center">{row.value}</span>
                    )}
                    {row.unit && (
                      <span className="text-[11px] text-lighter-text font-bold">
                        {row.unit}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NestedSummaryTable({ title, data, isEditMode, onChange }) {
    return (
        <div className="flex flex-col gap-3">
            {title && (
                <h3 className="text-xs font-bold text-lighter-text px-0.5 uppercase tracking-wider">
                    {title}
                </h3>
            )}
            <div className="overflow-hidden border border-border rounded-xl bg-white dark:bg-background shadow-sm">
                <table className="w-full border-collapse">
                    <tbody>
                        {data.zones.map((zone, zIdx) => {
                            // Extract numeric part from title (e.g. "1st Zone" -> 1)
                            const num = parseInt(zone.title) || 1;
                            
                            return (
                            <React.Fragment key={zIdx}>
                                {/* Zone Header Row */}
                                {zone.title && (
                                    <tr className={cn("bg-primary/5 h-[34px]", zIdx > 0 && "border-t border-border")}>
                                        <td colSpan={2} className="px-4 text-center">
                                            <span className="text-[11px] font-bold text-base-color uppercase tracking-widest">{zone.title}</span>
                                        </td>
                                    </tr>
                                )}
                                {zone.rows.map((row, rIdx) => (
                                    <tr 
                                        key={rIdx} 
                                        className={cn(
                                            "border-t border-border h-[46px]",
                                        )}
                                    >
                                        <td className="w-[45%] px-4 text-[13px] text-lighter-text font-medium bg-white dark:bg-background leading-normal">
                                            {row.label}
                                        </td>
                                        <td className="w-[55%] px-4 text-[13px] text-base-color font-bold border-l border-border bg-white dark:bg-background leading-normal">
                                            <div className="flex items-center justify-between gap-2 h-full">
                                                {isEditMode ? (
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-transparent border-none p-1 focus:ring-1 focus:ring-primary/40 rounded-sm focus:outline-none text-[13px] font-bold h-full transition-shadow"
                                                        defaultValue={row.value}
                                                        onChange={(e) => onChange?.(row.label, e.target.value, num)}
                                                    />
                                                ) : (
                                                    <span className="flex items-center">{row.value}</span>
                                                )}
                                                {row.unit && (
                                                <span className="text-[11px] text-lighter-text font-bold">
                                                    {row.unit}
                                                </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
