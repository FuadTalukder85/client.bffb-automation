import React, { useState, useRef, useEffect } from "react";
import { X, Eye, Trash2, FileText, Plus } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import {
  useDeleteTestRecordAttachment,
  useUploadTestRecordAttachments,
} from "@/hooks/useSamples";
import { toast } from "sonner";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const bytesToKB = (bytes = 0) => `${(Number(bytes || 0) / 1024).toFixed(2)} KB`;

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

const normalizeAttachment = (attachment = {}) => {
  const mimeType = attachment.mimeType || "";
  const isPdf = mimeType === "application/pdf";
  return {
    id: attachment.id || attachment._id,
    name: attachment.name || attachment.originalName || "file",
    sizeInBytes: attachment.sizeInBytes ?? attachment.size ?? 0,
    size: attachment.size || bytesToKB(attachment.sizeInBytes ?? attachment.size ?? 0),
    type: attachment.type || (isPdf ? "pdf" : "image"),
    mimeType,
    date:
      attachment.date ||
      (attachment.uploadedAt
        ? new Date(attachment.uploadedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : ""),
    preview: attachment.preview || attachment.url,
  };
};

export default function UploadAttachmentModal({
  open,
  onOpenChange,
  entryDate,
  testRecordId,
  sampleId,
  attachments = [],
  canManage = true,
}) {
  const [newlyUploadedFiles, setNewlyUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  const uploadAttachmentsMutation = useUploadTestRecordAttachments();
  const deleteAttachmentMutation = useDeleteTestRecordAttachment();

  useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => {
      newlyUploadedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [newlyUploadedFiles]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const selected = Array.from(files || []);
    if (!selected.length) return;

    const validFiles = [];
    selected.forEach((file) => {
      if (!ALLOWED_MIME.has(file.type)) {
        toast.error(`${file.name}: unsupported file type`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name}: file size exceeds 10 MB`);
        return;
      }
      validFiles.push(file);
    });

    if (!validFiles.length) return;

    const newFiles = validFiles.map((file) => {
      const type = file.type.startsWith("image/")
        ? "image"
        : file.type === "application/pdf"
          ? "pdf"
          : "other";
      const newFile = {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: bytesToKB(file.size),
        type,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };

      if (type === "image") {
        newFile.preview = URL.createObjectURL(file);
      }

      return newFile;
    });

    setNewlyUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachmentToDelete({ id, type: "existing" });
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveAttachment = async () => {
    if (!attachmentToDelete?.id || !testRecordId || !canManage) {
      setIsDeleteModalOpen(false);
      setAttachmentToDelete(null);
      return;
    }

    try {
      const response = await deleteAttachmentMutation.mutateAsync({
        id: testRecordId,
        attachmentId: attachmentToDelete.id,
        sampleId,
      });
      const serverAttachments = response?.data?.attachments || response?.attachments;
      const deleted = Array.isArray(serverAttachments)
        ? true
        : !serverAttachments;
      if (!deleted) {
        throw new Error("Attachment delete response invalid");
      }
      toast.success(
        getResponseMessage(response, "Attachment deleted successfully")
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete attachment"
      );
    }

    setIsDeleteModalOpen(false);
    setAttachmentToDelete(null);
  };

  const removeNewAttachment = (id) => {
    setNewlyUploadedFiles((prev) => {
      const fileToRemove = prev.find((file) => file.id === id);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleUpload = async () => {
    if (!testRecordId) {
      toast.error("Test record not found");
      return;
    }
    if (!canManage) {
      toast.error("You do not have permission to upload attachments");
      return;
    }
    if (!newlyUploadedFiles.length) return;

    try {
      const response = await uploadAttachmentsMutation.mutateAsync({
        id: testRecordId,
        files: newlyUploadedFiles.map((f) => f.file),
        sampleId,
      });

      const serverAttachments = response?.data?.attachments || response?.attachments;
      if (!Array.isArray(serverAttachments)) {
        throw new Error("Attachment upload response invalid");
      }

      newlyUploadedFiles.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      setNewlyUploadedFiles([]);
      toast.success(
        getResponseMessage(response, "Attachments uploaded successfully")
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload attachments"
      );
    }
  };

  const normalizedAttachments = Array.isArray(attachments)
    ? attachments.map(normalizeAttachment)
    : [];
  const images = normalizedAttachments.filter((a) => a.type === "image");
  const files = normalizedAttachments.filter((a) => a.type === "pdf" || a.type === "other");
  const isBusy = uploadAttachmentsMutation.isPending || deleteAttachmentMutation.isPending;

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent className="max-w-[550px] lg:max-w-[293px] xl:max-w-[391px] 2xl:max-w-[440px] 3xl:max-w-[550px] h-auto max-h-[95vh] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-gray-900 rounded-xl">
          <ModalHeader className="px-6 lg:px-6.5 2xl:px-8 3xl:px-10 pt-10 lg:pt-5.5 xl:pt-6.5 2xl:pt-8 3xl:pt-10 pb-0 relative block text-left sm:text-left">
            <div className="flex flex-col pr-10 lg:pr-5.5 xl:pr-6.5 2xl:pr-8 3xl:pr-10">
              <ModalTitle className="text-[24px] lg:text-[13px] xl:text-[17px] 2xl:text-[19px] 3xl:text-[24px] font-semibold text-[#0D111A] dark:text-white leading-tight mb-1">
                Checking Date
              </ModalTitle>
              <p className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] text-[#A0A0A1] font-semibold">{entryDate || ""}</p>
            </div>
            <button 
              onClick={() => onOpenChange(false)} 
              className="absolute right-6 sm:right-8 top-10 lg:top-5.5 xl:top-6.5 2xl:top-8 3xl:top-10 p-1.5 rounded-full bg-[#F0EBF8] dark:bg-gray-800 text-primary dark:text-nav-highlight hover:bg-[#E2D8F0] dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
            </button>
          </ModalHeader>

          <div className="px-6 lg:px-6.5 2xl:px-8 3xl:px-10 pt-2 pb-3 lg:pb-3.5 xl:pb-4.5 2xl:pb-5 3xl:pb-6 space-y-4 lg:space-y-5 xl:space-y-6 2xl:space-y-7 3xl:space-y-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
            {/* Upload Section */}
            <div className="space-y-3">
              <p className="text-[12px] lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[12px] font-medium text-[#A0A0A1]">Uploads Files</p>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "relative group rounded-2xl border-2 border-dashed border-primary dark:border-gray-700 transition-all bg-white dark:bg-gray-800",
                  dragActive ? "border-primary bg-primary/5" : "hover:border-primary/50",
                  newlyUploadedFiles.length > 0 ? "p-4 h-auto" : "h-20 lg:h-21 xl:h-28 2xl:h-32 3xl:h-40 flex flex-col items-center justify-center gap-2 cursor-pointer"
                )}
                onClick={() => canManage && newlyUploadedFiles.length === 0 && inputRef.current?.click()}
              >
                <input 
                  ref={inputRef}
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => handleFiles(e.target.files)}
                  accept="image/*,application/pdf"
                  disabled={!canManage || isBusy}
                />
                {newlyUploadedFiles.length === 0 ? (
                  <>
                    <div className="text-primary">
                      <svg className="w-8 lg:w-5 xl:w-7 2xl:w-8 3xl:w-10 h-8 lg:h-5 xl:h-7 2xl:h-8 3xl:h-10" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 28V14M21 14L15.75 19.25M21 14L26.25 19.25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M36.75 28V31.5C36.75 32.4283 36.3813 33.3185 35.7249 33.9749C35.0685 34.6313 34.1783 35 33.25 35H8.75C7.82174 35 6.9315 34.6313 6.27513 33.9749C5.61875 33.3185 5.25 32.4283 5.25 31.5V28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-medium text-[#0D111A] dark:text-gray-300">Drag & drop your images or files here.</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {newlyUploadedFiles.map((file) => (
                      <AttachmentItem key={file.id} item={file} onRemove={() => removeNewAttachment(file.id)} isNew={true} />
                    ))}
                    <button 
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={!canManage || isBusy}
                      className="w-full flex items-center justify-center gap-2 p-2 border-t border-dashed mt-3 text-sm font-medium text-primary hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add more files</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-center pt-2">
                <button 
                  type="button"
                  onClick={handleUpload}
                  disabled={newlyUploadedFiles.length === 0 || !canManage || isBusy}
                  className="h-6 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 px-7 lg:px-8 xl:px-10 2xl:px-12 3xl:px-14 rounded-lg bg-primary text-white font-bold transition-all text-[16px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] 3xl:text-[16px] shadow-lg shadow-primary/20 disabled:bg-primary/50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {uploadAttachmentsMutation.isPending ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            {/* Current Attachments */}
            <div className="space-y-6 lg:space-y-3.5 xl:space-y-4 2xl:space-y-4.5 3xl:space-y-6">
              <h3 className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold text-[#0D111A] dark:text-white">Current Attachments</h3>
              
              {/* Images */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[12px] lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-[12px] font-medium text-[#A0A0A1]">Images</p>
                  <div className="space-y-3">
                    {images.map((img) => (
                      <AttachmentItem
                        key={img.id}
                        item={img}
                        onRemove={() => handleRemoveAttachment(img.id)}
                        showPreview
                        canManage={canManage && !isBusy}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[12px] lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-[12px] font-medium text-[#A0A0A1]">Files</p>
                  <div className="space-y-3">
                    {files.map((file) => (
                      <AttachmentItem
                        key={file.id}
                        item={file}
                        onRemove={() => handleRemoveAttachment(file.id)}
                        showPreview
                        canManage={canManage && !isBusy}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalContent>
      </Modal>
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmRemoveAttachment}
        title="Confirm Deletion"
        description="Are you sure you want to delete this attachment? This action cannot be undone."
      />
    </>
  );
}

function AttachmentItem({ item, onRemove, isNew = false, showPreview = false, canManage = true }) {
  const canPreview = Boolean(item?.preview);

  const handlePreview = () => {
    if (!canPreview) return;
    window.open(item.preview, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center justify-between p-2 border border-[#F3F4F6] dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800/50 group transition-all w-full overflow-hidden">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-14 h-14 rounded-2xl bg-[#F0EBF8] dark:bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
          {item.type === "image" && item.preview ? (
            <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <FileText size={24} className="text-primary" />
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] lg:text-[7.5px] xl:text-[10px] 2xl:text-[11.5px] 3xl:text-[14px] font-semibold text-[#A0A0A1] dark:text-gray-200 truncate">{item.name}</span>
            <span className="text-[10px] lg:text-[5.5px] xl:text-[7.5px] 2xl:text-[8.5px] 3xl:text-[10px] bg-[#F0EBF8] dark:bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold shrink-0">{item.size}</span>
          </div>
          <span className="text-[11px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] text-[#A0A0A1] font-medium truncate">{isNew ? `Added on ${item.date}` : `Uploaded on ${item.date}`}</span>
        </div>
      </div>
      <div className="flex items-center pr-1 shrink-0 ml-2">
        <div className="flex items-center bg-[#F0EBF8] dark:bg-gray-800 rounded-xl overflow-hidden">
            {showPreview && (
              <button
                type="button"
                onClick={handlePreview}
                disabled={!canPreview}
                className="p-2.5 text-primary hover:bg-[#E2D8F0] dark:hover:bg-gray-700 transition-all border-r border-[#E2D8F0] dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                  <Eye size={20} />
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              disabled={!canManage}
              className="p-2.5 text-[#A0A0A1] dark:text-gray-400 hover:text-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>
    </div>
  );
}
