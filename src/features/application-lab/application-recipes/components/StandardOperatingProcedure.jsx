import React, { useState, useEffect, useMemo } from "react";
import { Save, X } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { mapUIParamsToBackend, buildSOPDataFromRecipe } from "../data/sopDataByFormat";
import { useAuthStore } from "@/store/useAuthStore";

const defaultParams = [
  { label: "Dough Temperature", value: "", unit: "°C" },
  { label: "SG", value: "", unit: "" },
  { label: "pH", value: "", unit: "" },
];

const confectioneryDefaultParams = [
  { label: "Cooking pH", value: "", unit: "" },
  { label: "Final pH", value: "", unit: "" },
  { label: "Brix", value: "", unit: "" },
  { label: "Cooking Temperature", value: "", unit: "°C" },
  { label: "Depositing Temperature", value: "", unit: "°C" },
  { label: "Cooking Time", value: "", unit: "min" },
  { label: "Gel Forming Time", value: "", unit: "min" },
];

const beverageDefaultParams = [
  { label: "Homogenization Pressure", value: "", unit: "bar" },
  { label: "Pasteurization Temperature", value: "", unit: "" },
  { label: "Pasteurization Time", value: "", unit: "" },
  { label: "Aeration", value: "", unit: "" },
  { label: "Viscosity", value: "", unit: "" },
  { label: "pH", value: "", unit: "" },
  { label: "Brix", value: "", unit: "" },
  { label: "Acidity", value: "", unit: "" },
  { label: "Salt", value: "", unit: "%" },
  { label: "Filling Temperature", value: "", unit: "°C" },
  { label: "CO2 Filling Temperature", value: "", unit: "°C" },
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
  { label: "aW", value: "", unit: "" },
  { label: "Moisture", value: "", unit: "" },
];

const parseStoredComments = (rawVal, defaultAuthor, defaultDate) => {
  if (!rawVal || typeof rawVal !== "string" || !rawVal.trim()) return [];
  const trimmed = rawVal.trim();

  // 1. Try parsing JSON array
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => item && (item.text || item.comment))
          .map((item) => ({
            userName: item.userName || item.user || defaultAuthor || "User",
            user: item.userName || item.user || defaultAuthor || "User",
            text: item.text || item.comment || "",
            comment: item.text || item.comment || "",
            createdAt: item.createdAt || defaultDate || new Date().toISOString(),
            tag: item.tag || null,
          }));
      }
    } catch (e) { }
  }

  // 2. Try parsing single JSON object
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const item = JSON.parse(trimmed);
      if (item && (item.text || item.comment)) {
        return [
          {
            userName: item.userName || item.user || defaultAuthor || "User",
            user: item.userName || item.user || defaultAuthor || "User",
            text: item.text || item.comment || "",
            comment: item.text || item.comment || "",
            createdAt: item.createdAt || defaultDate || new Date().toISOString(),
            tag: item.tag || null,
          },
        ];
      }
    } catch (e) { }
  }

  // 3. Fallback: legacy plain text comment
  return [
    {
      userName: defaultAuthor || "User",
      user: defaultAuthor || "User",
      text: trimmed,
      comment: trimmed,
      createdAt: defaultDate || new Date().toISOString(),
    },
  ];
};

// ================= STANDARD OPERATING PROCEDURE VERSION COLUMN =================
export default function StandardOperatingProcedure({
  vItem,
  data,
  normalizedVItem,
  recipeFormat = "bakery",
  isFirstVersion = false,
  sopRef,
  onSaveSpecificFields,
  isConfectionary = false,
  formatDate = (d) => d || "-",
  vIsFinalized = false,
  isSelectingForCompare = false,
}) {
  const [isSOPEditing, setIsSOPEditing] = useState(false);
  const [isSavingSOP, setIsSavingSOP] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [localActivities, setLocalActivities] = useState([]);

  const { user: currentUser } = useAuthStore();
  const currentUserName = currentUser?.name || currentUser?.fullName || currentUser?.username || "User";

  const isBeverageOrBeveragePsd = (val) => {
    if (!val) return false;
    const str = String(val).trim().toLowerCase();
    return (
      str === "beverage" ||
      str === "beverage psd" ||
      str === "beverage-psd" ||
      str === "beveragepsd" ||
      str.startsWith("beverage")
    );
  };

  const formatCandidates = [
    recipeFormat,
    data?.recipeType,
    data?.applicationLab?.category?.name,
    normalizedVItem?.recipeType,
    normalizedVItem?.applicationLab?.category?.name,
    vItem?.recipeType,
    vItem?.applicationLab?.category?.name,
  ];

  const isBeverage = formatCandidates.some(isBeverageOrBeveragePsd);

  const isConfection =
    isConfectionary ||
    formatCandidates.some((f) => String(f || "").toLowerCase().includes("confection"));

  // For Beverage and Beverage PSD formats, baking-related SOP sections
  // (Oven Temperature, Tunnel Baking, Rotary Baking, After Bake, Analytical Report)
  // are not applicable and must not be displayed.
  // For Confectionery, baking sections are also not displayed.
  // For all other formats (Bakery), keep existing SOP behavior unchanged.
  const shouldShowBakeSections = !isConfection && !isBeverage;

  const effectiveDefaultParams = useMemo(() => {
    if (isConfection) return confectioneryDefaultParams;
    if (isBeverage) return beverageDefaultParams;
    return defaultParams;
  }, [isConfection, isBeverage]);

  const initialSOP = useMemo(
    () => buildSOPDataFromRecipe(normalizedVItem, recipeFormat),
    [normalizedVItem, recipeFormat]
  );

  const [draftProcedure, setDraftProcedure] = useState(
    initialSOP?.procedure?.raw ||
    (initialSOP?.procedure?.steps || []).join("\n") ||
    ""
  );

  const [draftParams, setDraftParams] = useState(
    initialSOP?.procedureParameters?.analyticalReport?.length > 0
      ? initialSOP.procedureParameters.analyticalReport
      : effectiveDefaultParams
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
      updatedSop?.procedure?.raw ||
      (updatedSop?.procedure?.steps || []).join("\n") ||
      ""
    );
    setDraftParams(
      updatedSop?.procedureParameters?.analyticalReport?.length > 0
        ? updatedSop.procedureParameters.analyticalReport
        : effectiveDefaultParams
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
  }, [normalizedVItem, recipeFormat, isConfection, isBeverage]);

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
        const item = draftAfterBake.find(
          (r) => r.label === label || r.label?.toLowerCase() === label.toLowerCase()
        );
        return item?.value ? Number(item.value) : undefined;
      };
      const abData = {
        weight: findVal("Weight"),
        size: findVal("Size"),
        aeration: findVal("Aeration"),
        aW: findVal("aW"),
        moisture: findVal("Moisture"),
      };

      let updatedProcedureOthers;
      if (newCommentText.trim()) {
        const newEntry = {
          userName: currentUserName,
          user: currentUserName,
          text: newCommentText.trim(),
          comment: newCommentText.trim(),
          createdAt: new Date().toISOString(),
        };
        const updatedList = [...effectiveActivities, newEntry];
        updatedProcedureOthers = JSON.stringify(updatedList);
        setLocalActivities((prev) => [...prev, newEntry]);
        setNewCommentText("");
      }

      if (onSaveSpecificFields) {
        const payload = {
          procedureSOP: draftProcedure,
          procedureParameters: mapUIParamsToBackend(draftParams),
          ...(shouldShowBakeSections
            ? {
              ovenTemperatureTunnelBaking: tunnelData,
              normalBaking: normalData,
              afterBake: abData,
            }
            : {}),
          ...(updatedProcedureOthers ? { procedureOthers: updatedProcedureOthers } : {}),
        };
        await onSaveSpecificFields(payload, vItem?._id || data?._id);
      }

      setIsSOPEditing(false);
    } catch (err) {
      console.error("Failed to save Standard Operating for version:", err);
    } finally {
      setIsSavingSOP(false);
    }
  };

  const dynamicAuthor =
    vItem?.createdBy?.name ||
    vItem?.createdBy?.fullName ||
    (typeof vItem?.createdBy === "string" && vItem.createdBy.length < 30 ? vItem.createdBy : null) ||
    data?.createdBy?.name ||
    data?.createdBy?.fullName ||
    data?.independentRecipeRaisedBy ||
    data?.raisedBy ||
    currentUserName;

  // Stored activities from database (vItem.activities + parsed vItem.procedureOthers)
  const storedActivities = useMemo(() => {
    const list = [];
    if (Array.isArray(vItem?.activities) && vItem.activities.length > 0) {
      list.push(...vItem.activities);
    }

    const procOthers = vItem?.procedureOthers || normalizedVItem?.procedureOthers;
    if (procOthers && typeof procOthers === "string" && procOthers.trim()) {
      const parsed = parseStoredComments(
        procOthers,
        dynamicAuthor,
        vItem?.updatedAt || vItem?.createdAt
      );

      parsed.forEach((p) => {
        const textKey = (p.text || p.comment || "").trim();
        const dateKey = p.createdAt ? new Date(p.createdAt).getTime() : 0;
        const exists = list.some((existing) => {
          const eText = (existing.text || existing.comment || "").trim();
          const eDate = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
          return eText === textKey && (Math.abs(eDate - dateKey) < 1000 || !eDate || !dateKey);
        });
        if (!exists) {
          list.push(p);
        }
      });
    }

    return list;
  }, [
    vItem?.activities,
    vItem?.procedureOthers,
    normalizedVItem?.procedureOthers,
    dynamicAuthor,
    vItem?.updatedAt,
    vItem?.createdAt,
  ]);

  // Consolidate stored activities and newly posted local comments
  const effectiveActivities = useMemo(() => {
    const list = [...storedActivities];
    localActivities.forEach((local) => {
      const lText = (local.text || local.comment || "").trim();
      const lDate = local.createdAt ? new Date(local.createdAt).getTime() : 0;
      const exists = list.some((existing) => {
        const eText = (existing.text || existing.comment || "").trim();
        const eDate = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
        return eText === lText && (Math.abs(eDate - lDate) < 1000 || !eDate || !lDate);
      });
      if (!exists) {
        list.push(local);
      }
    });
    return list;
  }, [storedActivities, localActivities]);

  // Recipe-specific comment submission handler supporting multiple separate entries
  const handleSendComment = async () => {
    const text = newCommentText.trim();
    if (!text) return;

    try {
      const targetId = vItem?._id || data?._id;
      const newEntry = {
        userName: currentUserName,
        user: currentUserName,
        text,
        comment: text,
        createdAt: new Date().toISOString(),
      };

      // Append new entry to the full list of existing comments
      const updatedList = [...effectiveActivities, newEntry];

      setLocalActivities((prev) => [...prev, newEntry]);
      setNewCommentText("");

      if (onSaveSpecificFields) {
        await onSaveSpecificFields(
          {
            procedureOthers: JSON.stringify(updatedList),
          },
          targetId
        );
      }
    } catch (err) {
      console.error("Failed to save recipe comment:", err);
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
        : effectiveDefaultParams
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
                className="flex items-center justify-center w-6.5 h-6.5 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-white/30" />
              <button
                type="button"
                onClick={handleCancelSOP}
                disabled={isSavingSOP}
                title="Cancel Standard Operating"
                className="flex items-center justify-center w-6.5 h-6.5 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : !vIsFinalized && !isSelectingForCompare ? (
            <button
              type="button"
              onClick={() => setIsSOPEditing(true)}
              title="Edit Standard Operating"
              className="w-6.5 h-6.5 rounded-full bg-[#4B208B] hover:bg-[#3E1B77] text-white flex items-center justify-center shadow-sm cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.34847 0.928711H1.48022C1.18709 0.928711 0.905978 1.04516 0.69871 1.25244C0.491442 1.45972 0.375 1.74086 0.375 2.03399V9.77098C0.375 10.0641 0.491442 10.3453 0.69871 10.5525C0.905978 10.7598 1.18709 10.8763 1.48022 10.8763H9.21673C9.50985 10.8763 9.79096 10.7598 9.99823 10.5525C10.2055 10.3453 10.3219 10.0641 10.3219 9.77098V5.90249" stroke="white" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8.87126 0.718368C9.0911 0.498513 9.38927 0.375 9.70017 0.375C10.0111 0.375 10.3092 0.498513 10.5291 0.718368C10.7489 0.938222 10.8724 1.23641 10.8724 1.54733C10.8724 1.85825 10.7489 2.15644 10.5291 2.37629L5.54843 7.35781C5.41721 7.48892 5.25511 7.58489 5.07705 7.63689L3.48941 8.10111C3.44186 8.11498 3.39146 8.11581 3.34347 8.10352C3.29549 8.09122 3.25169 8.06626 3.21667 8.03123C3.18165 7.9962 3.15668 7.95241 3.14439 7.90442C3.13209 7.85643 3.13293 7.80603 3.14679 7.75847L3.61098 6.17073C3.66322 5.99281 3.75938 5.83089 3.8906 5.69988L8.87126 0.718368Z" stroke="white" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          ) : null}
        </div>

        {isSOPEditing ? (
          <textarea
            rows={6}
            value={draftProcedure}
            onChange={(e) => setDraftProcedure(e.target.value)}
            className="w-full p-3.5 rounded-[8px] border-2 border-[#4B208B] text-xs leading-relaxed bg-white dark:bg-[#151221] text-gray-900 dark:text-white resize-none focus:outline-none shadow-sm"
          />
        ) : (
          <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 text-xs leading-relaxed text-gray-800 dark:text-gray-200">
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

        <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-[8px] overflow-hidden divide-y divide-[#EEEBF4] dark:divide-primary/30 bg-[#F9FAFB] dark:bg-[#121019] text-xs">
          {draftParams.map((param, pIdx) => (
            <div key={pIdx} className="flex items-center divide-x divide-[#EEEBF4] dark:divide-primary/30">
              <div className="w-1/2 px-3.5 py-2.5 text-gray-500 font-medium truncate">
                {param.label}
              </div>
              <div className="w-1/2 px-3.5 py-2.5 flex items-center justify-between font-bold text-gray-900 dark:text-white">
                {isSOPEditing ? (
                  <div className="flex items-center justify-between w-full gap-1">
                    <input
                      type="text"
                      value={param.value}
                      placeholder={param.unit || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftParams((prev) =>
                          prev.map((p) => (p.label === param.label ? { ...p, value: val } : p))
                        );
                      }}
                      className="w-full text-left px-1.5 py-0.5 rounded border-2 border-[#4B208B] text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#151221]"
                    />
                  </div>
                ) : (
                  <>
                    <span>{param.value || "-"}</span>
                    {param.unit && <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">{param.unit}</span>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oven Temperature (Bakery only - hidden for Beverage, Beverage PSD, Confectionery) */}
      {shouldShowBakeSections && (
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

            <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-[8px] overflow-hidden bg-[#F9FAFB] dark:bg-[#121019] text-xs divide-y divide-[#EEEBF4] dark:divide-primary/30">
              <div className="flex items-center text-center font-bold text-gray-700 dark:text-gray-300 bg-[#FCFBFD] dark:bg-primary/15">
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Zone</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">1</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">2</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">3</div>
              </div>

              <div className="flex items-center text-center">
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Top Temperature</div>
                {["zone1", "zone2", "zone3"].map((zk) => (
                  <div key={zk} className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                    {isSOPEditing ? (
                      <input
                        type="text"
                        value={topZone[zk] || ""}
                        placeholder="°C"
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
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Bottom Temperature</div>
                {["zone1", "zone2", "zone3"].map((zk) => (
                  <div key={zk} className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                    {isSOPEditing ? (
                      <input
                        type="text"
                        value={bottomZone[zk] || ""}
                        placeholder="°C"
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
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Baking Time</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={draftBakingTime}
                      placeholder="min"
                      onChange={(e) => setDraftBakingTime(e.target.value)}
                      className="w-16 text-center text-xs font-bold bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                    />
                  ) : (
                    draftBakingTime ? `${draftBakingTime} min` : "-"
                  )}
                </div>
              </div>

              <div className="flex items-center text-center">
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Belt Speed</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={draftBeltSpeed}
                      placeholder="min"
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

            <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-[8px] overflow-hidden bg-[#F9FAFB] dark:bg-[#121019] text-xs divide-y divide-[#EEEBF4] dark:divide-primary/30">
              <div className="flex items-center text-center font-bold text-gray-700 dark:text-gray-300 bg-[#FCFBFD] dark:bg-primary/15">
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Baking</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">1st</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30">2nd</div>
              </div>

              <div className="flex items-center text-center">
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Oven Temperature</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={ovenTempRow.baking1 || ""}
                      placeholder="°C"
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
                      placeholder="°C"
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
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Oven Time</div>
                <div className="flex-1 py-2 border-l border-[#EEEBF4] dark:border-primary/30 font-bold text-gray-900 dark:text-white">
                  {isSOPEditing ? (
                    <input
                      type="text"
                      value={ovenTimeRow.baking1 || ""}
                      placeholder="min"
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
                      placeholder="min"
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
                <div className="w-32 text-left pl-3 py-2 font-medium text-gray-500">Steam</div>
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
      )}

      {/* After Bake: Analytical Report (Bakery only - hidden for Beverage, Beverage PSD, Confectionery) */}
      {shouldShowBakeSections && (
        <div>
          <div className="mb-3">
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              After Bake: Analytical Report
            </span>
          </div>

          <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-[8px] overflow-hidden divide-y divide-[#EEEBF4] dark:divide-primary/30 bg-[#F9FAFB] dark:bg-[#121019] text-xs">
            {draftAfterBake.map((param, pIdx) => (
              <div key={pIdx} className="flex items-center divide-x divide-[#EEEBF4] dark:divide-primary/30">
                <div className="w-1/2 px-3.5 py-2.5 text-gray-500 font-medium truncate">
                  {param.label}
                </div>
                <div className="w-1/2 px-3.5 py-2.5 bg-white dark:bg-[#151221] font-bold text-gray-900 dark:text-white">
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
                        className="w-full text-left px-1.5 py-0.5 rounded border-2 border-[#4B208B] text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-[#151221]"
                      />
                      {param.unit && <span className="font-bold text-gray-900 dark:text-white text-xs">{param.unit}</span>}
                    </div>
                  ) : (
                    <span className="">
                      {param.value ? `${param.value} ${param.unit || ""}`.trim() : "-"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Others Block */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Others
          </span>
        </div>

        <div className="space-y-3">
          {Array.isArray(effectiveActivities) && effectiveActivities.length > 0 ? (
            effectiveActivities.map((act, actIdx) => (
              <div
                key={actIdx}
                className="p-3.5 rounded-[8px] bg-[#F9FAFB] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 space-y-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-[13px] flex items-center justify-center">
                    {(act.userName || act.user || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                    <span className="text-[14px] font-semibold text-[#0D111A] dark:text-white truncate">
                      {act.userName || act.user || "User"}
                    </span>
                    {act.tag && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 text-[10px] font-semibold whitespace-nowrap">
                        {act.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#757575] whitespace-nowrap">
                    {formatDate(act.createdAt) || "-"}
                  </span>
                </div>
                <p className="text-[#0D111A] dark:text-gray-300 leading-relaxed text-[14px] font-medium">
                  {act.text || act.comment || ""}
                </p>
              </div>
            ))
          ) : null}

          {/* Comment Input Box */}
          <div className="space-y-2">
            <textarea
              rows={3}
              placeholder="Enter Comment"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full p-3 rounded-[8px] border border-[#EEEBF4] dark:border-primary/30 text-xs leading-relaxed bg-[#FCFBFD] dark:bg-[#121019] text-gray-900 dark:text-white resize-none focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSendComment}
                className="px-4 py-2 rounded-[6px] bg-primary hover:bg-[#3E1B77] text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
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
