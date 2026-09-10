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

    // B. If passed via vItem.feedbacks
    if (Array.isArray(vItem?.feedbacks) && vItem.feedbacks.length > 0) {
      return vItem.feedbacks;
    }

    // C. From recipe sensory feedback endpoint (feedbacks array)
    const rawFeedbacks = recipeFeedbackData?.feedbacks || recipeFeedbackData?.data?.feedbacks;
    if (Array.isArray(rawFeedbacks) && rawFeedbacks.length > 0) {
      return rawFeedbacks;
    }

    // D. From recipe sensory feedback endpoint (if data is array directly)
    if (Array.isArray(recipeFeedbackData) && recipeFeedbackData.length > 0) {
      return recipeFeedbackData;
    }
    if (Array.isArray(recipeFeedbackData?.data) && recipeFeedbackData.data.length > 0) {
      return recipeFeedbackData.data;
    }

    // E. From recipe sensory feedback endpoint (comments & remarks arrays)
    const comments = recipeFeedbackData?.comments || recipeFeedbackData?.data?.comments;
    const remarks = recipeFeedbackData?.remarks || recipeFeedbackData?.data?.remarks;

    if (Array.isArray(comments) && comments.length > 0) {
      return comments.map((c, idx) => {
        const correspondingRemark = remarks?.[idx];
        const isApproved =
          c.status === "Approved" ||
          Boolean(c.approvedForShelfTesting) ||
          Boolean(correspondingRemark?.approvedForShelfTesting);
        const isRework =
          c.status === "Rework" ||
          Boolean(c.approveForApplicationLab) ||
          Boolean(correspondingRemark?.approveForApplicationLab) ||
          (!isApproved && idx === 0);

        return {
          _id: c._id || idx,
          status: isRework ? "Rework" : isApproved ? "Approved" : (c.status || "Feedback"),
          comment: typeof c === "string" ? c : (c.text || c.comment || ""),
          remark: typeof correspondingRemark === "string" ? correspondingRemark : (correspondingRemark?.text || correspondingRemark?.remark || ""),
          createdAt: c.createdAt || c.submittedAt || c.date,
        };
      });
    }

    if (Array.isArray(remarks) && remarks.length > 0) {
      return remarks.map((r, idx) => {
        const correspondingComment = comments?.[idx];
        const isApproved =
          r.status === "Approved" ||
          Boolean(r.approvedForShelfTesting) ||
          Boolean(correspondingComment?.approvedForShelfTesting);
        const isRework =
          r.status === "Rework" ||
          Boolean(r.approveForApplicationLab) ||
          Boolean(correspondingComment?.approveForApplicationLab) ||
          (!isApproved && idx === 0);

        return {
          _id: r._id || idx,
          status: isRework ? "Rework" : isApproved ? "Approved" : (r.status || "Feedback"),
          comment: typeof correspondingComment === "string" ? correspondingComment : (correspondingComment?.text || correspondingComment?.comment || ""),
          remark: typeof r === "string" ? r : (r.text || r.remark || ""),
          createdAt: r.createdAt || r.submittedAt || r.date,
        };
      });
    }

    // F. From sample's aggregated top sheet
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

    // G. Fallback to vItem top sheets array if present
    if (Array.isArray(vItem?.sensoryTopSheets) && vItem.sensoryTopSheets.length > 0) {
      return vItem.sensoryTopSheets.map((ts, idx) => ({
        _id: ts._id || idx,
        status: ts.approveForApplicationLab || ts.evaluation === "rework" ? "Rework" : "Approved",
        comment: ts.panelistComment || ts.comment || "",
        remark: ts.panelistRemarks || ts.remark || "",
        createdAt: ts.createdAt || ts.submittedAt,
      }));
    }

    // H. Fallback if single feedback string is on vItem (e.g. procedureSensoryFeedback)
    const singleFeedbackText = vItem?.sensoryFeedback || vItem?.procedureSensoryFeedback;
    if (typeof singleFeedbackText === "string" && singleFeedbackText.trim()) {
      return [
        {
          _id: "vitem-feedback",
          status: "Approved",
          comment: singleFeedbackText,
          remark: vItem?.sensoryRemark || "",
          createdAt: vItem?.updatedAt || vItem?.createdAt,
        },
      ];
    }

    return [];
  }, [
    vItem?.sensoryFeedbacks,
    vItem?.feedbacks,
    vItem?.sensoryTopSheets,
    vItem?.sensoryFeedback,
    vItem?.procedureSensoryFeedback,
    vItem?.sensoryRemark,
    vItem?.updatedAt,
    vItem?.createdAt,
    recipeFeedbackData,
    topSheetBySample,
  ]);

  const isLoading = (isFeedbackLoading && Boolean(recipeId)) || (isTopSheetLoading && Boolean(sampleId));

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-[#0D0B14]">
      {/* Sensory Feedback Cards */}
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
                className="p-5 rounded-2xl bg-white dark:bg-[#121019] border border-[#EEEAF5] dark:border-primary/25 space-y-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                {/* Top Status Pill */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center px-3.5 py-1 rounded-full text-xs font-medium border",
                      isRework
                        ? "bg-[#F3EBFD] border-[#DBCDF0] text-[#784AB5] dark:bg-purple-900/20 dark:border-purple-800/40 dark:text-purple-300"
                        : isApproved
                        ? "bg-[#EAF7EE] border-[#8EDAA9] text-[#228551] dark:bg-green-900/20 dark:border-green-800/40 dark:text-green-300"
                        : "bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>

                {/* Number & Date Row with Bottom Separator Line */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EBF6] dark:border-white/10">
                  <span className="w-7 h-6 flex items-center justify-center rounded-md bg-[#ECE5F6] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 font-bold text-xs shrink-0">
                    {String(fbIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-[#7A7585] dark:text-gray-400 font-normal">
                    {formatSensoryDateTime(fb.createdAt || fb.submittedAt || fb.date, formatDate)}
                  </span>
                </div>

                {/* Comment Section */}
                {fb.comment && (
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-[13px] font-medium text-[#7A7585] dark:text-gray-400">
                      Comment
                    </h4>
                    <p className="text-xs sm:text-[13px] leading-relaxed font-normal text-[#1E1B24] dark:text-gray-200">
                      {fb.comment}
                    </p>
                  </div>
                )}

                {/* Remark Section */}
                {fb.remark && (
                  <div className="space-y-1 pt-1">
                    <h4 className="text-xs sm:text-[13px] font-medium text-[#7A7585] dark:text-gray-400">
                      Remark
                    </h4>
                    <p className="text-xs sm:text-[13px] leading-relaxed font-normal text-[#1E1B24] dark:text-gray-200">
                      {fb.remark}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : isLoading ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121019] border border-[#EEEAF5] dark:border-primary/20 text-xs text-[#7A7585] dark:text-gray-400 text-center py-8">
          Loading sensory feedback...
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121019] border border-[#EEEAF5] dark:border-primary/20 text-xs text-[#7A7585] dark:text-gray-400 italic text-center py-8">
          No sensory feedback from top-sheet yet
        </div>
      )}
    </div>
  );
}

// ================= SENSORY FEEDBACK LEFT COLUMN =================
export function SensoryFeedbackLeftHeader({ height, className }) {
  return (
    <div
      style={height ? { height: `${height}px` } : undefined}
      className={cn("px-6 py-4 flex-1 flex flex-col justify-start", className)}
    >
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
        Sensory Feedback
      </h2>
    </div>
  );
}
