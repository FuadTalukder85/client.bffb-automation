import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const cardClass = (isEditMode) => cn(
  "rounded-xl transition-all min-h-[35px] lg:min-h-[41px] xl:min-h-[55px] 2xl:min-h-[61px] 3xl:min-h-[77px]",
  isEditMode 
    ? "bg-[#EEEBF4] dark:bg-primary/20" 
    : "bg-[#FCFBFD] dark:bg-primary/10 dark:border dark:border-primary/50"
);

const inputBoxClass = (editable = false) => cn(
  "px-4 h-5 lg:h-5 xl:h-6 2xl:h-7 3xl:h-8 flex items-center rounded-lg text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-900 dark:text-white transition-all w-full",
  editable 
    ? "bg-[#EEEBF4] dark:bg-primary/20 focus-within:ring-1 focus-within:ring-primary/20 h-5 lg:h-5 xl:h-6 2xl:h-7 3xl:h-8" 
    : ""
);

const inputClass = "w-full bg-transparent text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400 placeholder:font-normal";

const RenderEditableField = ({ label, value, unit, section, field, isTable = false, isEditMode, onInputChange }) => {
  return (
    <div className={cn("flex flex-1 items-center gap-4", !isTable && "py-1.5")}>
      {!isTable && <span className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3 truncate">{label}</span>}
      <div className={inputBoxClass(isEditMode)}>
        {isEditMode ? (
          <input
            type="text"
            className={cn(inputClass, "text-left")}
            value={value || ""}
            onChange={(e) => onInputChange(section, field || label, e.target.value)}
            placeholder=""
          />
        ) : (
          <span className="flex-1">{value || ""}</span>
        )}
        {(unit || isEditMode) && (
          <>
            
            <span className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-900 dark:text-gray-400 min-w-[2.5rem] text-right">
              {unit || ""}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to convert text to steps array
const textToStepsArray = (text) => {
  if (!text) return [];
  return text.split('\n');
};

export default function SOPAnalytics({ data, format, isEditMode = false, onChange }) {
  const [editedData, setEditedData] = useState(data);
  const [procedureText, setProcedureText] = useState('');

  // Update editedData when data prop changes
  useEffect(() => {
    setEditedData(data);
    if (data?.procedure) {
      setProcedureText(data.procedure.raw || data.procedure.steps?.join('\n') || '');
    }
  }, [data]);

  const {
    benchmark,
    parameters,
    others,
    productDevelopmentFeedback,
    procedure,
    procedureParameters,
    ovenTemperature,
    afterBake,
    afterBakeOthers,
    procedureOthers,
    sensoryFeedback
  } = editedData || {};

  const isBakery = format === "bakery";

  const handleInputChange = (section, field, value) => {
    setEditedData(prev => {
      const updated = { ...prev };
      
      if (section === "benchmark") {
        updated.benchmark = { ...prev.benchmark, [field]: value };
      } else if (section === "parameters") {
        const reportIndex = prev.parameters.analyticalReport.findIndex(p => p.label === field);
        if (reportIndex !== -1) {
          updated.parameters = {
            ...prev.parameters,
            analyticalReport: prev.parameters.analyticalReport.map((p, i) => 
              i === reportIndex ? { ...p, value } : p
            )
          };
        }
      } else if (section === "others") {
        updated.others = value;
      } else if (section === "productDevelopmentFeedback") {
        updated.productDevelopmentFeedback = value;
      } else if (section === "procedure") {
        setProcedureText(value);
        updated.procedure = {
          ...prev.procedure,
          raw: value,
          steps: textToStepsArray(value)
        };
      } else if (section === "procedureParameters") {
        const reportIndex = prev.procedureParameters?.analyticalReport?.findIndex(p => p.label === field);
        if (reportIndex !== -1) {
          updated.procedureParameters = {
            ...prev.procedureParameters,
            analyticalReport: prev.procedureParameters.analyticalReport.map((p, i) => 
              i === reportIndex ? { ...p, value } : p
            )
          };
        }
      } else if (section === "afterBake") {
        const reportIndex = prev.afterBake.analyticalReport.findIndex(p => p.label === field);
        if (reportIndex !== -1) {
          updated.afterBake = {
            ...prev.afterBake,
            analyticalReport: prev.afterBake.analyticalReport.map((p, i) => 
              i === reportIndex ? { ...p, value } : p
            )
          };
        }
      } else if (section === "afterBakeOthers") {
        updated.afterBakeOthers = value;
      } else if (section === "sensoryFeedback") {
        updated.sensoryFeedback = value;
      } else if (section === "ovenTemperature") {
        if (!updated.ovenTemperature) updated.ovenTemperature = {};
        
        if (field.startsWith("tunnel_zone")) {
          const parts = field.split("_");
          const zonePart = parts[1]; // "zone1", "zone2", etc.
          const indexPart = parts[2];
          if (!updated.ovenTemperature.tunnelBaking) updated.ovenTemperature.tunnelBaking = { zones: [] };
          const zoneIndex = parseInt(indexPart);
          const zoneNum = zonePart.substring(4); // "1", "2", "3"
          updated.ovenTemperature.tunnelBaking.zones = prev.ovenTemperature.tunnelBaking.zones.map((z, i) => 
            i === zoneIndex ? { ...z, [`zone${zoneNum}`]: value } : z
          );
        } else if (field === "tunnel_baking_time") {
          updated.ovenTemperature.tunnelBaking = {
            ...prev.ovenTemperature.tunnelBaking,
            bakingTime: { ...prev.ovenTemperature.tunnelBaking.bakingTime, value }
          };
        } else if (field === "tunnel_belt_speed") {
          updated.ovenTemperature.tunnelBaking = {
            ...prev.ovenTemperature.tunnelBaking,
            beltSpeed: { ...prev.ovenTemperature.tunnelBaking.beltSpeed, value }
          };
        } else if (field.startsWith("normal_baking")) {
          const parts = field.split("_");
          const bakePart = parts[1]; // "baking1", "baking2"
          const indexPart = parts[2];
          if (!updated.ovenTemperature.normalBaking) updated.ovenTemperature.normalBaking = { bakings: [] };
          const bakeIndex = parseInt(indexPart);
          const bakeNum = bakePart.substring(6); // "1", "2"
          updated.ovenTemperature.normalBaking.bakings = prev.ovenTemperature.normalBaking.bakings.map((b, i) => 
            i === bakeIndex ? { ...b, [`baking${bakeNum}`]: value } : b
          );
        }
      }
      
      onChange?.(updated);
      return updated;
    });
  };

  if (!editedData) return <div className="p-6 text-center text-gray-500">No data available</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 pb-3 lg:pb-3 xl:pb-4 2xl:pb-5 3xl:pb-6">
      {/* Left Column */}
      <div className="space-y-3 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6 border-r border-[#E5E7EB] dark:border-primary/50 px-3 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6">
        {/* Benchmark Section */}
        <div>
          <h3 className="text-[8px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-bold text-gray-900 dark:text-white mb-1 pt-2 lg:pt-3 xl:pt-4 2xl:pt-5 3xl:pt-6">Benchmark</h3>
          <h4 className="mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 text-[8px] lg:text-[10px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-base-color dark:text-gray-400">Sensory Feedback</h4>
          <div className={cardClass(isEditMode)}>
            {isEditMode ? (
              <textarea
                className={cn(inputClass, "resize-none p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5 rounded-xl")}
                value={benchmark?.sensoryFeedback || ""}
                onChange={(e) => handleInputChange("benchmark", "sensoryFeedback", e.target.value)}
                placeholder=""
              />
            ) : (
              <p className="text-[8px] lg:text-[10px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5">
                {benchmark?.sensoryFeedback || ""}
              </p>
            )}
          </div>
        </div>

        {/* Parameters - Analytical Report */}
        {parameters?.analyticalReport && (
          <div>
            <h4 className="mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 text-[8px] lg:text-[10px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-base-color dark:text-gray-400">Benchmark Analysis</h4>
            <div className="border border-[#E5E7EB] dark:border-primary/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {parameters.analyticalReport.map((param, index, arr) => (
                    <tr key={index} className={cn(index !== arr.length - 1 && "border-b border-[#E5E7EB] dark:border-primary/50")}>
                      <td className="py-0.5 lg:py-0.5! xl:py-1 2xl:py-1.5 3xl:py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-600 dark:text-gray-400 w-40 border-r border-[#E5E7EB] dark:border-primary/50">{param.label}</td>
                      <td className="p-0.5 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 bg-transparent">
                        <RenderEditableField 
                          label={param.label} 
                          value={param.value} 
                          unit={param.unit} 
                          section="parameters" 
                          isTable={true} 
                          isEditMode={isEditMode}
                          onInputChange={handleInputChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Others Section */}
        <div>
          <h4 className="mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 text-[8px] lg:text-[10px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-base-color dark:text-gray-400">Others</h4>
          <div className={cardClass(isEditMode)}>
            {isEditMode ? (
              <textarea
                className={cn(inputClass, "min-h-[28px] lg:min-h-[32px] xl:min-h-[42px] 2xl:min-h-[48px] 3xl:min-h-[60px] resize-none p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5 rounded-xl")}
                value={others || ""}
                onChange={(e) => handleInputChange("others", null, e.target.value)}
                placeholder=""
              />
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5">
                {others || ""}
              </p>
            )}
          </div>
        </div>

        {/* Product Development Feedback */}
        <div>
          <h4 className="mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 text-[8px] lg:text-[10px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-base-color dark:text-gray-400">Product Development Feedback</h4>         
          <div className={cardClass(isEditMode)}>
            {isEditMode ? (
              <textarea
                className={cn(inputClass, "min-h-[28px] lg:min-h-[32px] xl:min-h-[42px] 2xl:min-h-[48px] 3xl:min-h-[60px] resize-none p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5 rounded-xl")}
                value={productDevelopmentFeedback || ""}
                onChange={(e) => handleInputChange("productDevelopmentFeedback", null, e.target.value)}
                placeholder=""
              />
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5">
                {productDevelopmentFeedback || ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-3 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6 px-3 lg:px-3 xl:px-4 2xl:px-5 3xl:px-6">
        {/* Procedure Section */}
        {procedure && (
          <div className="pt-2 lg:pt-3 xl:pt-4 2xl:pt-5 3xl:pt-6">
            <h3 className="text-[8px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-bold text-gray-900 dark:text-white mb-1">Procedure</h3>
            <h4 className="mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 text-[8px] lg:text-[10px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-base-color dark:text-gray-400">{procedure.title}</h4>
            <div className={cardClass(isEditMode)}>
              {isEditMode ? (
                <textarea
                  className={cn(inputClass, "p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5 rounded-xl font-medium leading-relaxed")}
                  value={procedureText || ""}
                  onChange={(e) => handleInputChange("procedure", null, e.target.value)}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              ) : (
                <div className="space-y-1 p-3 lg:p-1.5 xl:p-1.5 2xl:p-2.5">
                  {(procedure.steps || []).length > 0 ? (
                    (procedure.steps || []).map((step, index) => (
                      <p key={index} className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300 leading-relaxed min-h-[1.2em] font-medium">
                        {step}
                      </p>
                    ))
                  ) : (
                    <p className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium"></p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parameters Section (Procedure Parameters) */}
        {procedureParameters?.analyticalReport?.length > 0 && (
          <div>
            <h3 className="text-[8px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-bold text-gray-900 dark:text-white mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">Parameters</h3>
            <div className="border border-[#E5E7EB] dark:border-primary/50 rounded-lg overflow-hidden">
              <table className="w-full text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm border-collapse">
                <tbody>
                  {procedureParameters.analyticalReport.map((param, index, arr) => (
                    <tr key={index} className={cn(index !== arr.length - 1 && "border-b border-[#E5E7EB] dark:border-primary/50")}>
                      <td className="py-0.5 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-600 dark:text-gray-400 w-40 border-r border-[#E5E7EB] dark:border-primary/50">{param.label}</td>
                      <td className="p-0.5 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 bg-transparent">
                        <RenderEditableField 
                          label={param.label} 
                          value={param.value} 
                          unit={param.unit} 
                          section="procedureParameters" 
                          isTable={true} 
                          isEditMode={isEditMode}
                          onInputChange={handleInputChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Oven Temperature Section (Bakery Only) */}
        {isBakery && ovenTemperature && (
          <div>
            <h3 className="text-[8px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-bold text-gray-900 dark:text-white mb-1">Oven Temperature</h3>
            
            {/* Tunnel Baking */}
            {ovenTemperature.tunnelBaking && (
              <div className="mb-6">
                <h4 className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-base-color dark:text-gray-400 mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">Tunnel Baking</h4>
                <div className="border border-[#E5E7EB] dark:border-gray-700 rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] dark:border-gray-700">
                        <th className="py-3 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 w-40 border-r border-[#E5E7EB] dark:border-gray-700"></th>
                        <th className="text-center py-3 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-gray-800 font-bold border-r border-[#E5E7EB] dark:border-gray-700">1st Zone</th>
                        <th className="text-center py-3 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-gray-800 font-bold border-r border-[#E5E7EB] dark:border-gray-700">2nd Zone</th>
                        <th className="text-center py-3 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-gray-800 font-bold">3rd Zone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ovenTemperature.tunnelBaking.zones.map((zone, index) => (
                        <tr key={index} className="border-b border-[#E5E7EB] dark:border-gray-700">
                          <td className="py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-600 border-r border-[#E5E7EB] dark:border-gray-700">{zone.label}</td>
                          <td className="py-2 px-3 border-r border-[#E5E7EB] dark:border-gray-700">
                            <RenderEditableField 
                              value={zone.zone1} 
                              unit={zone.unit} 
                              isTable={true} 
                              section="ovenTemperature" 
                              field={`tunnel_zone1_${index}`} 
                              isEditMode={isEditMode}
                              onInputChange={handleInputChange}
                            />
                          </td>
                          <td className="py-2 px-3 border-r border-[#E5E7EB] dark:border-gray-700">
                            <RenderEditableField 
                              value={zone.zone2} 
                              unit={zone.unit} 
                              isTable={true} 
                              section="ovenTemperature" 
                              field={`tunnel_zone2_${index}`} 
                              isEditMode={isEditMode}
                              onInputChange={handleInputChange}
                            />
                          </td>
                          <td className="py-2 px-3">
                            <RenderEditableField 
                              value={zone.zone3} 
                              unit={zone.unit} 
                              isTable={true} 
                              section="ovenTemperature" 
                              field={`tunnel_zone3_${index}`} 
                              isEditMode={isEditMode}
                              onInputChange={handleInputChange}
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b border-[#E5E7EB] dark:border-gray-700">
                        <td className="py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-600 border-r border-[#E5E7EB] dark:border-gray-700">Baking Time</td>
                        <td className="py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 bg-transparent" colSpan={3}>
                           <RenderEditableField 
                             value={ovenTemperature.tunnelBaking.bakingTime.value} 
                             unit={ovenTemperature.tunnelBaking.bakingTime.unit} 
                             isTable={true} 
                             section="ovenTemperature" 
                             field="tunnel_baking_time" 
                             isEditMode={isEditMode}
                             onInputChange={handleInputChange}
                           />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-600 border-r border-[#E5E7EB] dark:border-gray-700">Belt Speed</td>
                        <td className="py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 bg-transparent" colSpan={3}>
                           <RenderEditableField 
                             value={ovenTemperature.tunnelBaking.beltSpeed.value} 
                             unit={null} 
                             isTable={true} 
                             section="ovenTemperature" 
                             field="tunnel_belt_speed" 
                             isEditMode={isEditMode}
                             onInputChange={handleInputChange}
                           />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Normal Baking */}
            {ovenTemperature.normalBaking && (
              <div>
                <h4 className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal text-base-color dark:text-gray-400 mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">Normal Baking</h4>
                <div className="border border-[#E5E7EB] dark:border-gray-700 rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] dark:border-gray-700">
                        <th className="py-3 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 w-40 border-r border-[#E5E7EB] dark:border-gray-700"></th>
                        <th className="text-center py-3 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-gray-800 font-bold border-r border-[#E5E7EB] dark:border-gray-700">1st Baking</th>
                        <th className="text-center py-3 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-gray-800 font-bold">2nd Baking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ovenTemperature.normalBaking.bakings.map((baking, index, arr) => (
                        <tr key={index} className={cn(index !== arr.length - 1 && "border-b border-[#E5E7EB] dark:border-gray-700")}>
                          <td className="py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-600 border-r border-[#E5E7EB] dark:border-gray-700">{baking.label}</td>
                          <td className="py-2 px-3 border-r border-[#E5E7EB] dark:border-gray-700">
                             <RenderEditableField 
                               value={baking.baking1} 
                               unit={baking.unit} 
                               isTable={true} 
                               section="ovenTemperature" 
                               field={`normal_baking1_${index}`} 
                               isEditMode={isEditMode}
                               onInputChange={handleInputChange}
                             />
                          </td>
                          <td className="py-2 px-3">
                             <RenderEditableField 
                               value={baking.baking2} 
                               unit={baking.unit} 
                               isTable={true} 
                               section="ovenTemperature" 
                               field={`normal_baking2_${index}`} 
                               isEditMode={isEditMode}
                               onInputChange={handleInputChange}
                             />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* After-Bake Analytical Report (Bakery Only) */}
        {isBakery && afterBake && (
          <div>
            <h3 className="text-[8px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-bold text-gray-900 dark:text-white mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">After-Bake: Analytical Report</h3>
            <div className="border border-[#E5E7EB] dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm border-collapse">
                <tbody>
                  {afterBake.analyticalReport.map((param, index, arr) => (
                    <tr key={index} className={cn(index !== arr.length - 1 && "border-b border-[#E5E7EB] dark:border-gray-700")}>
                      <td className="py-0.5 lg:py-0.5 xl:py-1 2xl:py-1.5 3xl:py-2 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-gray-600 dark:text-gray-400 w-40 border-r border-[#E5E7EB] dark:border-gray-700">{param.label}</td>
                      <td className="p-0.5 lg:p-0.5 xl:p-1 2xl:p-1.5 3xl:p-2 bg-transparent">
                        <RenderEditableField 
                          label={param.label} 
                          value={param.value} 
                          unit={param.unit} 
                          section="afterBake" 
                          isTable={true} 
                          isEditMode={isEditMode}
                          onInputChange={handleInputChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Others Section */}
        <div>
          <h3 className="text-[8px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-bold text-gray-900 dark:text-white mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">Others</h3>
          <div className={cardClass(isEditMode)}>
            {isEditMode ? (
              <textarea
                className={cn(inputClass, "min-h-[28px] lg:min-h-[32px] xl:min-h-[42px] 2xl:min-h-[48px] 3xl:min-h-[60px] resize-none p-3 rounded-xl")}
                value={procedureOthers || afterBakeOthers || ""}
                onChange={(e) => handleInputChange(procedureParameters ? "afterBakeOthers" : "others", null, e.target.value)}
                placeholder=""
              />
            ) : (
              <p className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium p-3">
                {procedureOthers || afterBakeOthers || ""}
              </p>
            )}
          </div>
        </div>

        {/* Sensory Feedback */}
        <div>
          <h3 className="text-[8px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-lg font-bold text-gray-900 dark:text-white mb-1 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3">Sensory Feedback</h3>
          <div className={cardClass(isEditMode)}>
            {isEditMode ? (
              <textarea
                className={cn(inputClass, "min-h-[28px] lg:min-h-[32px] xl:min-h-[42px] 2xl:min-h-[48px] 3xl:min-h-[60px] resize-none p-3 rounded-xl")}
                value={sensoryFeedback || ""}
                onChange={(e) => handleInputChange("sensoryFeedback", null, e.target.value)}
                placeholder=""
              />
            ) : (
              <p className="text-[7px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium p-3">
                {sensoryFeedback || ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
