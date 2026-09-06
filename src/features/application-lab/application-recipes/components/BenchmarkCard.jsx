import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Save, X } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { mapUIParamsToBackend } from "../data/sopDataByFormat";

export default function BenchmarkCard({
  sopData,
  recipe,
  onSaveSpecificFields,
  onChange,
  isFinalized = false,
}) {
  // Initial state is COLLAPSED (Image 1)
  const [isExpanded, setIsExpanded] = useState(false);
  // Completely INDEPENDENT edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialComment =
    sopData?.benchmark?.comment ??
    sopData?.benchmark?.sensoryFeedback ??
    recipe?.benchmarkSensoryFeedback ??
    "";

  const initialRemark =
    sopData?.benchmark?.remark ??
    "";

  const initialOthers =
    sopData?.others ??
    recipe?.benchmarkOthers ??
    "";

  const initialPDFeedback =
    sopData?.productDevelopmentFeedback ??
    recipe?.benchmarkPDFeedback ??
    "";

  const defaultAnalyticalReport = [
    { label: "Weight", value: "", unit: "g" },
    { label: "Size", value: "", unit: "" },
    { label: "Aeration", value: "", unit: "" },
    { label: "aW", value: "", unit: "" },
    { label: "Moisture", value: "", unit: "" },
  ];

  const initialAnalyticalReport =
    sopData?.parameters?.analyticalReport?.length > 0
      ? sopData.parameters.analyticalReport
      : defaultAnalyticalReport;

  const [draftComment, setDraftComment] = useState(initialComment);
  const [draftRemark, setDraftRemark] = useState(initialRemark);
  const [draftOthers, setDraftOthers] = useState(initialOthers);
  const [draftPDFeedback, setDraftPDFeedback] = useState(initialPDFeedback);
  const [draftAnalyticalReport, setDraftAnalyticalReport] = useState(initialAnalyticalReport);

  useEffect(() => {
    setDraftComment(initialComment);
    setDraftRemark(initialRemark);
    setDraftOthers(initialOthers);
    setDraftPDFeedback(initialPDFeedback);
    setDraftAnalyticalReport(initialAnalyticalReport);
  }, [sopData, recipe]);

  const handleStartEdit = () => {
    setDraftComment(initialComment);
    setDraftRemark(initialRemark);
    setDraftOthers(initialOthers);
    setDraftPDFeedback(initialPDFeedback);
    setDraftAnalyticalReport(initialAnalyticalReport);
    setIsExpanded(true); // Automatically expand so fields can be edited immediately
    setIsEditing(true);
  };

  const handleSaveLocal = async () => {
    try {
      setIsSaving(true);
      if (onSaveSpecificFields) {
        await onSaveSpecificFields({
          benchmarkSensoryFeedback: draftComment,
          benchmarkParameters: mapUIParamsToBackend(draftAnalyticalReport),
          benchmarkOthers: draftOthers,
          benchmarkPDFeedback: draftPDFeedback,
        });
      }

      if (onChange) {
        onChange({
          ...sopData,
          benchmark: {
            ...(sopData?.benchmark || {}),
            comment: draftComment,
            remark: draftRemark,
            sensoryFeedback: draftComment,
          },
          parameters: {
            ...(sopData?.parameters || {}),
            analyticalReport: draftAnalyticalReport,
          },
          others: draftOthers,
          productDevelopmentFeedback: draftPDFeedback,
        });
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save Benchmark:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelLocal = () => {
    setDraftComment(initialComment);
    setDraftRemark(initialRemark);
    setDraftOthers(initialOthers);
    setDraftPDFeedback(initialPDFeedback);
    setDraftAnalyticalReport(initialAnalyticalReport);
    setIsEditing(false);
  };

  const handleAnalyticalParamChange = (label, value) => {
    setDraftAnalyticalReport((prev) =>
      prev.map((p) => (p.label === label ? { ...p, value } : p))
    );
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0D0B14] border border-[#EEEBF4] dark:border-primary/40 rounded-3xl p-6 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Benchmark
        </h2>

        <div className="flex items-center gap-3">
          {/* Edit / Save / Cancel Controls (visible only when expanded) */}
          {isExpanded && (
            isEditing ? (
              <div className="flex items-center overflow-hidden rounded-xl bg-[#4B208B] text-white shadow-sm">
                <button
                  type="button"
                  onClick={handleSaveLocal}
                  disabled={isSaving}
                  title="Save Changes"
                  className="flex items-center justify-center w-9 h-9 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-white/30" />
                <button
                  type="button"
                  onClick={handleCancelLocal}
                  disabled={isSaving}
                  title="Cancel Changes"
                  className="flex items-center justify-center w-9 h-9 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                disabled={isFinalized}
                title="Edit Benchmark"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
            )
          )}

          {/* Chevron expand/collapse toggle */}
          <button
            type="button"
            onClick={() => {
              if (isExpanded && isEditing) {
                handleCancelLocal();
              }
              setIsExpanded((prev) => !prev);
            }}
            title={isExpanded ? "Collapse" : "Expand"}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content (Image 2 & 3) */}
      {isExpanded && (
        <div className="flex flex-col gap-6 pt-6 border-t border-[#EEEBF4] dark:border-primary/40 mt-4">
          {/* 1. Sensory Feedback */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              Sensory Feedback
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Comment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Comment
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={draftComment}
                    onChange={(e) => setDraftComment(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-[#4B208B] text-xs leading-relaxed bg-white dark:bg-[#151221] text-gray-800 dark:text-gray-200 resize-none focus:outline-none ring-1 ring-[#4B208B] shadow-sm"
                  />
                ) : (
                  <div className="w-full p-3.5 rounded-xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/20 text-xs leading-relaxed text-gray-800 dark:text-gray-200 min-h-[4.5rem]">
                    {draftComment || <span className="text-gray-400">-</span>}
                  </div>
                )}
              </div>

              {/* Remark */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Remark
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={draftRemark}
                    onChange={(e) => setDraftRemark(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-[#4B208B] text-xs leading-relaxed bg-white dark:bg-[#151221] text-gray-800 dark:text-gray-200 resize-none focus:outline-none ring-1 ring-[#4B208B] shadow-sm"
                  />
                ) : (
                  <div className="w-full p-3.5 rounded-xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/20 text-xs leading-relaxed text-gray-800 dark:text-gray-200 min-h-[4.5rem]">
                    {draftRemark || <span className="text-gray-400">-</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Benchmark Analysis */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              Benchmark Analysis
            </h3>

            <div className="border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden divide-y divide-[#EEEBF4] dark:divide-primary/30 bg-[#FCFBFD] dark:bg-[#121019]">
              {draftAnalyticalReport.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200"
                >
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-1/3">
                    {param.label}
                  </span>

                  <div className="flex items-center justify-end gap-3 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) =>
                          handleAnalyticalParamChange(param.label, e.target.value)
                        }
                        className="w-24 px-2 py-1 text-right text-xs font-semibold rounded-lg border-2 border-[#4B208B] bg-white dark:bg-[#151221] text-gray-900 dark:text-white focus:outline-none"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {param.value ? `${param.value} ${param.unit || ""}`.trim() : "-"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Others & Product Development Feedback */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              Others & Product Development Feedback
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Others */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Others
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={draftOthers}
                    onChange={(e) => setDraftOthers(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-[#4B208B] text-xs leading-relaxed bg-white dark:bg-[#151221] text-gray-800 dark:text-gray-200 resize-none focus:outline-none ring-1 ring-[#4B208B] shadow-sm"
                  />
                ) : (
                  <div className="w-full p-3.5 rounded-xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/20 text-xs leading-relaxed text-gray-800 dark:text-gray-200 min-h-[4.5rem]">
                    {draftOthers || <span className="text-gray-400">-</span>}
                  </div>
                )}
              </div>

              {/* Product Development Feedback */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Product Development Feedback
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={draftPDFeedback}
                    onChange={(e) => setDraftPDFeedback(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-[#4B208B] text-xs leading-relaxed bg-white dark:bg-[#151221] text-gray-800 dark:text-gray-200 resize-none focus:outline-none ring-1 ring-[#4B208B] shadow-sm"
                  />
                ) : (
                  <div className="w-full p-3.5 rounded-xl bg-[#F7F5FA] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/20 text-xs leading-relaxed text-gray-800 dark:text-gray-200 min-h-[4.5rem]">
                    {draftPDFeedback || <span className="text-gray-400">-</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
