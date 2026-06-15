import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function EvaluationCommentModal({
  open,
  onOpenChange,
  data,
  comments = [],
  remarks = [],
  hidePanelistName = false,
  title = "Evaluation Feedback",
  showRemark = true,
}) {
  const [formData, setFormData] = useState({
    name: "",
    comment: "",
    remark: "",
  });

  useEffect(() => {
    if (data) {
      const panelistId = data.panelistID?._id || data.panelistId;
      const matchingComment = comments.find((c) => c.panelistId === panelistId);
      const matchingRemark = remarks.find((r) => r.panelistId === panelistId);

      setFormData({
        name: data.panelistID?.name || data.panelistName || "",
        comment: matchingComment?.comment || data.comment || "",
        remark: matchingRemark?.remark || data.remark || "",
      });
    }
  }, [data, comments, remarks]);

  if (!data) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[550px] lg:max-w-[290px] xl:max-w-[390px] 2xl:max-w-[440px] 3xl:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-900 rounded-2xl py-6">
        <ModalHeader className="px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 pb-2 lg:pb-2.5 xl:pb-3 2xl:pb-3.5 3xl:pb-4 relative block text-center sm:text-center border-b border-gray-100 dark:border-gray-800">
          <ModalTitle className="text-[22px] lg:text-[11px] xl:text-[15px] 2xl:text-[17px] 3xl:text-[22px] font-bold text-[#0D111A] dark:text-white leading-tight">
            {title}
          </ModalTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-2.5 lg:right-3 xl:right-4 2xl:right-4.5 3xl:right-6 top-0 p-0.5 lg:p-0.5 xl:p-0.5 2xl:p-1 3xl:p-1.5 rounded-full bg-[#F0EBF8] dark:bg-gray-800 text-primary hover:bg-[#E2D8F0] dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
          </button>
        </ModalHeader>

        <div className="px-4 lg:px-4.5 xl:px-5.5 2xl:px-6.5 3xl:px-8 pt-2 lg:pt-2.5 xl:pt-3.5 2xl:pt-4.5 3xl:pt-6 space-y-1 lg:space-y-1 xl:space-y-2 2xl:space-y-3 3xl:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {!hidePanelistName && (
            <div className="space-y-2">
              <label className="text-[13px] lg:text-[8.5px] xl:text-[9.5px] 2xl:text-[10.5px] 3xl:text-[13px] font-bold text-primary dark:text-gray-400 tracking-widest px-1">
                Panelist Name
              </label>
              <div className="w-full p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 rounded-md bg-[#F0EBF8]/30 dark:bg-gray-800 dark:border-gray-700">
                <p className="text-[14px] 2xl:text-[12px] xl:text-[10px] lg:text-[8px] font-semibold text-[#1A1A1A] dark:text-white">
                  {formData.name || "—"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[13px] lg:text-[8.5px] xl:text-[9.5px] 2xl:text-[10.5px] 3xl:text-[13px] not-open:font-bold text-primary dark:text-gray-400 tracking-widest px-1">
              Comment
            </label>
            <div className="w-full min-h-[70px] lg:min-h-[37px] xl:min-h-[50px] 2xl:min-h-[55px] 3xl:min-h-[70px] p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 rounded-md bg-[#F3F0FA] dark:bg-gray-800 dark:border-gray-700">
              <p className="text-[14px] 2xl:text-[12px] xl:text-[10px] lg:text-[8px] font-medium text-[#4B5563] dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {formData.comment || "No comment available."}
              </p>
            </div>
          </div>

          {showRemark && (
            <div className="space-y-2">
              <label className="text-[13px] lg:text-[8.5px] xl:text-[9.5px] 2xl:text-[10.5px] 3xl:text-[13px] font-bold text-primary dark:text-gray-400 tracking-widest px-1">
                Remark
              </label>
              <div className="w-full min-h-[90px] lg:min-h-[48px] xl:min-h-[64px] 2xl:min-h-[72px] 3xl:min-h-[90px] p-4 lg:p-2 xl:p-2.5 2xl:p-3 3xl:p-4 rounded-md bg-[#F3F0FA] dark:bg-gray-800 dark:border-gray-700">
                <p className="text-[14px] 2xl:text-[12px] xl:text-[10px] lg:text-[8px] font-medium text-[#4B5563] dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {formData.remark || "No remarks available."}
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-center pb-2">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-40 lg:w-20 xl:w-28 2xl:w-32 3xl:w-40 h-10 3xl:h-10 2xl:h-8 xl:h-7 lg:h-5 rounded-full bg-primary text-white font-bold hover:bg-primary-shade-1 transition-all border-none"
            >
              Close
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
