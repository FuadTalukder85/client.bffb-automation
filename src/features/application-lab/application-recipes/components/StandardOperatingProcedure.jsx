import React, { useState, useEffect, useMemo } from "react";
import { Save, X } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { mapUIParamsToBackend, buildSOPDataFromRecipe } from "../data/sopDataByFormat";

const defaultParams = [
  { label: "Dough Temperature", value: "", unit: "°C" },
  { label: "SG", value: "", unit: "" },
  { label: "pH", value: "", unit: "" },
];

const defaultTunnelZones = [
  { label: "Top Temperature", zone1: "", zone2: "", zone3: "", unit: "°C" },
  { label: "Bottom Temperature", zone1: "", zone2: "", zone3: "", unit: "°C" },
];

const defaultRotaryBakings = [
  { label: "Oven Temperature", baking1: "", baking2: "", unit: "°C" },
  { label: "Oven Time", baking1: "", baking2: "", unit: "min" },
  { label: "Steam", baking1: "", baking2: "", unit: "unit" },
];

const defaultAfterBake = [
  { label: "Weight", value: "", unit: "g" },
  { label: "Size", value: "", unit: "" },
  { label: "Aeration", value: "", unit: "" },
  { label: "aw", value: "", unit: "" },
  { label: "Moisture", value: "", unit: "" },
];

// ================= STANDARD OPERATING PROCEDURE VERSION COLUMN =================
export default function StandardOperatingProcedure({
  vItem,
  data,
  normalizedVItem,
  recipeFormat = "bakery",
  isFirstVersion = false,
  sopRef,
  onSaveSpecificFields,
}) {
  const [isSOPEditing, setIsSOPEditing] = useState(false);
  const [isSavingSOP, setIsSavingSOP] = useState(false);

  const initialSOP = useMemo(
    () => buildSOPDataFromRecipe(normalizedVItem, recipeFormat),
    [normalizedVItem, recipeFormat]
  );

  const [draftProcedure, setDraftProcedure] = useState(
    initialSOP?.procedure?.raw || (initialSOP?.procedure?.steps || []).join("\n") || ""
  );

  const [draftParams, setDraftParams] = useState(
    initialSOP?.procedureParameters?.analyticalReport?.length > 0
      ? initialSOP.procedureParameters.analyticalReport
      : defaultParams
  );

  const [draftTunnelZones, setDraftTunnelZones] = useState(
    initialSOP?.ovenTemperature?.tunnelBaking?.zones?.length > 0
      ? initialSOP.ovenTemperature.tunnelBaking.zones
      : defaultTunnelZones
  );
  const [draftBakingTime, setDraftBakingTime] = useState(
    initialSOP?.ovenTemperature?.tunnelBaking?.bakingTime?.value || ""
  );
  const [draftBeltSpeed, setDraftBeltSpeed] = useState(
    initialSOP?.ovenTemperature?.tunnelBaking?.beltSpeed?.value || ""
  );

  const [draftRotaryBakings, setDraftRotaryBakings] = useState(
    initialSOP?.ovenTemperature?.normalBaking?.bakings?.length > 0
      ? initialSOP.ovenTemperature.normalBaking.bakings
      : defaultRotaryBakings
  );

  const [draftAfterBake, setDraftAfterBake] = useState(
    initialSOP?.afterBake?.analyticalReport?.length > 0
      ? initialSOP.afterBake.analyticalReport
      : defaultAfterBake
  );

  useEffect(() => {
    const updatedSop = buildSOPDataFromRecipe(normalizedVItem, recipeFormat);
    setDraftProcedure(
      updatedSop?.procedure?.raw || (updatedSop?.procedure?.steps || []).join("\n") || ""
    );
    setDraftParams(
      updatedSop?.procedureParameters?.analyticalReport?.length > 0
        ? updatedSop.procedureParameters.analyticalReport
        : defaultParams
    );
    setDraftTunnelZones(
      updatedSop?.ovenTemperature?.tunnelBaking?.zones?.length > 0
        ? updatedSop.ovenTemperature.tunnelBaking.zones
        : defaultTunnelZones
    );
    setDraftBakingTime(updatedSop?.ovenTemperature?.tunnelBaking?.bakingTime?.value || "");
    setDraftBeltSpeed(updatedSop?.ovenTemperature?.tunnelBaking?.beltSpeed?.value || "");
    setDraftRotaryBakings(
      updatedSop?.ovenTemperature?.normalBaking?.bakings?.length > 0
        ? updatedSop.ovenTemperature.normalBaking.bakings
        : defaultRotaryBakings
    );
    setDraftAfterBake(
      updatedSop?.afterBake?.analyticalReport?.length > 0
        ? updatedSop.afterBake.analyticalReport
        : defaultAfterBake
    );
  }, [normalizedVItem, recipeFormat]);

  // Save Standard Operating for THIS version
  const handleSaveSOP = async () => {
    try {
      setIsSavingSOP(true);
      const topZone = draftTunnelZones.find((z) => z.label === "Top Temperature");
      const bottomZone = draftTunnelZones.find((z) => z.label === "Bottom Temperature");
      const tunnelData = {
        topTemperature: [topZone?.zone1, topZone?.zone2, topZone?.zone3].map(Number).filter(Number.isFinite),
        bottomTemperature: [bottomZone?.zone1, bottomZone?.zone2, bottomZone?.zone3].map(Number).filter(Number.isFinite),
        bakingTime: Number(draftBakingTime) || undefined,
        beltSpeed: Number(draftBeltSpeed) || undefined,
      };

      const ovenTempBaking = draftRotaryBakings.find((b) => b.label === "Oven Temperature");
      const ovenTimeBaking = draftRotaryBakings.find((b) => b.label === "Oven Time");
      const steamBaking = draftRotaryBakings.find((b) => b.label === "Steam");
      const normalData = {
        ovenTemperature: [ovenTempBaking?.baking1, ovenTempBaking?.baking2].map(Number).filter(Number.isFinite),
        ovenTime: [ovenTimeBaking?.baking1, ovenTimeBaking?.baking2].map(Number).filter(Number.isFinite),
        steam: Number(steamBaking?.baking1) || undefined,
      };

      const findVal = (label) => {
        const item = draftAfterBake.find((r) => r.label === label);
        return item?.value ? Number(item.value) : undefined;
      };
      const abData = {
        weight: findVal("Weight"),
        size: findVal("Size"),
        aeration: findVal("Aeration"),
        aW: findVal("aw"),
        moisture: findVal("Moisture"),
      };

      if (onSaveSpecificFields) {
        await onSaveSpecificFields(
          {
            procedureSOP: draftProcedure,
            procedureParameters: mapUIParamsToBackend(draftParams),
            ovenTemperatureTunnelBaking: tunnelData,
            normalBaking: normalData,
            afterBake: abData,
          },
          vItem?._id || data?._id
        );
      }

      setIsSOPEditing(false);
    } catch (err) {
      console.error("Failed to save Standard Operating for version:", err);
    } finally {
      setIsSavingSOP(false);
    }
  };

  const handleCancelSOP = () => {
    const updatedSop = buildSOPDataFromRecipe(normalizedVItem, recipeFormat);
    setDraftProcedure(
      updatedSop?.procedure?.raw || (updatedSop?.procedure?.steps || []).join("\n") || ""
    );
    setDraftParams(
      updatedSop?.procedureParameters?.analyticalReport?.length > 0
        ? updatedSop.procedureParameters.analyticalReport
        : defaultParams
    );
    setDraftTunnelZones(
      updatedSop?.ovenTemperature?.tunnelBaking?.zones?.length > 0
        ? updatedSop.ovenTemperature.tunnelBaking.zones
        : defaultTunnelZones
    );
    setDraftBakingTime(updatedSop?.ovenTemperature?.tunnelBaking?.bakingTime?.value || "");
    setDraftBeltSpeed(updatedSop?.ovenTemperature?.tunnelBaking?.beltSpeed?.value || "");
    setDraftRotaryBakings(
      updatedSop?.ovenTemperature?.normalBaking?.bakings?.length > 0
        ? updatedSop.ovenTemperature.normalBaking.bakings
        : defaultRotaryBakings
    );
    setDraftAfterBake(
      updatedSop?.afterBake?.analyticalReport?.length > 0
        ? updatedSop.afterBake.analyticalReport
        : defaultAfterBake
    );
    setIsSOPEditing(false);
  };

  const topZone = draftTunnelZones.find((z) => z.label === "Top Temperature") || { zone1: "", zone2: "", zone3: "" };
  const bottomZone = draftTunnelZones.find((z) => z.label === "Bottom Temperature") || { zone1: "", zone2: "", zone3: "" };
  const ovenTempRow = draftRotaryBakings.find((b) => b.label === "Oven Temperature") || { baking1: "", baking2: "" };
  const ovenTimeRow = draftRotaryBakings.find((b) => b.label === "Oven Time") || { baking1: "", baking2: "" };
  const steamRow = draftRotaryBakings.find((b) => b.label === "Steam") || { baking1: "", baking2: "" };

  return (
    <div
      ref={isFirstVersion ? sopRef : undefined}
      className="p-4 space-y-6 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]"
    >
      {/* Procedure Block (Image 2) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Procedure
          </span>

          {isSOPEditing ? (
            <div className="flex items-center overflow-hidden rounded-xl bg-[#4B208B] text-white shadow-sm">
              <button
                type="button"
                onClick={handleSaveSOP}
                disabled={isSavingSOP}
                title="Save Standard Operating"
                className="flex items-center justify-center w-8 h-8 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-white/30" />
              <button
                type="button"
                onClick={handleCancelSOP}
                disabled={isSavingSOP}
                title="Cancel Standard Operating"
                className="flex items-center justify-center w-8 h-8 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSOPEditing(true)}
              title="Edit Standard Operating"
              className="w-8 h-8 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white flex items-center justify-center shadow-sm cursor-pointer"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isSOPEditing ? (
          <textarea
            rows={6}
            value={draftProcedure}
            onChange={(e) => setDraftProcedure(e.target.value)}
            className="w-full p-3.5 rounded-2xl border-2 border-[#4B208B] text-xs leading-relaxed bg-white dark:bg-[#151221] text-gray-900 dark:text-white resize-none focus:outline-none shadow-sm"
          />
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 text-xs leading-relaxed text-gray-800 dark:text-gray-200">
            {draftProcedure || "-"}
          </div>
        )}
      </div>

      {/* Parameters Block (Image 2) */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Parameters
          </span>
        </div>

        <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden divide-y divide-[#EEEBF4] dark:divide-primary/30 bg-[#FCFBFD] dark:bg-[#121019] text-xs">
          {draftParams.map((param, pIdx) => (
            <div key={pIdx} className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-gray-500 font-medium">{param.label}</span>
              {isSOPEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftParams((prev) =>
                        prev.map((p) => (p.label === param.label ? { ...p, value: val } : p))
                      );
                    }}
                    className="w-16 text-right px-1.5 py-0.5 rounded border-2 border-[#4B208B] text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#151221]"
                  />
                  {param.unit && <span className="font-bold text-gray-900 dark:text-white">{param.unit}</span>}
                </div>
              ) : (
                <span className="font-bold text-gray-900 dark:text-white">
                  {param.value ? `${param.value} ${param.unit || ""}`.trim() : "-"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Oven Temperature (Image 2 & 3) */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Oven Temperature
          </span>
        </div>

        {/* Tunnel Baking */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#4B208B] dark:text-purple-300">
            Tunnel Baking
          </span>

          <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden bg-[#FCFBFD] dark:bg-[#121019] text-xs divide-y divide-[#EEEBF4] dark:divide-primary/30">
            <div className="flex items-center text-center font-bold text-gray-700 dark:text-gray-300 bg-[#F7F5FA] dark:bg-primary/15">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Zone</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">1</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">2</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">3</div>
            </div>

            <div className="flex items-center text-center">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Top Temperature</div>
              {["zone1", "zone2", "zone3"].map((zk) => (
                <div key={zk} className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={topZone[zk] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftTunnelZones((prev) =>
                          prev.map((z) => (z.label === "Top Temperature" ? { ...z, [zk]: val } : z))
                        );
                      }}
                      className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    topZone[zk] ? `${topZone[zk]} °C` : "-"
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center text-center">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Bottom Temperature</div>
              {["zone1", "zone2", "zone3"].map((zk) => (
                <div key={zk} className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={bottomZone[zk] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftTunnelZones((prev) =>
                          prev.map((z) => (z.label === "Bottom Temperature" ? { ...z, [zk]: val } : z))
                        );
                      }}
                      className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    bottomZone[zk] ? `${bottomZone[zk]} °C` : "-"
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center text-center">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Baking Time</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <input
                    type="text"
                    value={draftBakingTime}
                    onChange={(e) => setDraftBakingTime(e.target.value)}
                    className="w-16 text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                ) : (
                  draftBakingTime ? `${draftBakingTime} min` : "-"
                )}
              </div>
            </div>

            <div className="flex items-center text-center">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Belt Speed</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <input
                    type="text"
                    value={draftBeltSpeed}
                    onChange={(e) => setDraftBeltSpeed(e.target.value)}
                    className="w-16 text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                ) : (
                  draftBeltSpeed ? `${draftBeltSpeed} min` : "-"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rotary Baking (Image 3) */}
        <div className="space-y-2 mt-4">
          <span className="text-xs font-bold text-[#4B208B] dark:text-purple-300">
            Rotary Baking
          </span>

          <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden bg-[#FCFBFD] dark:bg-[#121019] text-xs divide-y divide-[#EEEBF4] dark:divide-primary/30">
            <div className="flex items-center text-center font-bold text-gray-700 dark:text-gray-300 bg-[#F7F5FA] dark:bg-primary/15">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Baking</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">1st</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">2nd</div>
            </div>

            <div className="flex items-center text-center">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Oven Temperature</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <input
                    type="text"
                    value={ovenTempRow.baking1 || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftRotaryBakings((prev) =>
                        prev.map((b) => (b.label === "Oven Temperature" ? { ...b, baking1: val } : b))
                      );
                    }}
                    className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                ) : (
                  ovenTempRow.baking1 ? `${ovenTempRow.baking1} °C` : "-"
                )}
              </div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <input
                    type="text"
                    value={ovenTempRow.baking2 || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftRotaryBakings((prev) =>
                        prev.map((b) => (b.label === "Oven Temperature" ? { ...b, baking2: val } : b))
                      );
                    }}
                    className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                ) : (
                  ovenTempRow.baking2 ? `${ovenTempRow.baking2} °C` : "-"
                )}
              </div>
            </div>

            <div className="flex items-center text-center">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Oven Time</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <input
                    type="text"
                    value={ovenTimeRow.baking1 || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftRotaryBakings((prev) =>
                        prev.map((b) => (b.label === "Oven Time" ? { ...b, baking1: val } : b))
                      );
                    }}
                    className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                ) : (
                  ovenTimeRow.baking1 ? `${ovenTimeRow.baking1} min` : "-"
                )}
              </div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <input
                    type="text"
                    value={ovenTimeRow.baking2 || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftRotaryBakings((prev) =>
                        prev.map((b) => (b.label === "Oven Time" ? { ...b, baking2: val } : b))
                      );
                    }}
                    className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                ) : (
                  ovenTimeRow.baking2 ? `${ovenTimeRow.baking2} min` : "-"
                )}
              </div>
            </div>

            <div className="flex items-center text-center">
              <div className="w-28 text-left pl-3 py-2 font-medium text-gray-500">Steam</div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <input
                    type="text"
                    value={steamRow.baking1 || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftRotaryBakings((prev) =>
                        prev.map((b) => (b.label === "Steam" ? { ...b, baking1: val } : b))
                      );
                    }}
                    className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                ) : (
                  steamRow.baking1 || "-"
                )}
              </div>
              <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <input
                    type="text"
                    value={steamRow.baking2 || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftRotaryBakings((prev) =>
                        prev.map((b) => (b.label === "Steam" ? { ...b, baking2: val } : b))
                      );
                    }}
                    className="w-full text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                  />
                ) : (
                  steamRow.baking2 || "-"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* After Bake: Analytical Report (Image 3) */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            After Bake: Analytical Report
          </span>
        </div>

        <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden divide-y divide-[#EEEBF4] dark:divide-primary/30 bg-[#FCFBFD] dark:bg-[#121019] text-xs">
          {draftAfterBake.map((param, pIdx) => (
            <div key={pIdx} className="flex items-center justify-between px-3.5 py-2.5">
              <span className="text-gray-500 font-medium">{param.label}</span>
              {isSOPEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftAfterBake((prev) =>
                        prev.map((p) => (p.label === param.label ? { ...p, value: val } : p))
                      );
                    }}
                    className="w-16 text-right px-1.5 py-0.5 rounded border-2 border-[#4B208B] text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#151221]"
                  />
                  {param.unit && <span className="font-bold text-gray-900 dark:text-white">{param.unit}</span>}
                </div>
              ) : (
                <span className="font-bold text-gray-900 dark:text-white">
                  {param.value ? `${param.value} ${param.unit || ""}`.trim() : "-"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================= STANDARD OPERATING PROCEDURE LEFT COLUMN =================
export function StandardOperatingProcedureLeftHeader({ height }) {
  return (
    <div
      style={height ? { height: `${height}px` } : undefined}
      className="p-6 border-b border-[#EEEBF4] dark:border-primary/40 flex flex-col justify-start"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
        Standard Operating<br />Procedure
      </h2>
    </div>
  );
}
