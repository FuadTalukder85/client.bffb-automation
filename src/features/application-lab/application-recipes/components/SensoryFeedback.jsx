import React, { useState } from "react";
import { cn } from "@/lib/utils";

// ================= SENSORY FEEDBACK VERSION COLUMN =================
export default function SensoryFeedback({
  vItem,
  formatDate = (d) => d || "-",
}) {
  const [newCommentText, setNewCommentText] = useState("");

  return (
    <div className="p-4 space-y-6 bg-white dark:bg-[#0D0B14]">
      {/* Others Block (Image 4) */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Others
          </span>
        </div>

        <div className="space-y-3">
          {Array.isArray(vItem?.activities) && vItem.activities.length > 0 ? (
            vItem.activities.map((act, actIdx) => (
              <div key={actIdx} className="p-3.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#4B208B] text-white font-bold text-[10px] flex items-center justify-center">
                    {(act.userName || act.user || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                    <span className="font-bold text-gray-900 dark:text-white truncate">{act.userName || act.user || "User"}</span>
                    {act.tag && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 text-[10px] font-semibold whitespace-nowrap">
                        {act.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDate(act.createdAt) || "-"}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[11px]">
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
              className="w-full p-3 rounded-2xl border border-[#EEEBF4] dark:border-primary/30 text-xs leading-relaxed bg-[#FCFBFD] dark:bg-[#121019] text-gray-900 dark:text-white resize-none focus:outline-none shadow-sm"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setNewCommentText("")}
                className="px-4 py-1.5 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sensory Feedback Cards (Image 5) */}
      {Array.isArray(vItem?.sensoryFeedbacks) && vItem.sensoryFeedbacks.length > 0 && (
        <div className="space-y-4 pt-2">
          {vItem.sensoryFeedbacks.map((fb, fbIdx) => (
            <div key={fbIdx} className="p-4 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-3 py-1 rounded-full font-bold text-xs",
                  fb.status === "Approved" ? "bg-[#E8F8F0] text-[#1B805A] border border-green-200" : "bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300"
                )}>
                  {fb.status || "Feedback"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-[#EFEAF9] dark:bg-primary/25 text-[#4B208B] dark:text-purple-300 font-bold">
                  {String(fbIdx + 1).padStart(2, "0")}
                </span>
                <span className="text-gray-500 font-medium text-[11px]">
                  {formatDate(fb.createdAt) || "-"}
                </span>
              </div>

              {fb.comment && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500">Comment</span>
                  <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                    {fb.comment}
                  </p>
                </div>
              )}

              {fb.remark && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500">Remark</span>
                  <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                    {fb.remark}
                  </p>
                </div>
              )}
            </div>
          ))}
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
