import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useRecipeSensoryFeedback, useSensoryTopSheetBySample } from "@/hooks/useSensoryForm";

const formatSensoryDateTime = (dateVal, fallbackFormatDate) => {
  if (!dateVal) return "-";
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const day = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${day} · ${time}`;
    }
  } catch (e) {}
  return fallbackFormatDate ? fallbackFormatDate(dateVal) : String(dateVal);
};

// ================= SENSORY FEEDBACK VERSION COLUMN =================
export default function SensoryFeedback({
  vItem,
  formatDate = (d) => d || "-",
}) {
  const recipeId = vItem?._id;
  const sampleId = vItem?.sampleId || vItem?.sampleID || vItem?.sample?._id || vItem?.samples?.[0]?._id;

  // 1. Fetch sensory feedback for this recipe from sensory-testing/sensory-top-sheet
  const { data: recipeFeedbackData, isLoading: isFeedbackLoading } = useRecipeSensoryFeedback(recipeId, {
    enabled: Boolean(recipeId),
  });

  // 2. Fetch sensory top sheet by sample ID if available on vItem
  const { data: topSheetBySample, isLoading: isTopSheetLoading } = useSensoryTopSheetBySample(sampleId, {
    enabled: Boolean(sampleId),
  });

  // Consolidate feedbacks coming from sensory-testing/sensory-top-sheet
  const feedbacks = useMemo(() => {
    // A. If already passed directly via vItem.sensoryFeedbacks
    if (Array.isArray(vItem?.sensoryFeedbacks) && vItem.sensoryFeedbacks.length > 0) {
      return vItem.sensoryFeedbacks;
    }

    // B. From recipe sensory feedback endpoint (feedbacks array)
    if (Array.isArray(recipeFeedbackData?.feedbacks) && recipeFeedbackData.feedbacks.length > 0) {
      return recipeFeedbackData.feedbacks;
    }

    // C. From recipe sensory feedback endpoint (comments & remarks arrays)
    if (Array.isArray(recipeFeedbackData?.comments) && recipeFeedbackData.comments.length > 0) {
      return recipeFeedbackData.comments.map((c, idx) => {
        const correspondingRemark = recipeFeedbackData.remarks?.[idx];
        return {
          _id: c._id || idx,
          status: c.status || (idx === 0 ? "Rework" : "Approved"),
          comment: c.text || c.comment || "",
          remark: correspondingRemark?.text || correspondingRemark?.remark || "",
          createdAt: c.createdAt,
        };
      });
    }

    // D. From sample's aggregated top sheet
    if (topSheetBySample?.aggregatedTopSheets) {
      const ats = topSheetBySample.aggregatedTopSheets;
      return [
        {
          _id: ats._id || "sample-top-sheet",
          status: ats.approveForApplicationLab ? "Rework" : "Approved",
          comment: ats.panelistComment || "",
          remark: ats.panelistRemarks || "",
          createdAt: ats.submittedAt || ats.createdAt,
        },
      ];
    }

    // E. Fallback to vItem top sheets array if present
    if (Array.isArray(vItem?.sensoryTopSheets) && vItem.sensoryTopSheets.length > 0) {
      return vItem.sensoryTopSheets.map((ts, idx) => ({
        _id: ts._id || idx,
        status: ts.approveForApplicationLab || ts.evaluation === "rework" ? "Rework" : "Approved",
        comment: ts.panelistComment || ts.comment || "",
        remark: ts.panelistRemarks || ts.remark || "",
        createdAt: ts.createdAt || ts.submittedAt,
      }));
    }

    return [];
  }, [vItem?.sensoryFeedbacks, vItem?.sensoryTopSheets, recipeFeedbackData, topSheetBySample]);

  const isLoading = (isFeedbackLoading && Boolean(recipeId)) || (isTopSheetLoading && Boolean(sampleId));

  return (
    <div className="p-4 space-y-6 bg-white dark:bg-[#0D0B14]">
      {/* Sensory Feedback Cards from sensory-testing/sensory-top-sheet */}
      {feedbacks.length > 0 ? (
        <div className="space-y-4">
          {feedbacks.map((fb, fbIdx) => {
            const isApproved =
              String(fb.status || "").toLowerCase().includes("approve") ||
              Boolean(fb.approvedForShelfTesting);
            const isRework =
              String(fb.status || "").toLowerCase().includes("rework") ||
              Boolean(fb.approveForApplicationLab);
            const statusLabel = isRework ? "Rework" : isApproved ? "Approved" : (fb.status || "Feedback");

            return (
              <div
                key={fb._id || fbIdx}
                className="p-4 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full font-bold text-xs",
                      isRework
                        ? "bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300"
                        : "bg-[#E8F8F0] text-[#1B805A] border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 font-bold">
                    {String(fbIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-gray-400 dark:text-gray-400 font-medium text-[11px]">
                    {formatSensoryDateTime(fb.createdAt || fb.submittedAt, formatDate)}
                  </span>
                </div>

                {fb.comment && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Comment
                    </span>
                    <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                      {fb.comment}
                    </p>
                  </div>
                )}

                {fb.remark && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Remark
                    </span>
                    <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                      {fb.remark}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : isLoading ? (
        <div className="p-4 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 text-xs text-gray-400 dark:text-gray-500 text-center py-6">
          Loading sensory feedback...
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 text-xs text-gray-400 dark:text-gray-500 italic text-center py-6">
          No sensory feedback from top-sheet yet
        </div>
      )}
    </div>
  );
}

// ================= SENSORY FEEDBACK LEFT COLUMN =================
export function SensoryFeedbackLeftHeader() {
  return (
    <div className="p-6 flex-1 flex flex-col justify-start">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        Sensory Feedback
      </h2>
    </div>
  );
}
