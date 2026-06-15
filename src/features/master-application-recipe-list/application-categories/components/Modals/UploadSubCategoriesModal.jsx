import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { cn, extractPathFromHeader, formatHeaderLabel } from "@/lib/utils";

const isNonEmptyRow = (row = []) =>
  row.some((cell) => String(cell ?? "").trim() !== "");

const formatCellValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const buildSheetMatrix = (sheet) =>
  XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

export function UploadSubCategoriesModal({
  open,
  onOpenChange,
  onUpload,
  isLoading = false,
  uploadResult = null,
  uploadError = null,
  className,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [headerValid, setHeaderValid] = useState(true);
  const [headerErrors, setHeaderErrors] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const fileInputRef = React.useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    void handleFileSelection(file);
  };

  const isValidFile = (file) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    return validTypes.includes(file.type) || /\.(xlsx?|csv)$/.test(file.name);
  };

  const normalizeKey = (key = "") =>
    key
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, " ");
  const HEADER_MAP = {
    name: "name",
    "subcategory name": "name",
    "sub category name": "name",
    subcategory: "name",
    "sub category": "name",
    isactive: "isActive",
    "is active": "isActive",
    status: "isActive",
  };
  const REQUIRED = ["name"];

  const readHeaders = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) return [];
      const sheet = workbook.Sheets[firstSheet];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
      const headerRow = rows?.[0] || [];
      return headerRow
        .map((h) => {
          const path = extractPathFromHeader(h);
          if (path) return path;
          return HEADER_MAP[normalizeKey(h)] || null;
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  };

  const validateHeaders = async (file) => {
    const mappedHeaders = await readHeaders(file);
    const headerSet = new Set(mappedHeaders);
    const missing = REQUIRED.filter((h) => !headerSet.has(h));
    setHeaderValid(missing.length === 0);
    setHeaderErrors(missing);
  };

  const parseWorkbookPreview = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet)
      throw new Error("The workbook does not contain any sheets.");
    const sheet = workbook.Sheets[firstSheet];
    const sheetMatrix = buildSheetMatrix(sheet).filter(
      (row, index) => index === 0 || isNonEmptyRow(row),
    );
    if (sheetMatrix.length < 2)
      throw new Error("The selected sheet does not contain any data rows.");
    const headers = sheetMatrix[0].map((header) => String(header ?? "").trim());
    const rows = sheetMatrix.slice(1).map((rowValues, index) => ({
      rowId: `${index}`,
      rowIndex: index,
      excelRowNumber: index + 1,
      values: headers.map((_, columnIndex) =>
        formatCellValue(rowValues[columnIndex]),
      ),
    }));
    return { headers, rows };
  };

  const handleFileSelection = async (file) => {
    if (!file || !isValidFile(file)) {
      setPreviewError("Please choose a valid Excel or CSV file.");
      setPreviewData(null);
      setSelectedRowIds([]);
      return;
    }
    setIsParsing(true);
    setPreviewError(null);
    setSelectedFile(file);
    await validateHeaders(file);
    try {
      const parsedPreview = await parseWorkbookPreview(file);
      setPreviewData(parsedPreview);
      setSelectedRowIds(parsedPreview.rows.map((row) => row.rowId));
    } catch (error) {
      setPreviewData(null);
      setSelectedRowIds([]);
      setPreviewError(error.message || "Unable to read the workbook.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleToggleAll = () => {
    if (!previewData) return;
    const allIds = previewData.rows.map((r) => r.rowId);
    setSelectedRowIds((current) =>
      current.length === allIds.length ? [] : allIds,
    );
  };

  const handleToggleRow = (rowId) => {
    setSelectedRowIds((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId],
    );
  };

  const handleUploadClick = async () => {
    if (
      !selectedFile ||
      !previewData ||
      selectedRowIds.length === 0 ||
      !onUpload
    )
      return;
    if (!headerValid) return;
    const selectedRows = previewData.rows
      .filter((r) => selectedRowIds.includes(r.rowId))
      .map((r) => r.values);
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      previewData.headers,
      ...selectedRows,
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "SubCategories");
    const workbookData = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const filteredFile = new File(
      [workbookData],
      selectedFile.name.replace(/(\.[^.]+)?$/, "-selected.xlsx"),
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );
    await onUpload(filteredFile);
  };

  const handleClose = (isOpen) => {
    if (!isLoading) {
      setSelectedFile(null);
      setHeaderValid(true);
      setHeaderErrors([]);
      setDragActive(false);
      setIsParsing(false);
      setPreviewError(null);
      setPreviewData(null);
      setSelectedRowIds([]);
      onOpenChange(isOpen);
    }
  };

  const isComplete = uploadResult && !isLoading && headerValid;

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "w-[96vw] max-w-[94vw] h-[92vh] max-h-[92vh] overflow-hidden flex flex-col gap-0 p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 rounded-2xl md:rounded-3xl",
          className,
        )}
      >
        {!isComplete ? (
          <>
            <ModalHeader className="pb-4 lg:pb-2 xl:pb-2.5 2xl:pb-3 3xl:pb-4">
              <ModalTitle className="font-semibold text-xs lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl text-center">
                Import Sub-Categories
              </ModalTitle>
              <ModalDescription className="text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-center">
                Upload a CSV or Excel file to bulk import sub-categories
              </ModalDescription>
            </ModalHeader>
            <form className="flex-1 min-h-0 flex flex-col gap-2 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 overflow-hidden">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full rounded-xl border-2 border-dashed p-5 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-5 text-center transition-colors cursor-pointer",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  selectedFile
                    ? "border-green-500 bg-green-50 dark:bg-primary/10"
                    : "",
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => handleFileSelection(e.target.files?.[0])}
                  disabled={isLoading}
                />
                <div className="flex flex-col items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
                  <div className="flex items-center justify-center w-7.5 lg:w-7.5 xl:w-10 2xl:w-11 3xl:w-14 h-7.5 lg:h-7.5 xl:h-10 2xl:h-11 3xl:h-14 rounded-full bg-primary text-white">
                    <FileSpreadsheet className="w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7" />
                  </div>
                  <div>
                    <p className="text-[9px] lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base font-medium text-foreground">
                      {selectedFile
                        ? selectedFile.name
                        : "Drag and drop an Excel export, or click to browse"}
                    </p>
                    <p className="mt-1 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-lighter-text">
                      Supports `.xlsx`, `.xls`, and `.csv`
                    </p>
                  </div>
                  {selectedFile && !isLoading && !isParsing && (
                    <div className="flex items-center gap-2 text-xs text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {(selectedFile.size / 1024).toFixed(1)} KB loaded
                      </span>
                    </div>
                  )}
                  {isParsing && (
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Reading workbook preview...</span>
                    </div>
                  )}
                </div>
              </div>
              {previewData && (
                <div className="flex-1 min-h-0 rounded-xl border border-border bg-background overflow-hidden flex flex-col">
                  <div className="flex flex-col gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 border-b border-border px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 md:flex-row md:items-center md:justify-between flex-none">
                    <div>
                      <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-foreground">
                        Workbook Preview
                      </p>
                      <p className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-foreground">
                        {selectedRowIds.length} of {previewData.rows.length}{" "}
                        rows selected
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground">
                      <span className="rounded-full bg-muted px-3 py-0.5">
                        Rows: {previewData.rows.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleAll}
                        className="rounded-full border border-table-stroke px-3 py-0.5 font-medium text-nav-highlight hover:bg-primary-shade-2"
                      >
                        {selectedRowIds.length === previewData.rows.length
                          ? "Clear Selection"
                          : "Select All"}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
                    <table className="min-w-full border-separate border-spacing-0 text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-foreground">
                      <thead className="sticky top-0 z-30">
                        <tr>
                          <th className="sticky left-0 z-20 bg-background border-b border-l border-r border-border px-3 py-1 text-left font-semibold min-w-[50px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            Select
                          </th>
                          {previewData.headers.map((h, i) => (
                            <th
                              key={i}
                              className="bg-background border-b border-r border-border px-3 py-1 text-left font-semibold whitespace-nowrap"
                            >
                              {formatHeaderLabel(h) || `Col ${i + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.rows.map((row) => {
                          const checked = selectedRowIds.includes(row.rowId);
                          return (
                            <tr
                              key={row.rowId}
                              className={cn(
                                checked ? "bg-primary/5" : "bg-background",
                              )}
                            >
                              <td className="sticky left-0 z-20 border-l border-r border-b border-border px-3 py-1 align-top bg-[#e2e7ee] dark:bg-[#552e8e] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <label
                                  className="relative z-20 flex items-start gap-2 cursor-pointer"
                                  onClick={() => handleToggleRow(row.rowId)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="mt-0.5 w-4 h-4 rounded border-table-stroke text-primary focus:ring-primary"
                                  />
                                  <span className="block font-medium">
                                    Row {row.excelRowNumber}
                                  </span>
                                </label>
                              </td>
                              {row.values.map((v, i) => (
                                <td
                                  key={i}
                                  className="border-r border-b border-border/60 px-3 py-1 align-top whitespace-nowrap"
                                  title={v}
                                >
                                  <div className="max-w-[120px] overflow-hidden text-ellipsis">
                                    {v || "—"}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {(!headerValid || uploadError || previewError) && (
                <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 w-4 h-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">
                      {previewError
                        ? "Preview Failed"
                        : headerValid
                          ? "Upload Failed"
                          : "Invalid File"}
                    </p>
                    {previewError && (
                      <p className="text-xs text-red-700 mt-1">
                        {previewError}
                      </p>
                    )}
                    {!headerValid && (
                      <p className="text-xs text-red-700 mt-1">
                        Missing columns: {headerErrors.join(", ")}
                      </p>
                    )}
                    {uploadError && (
                      <p className="text-xs text-red-700 mt-1">{uploadError}</p>
                    )}
                  </div>
                </div>
              )}
            </form>
            <ModalFooter className="flex-none border-t border-border pt-2 lg:pt-2 xl:pt-2.5 2xl:pt-3 3xl:pt-4 flex flex-row justify-center w-full gap-2 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 mt-3 lg:mt-3 xl:mt-4 2xl:mt-5 3xl:mt-6 bg-background">
              <Button
                type="button"
                intent="outline"
                onClick={() => handleClose(false)}
                disabled={isLoading || isParsing}
                className="w-full max-w-[110px] lg:max-w-[117px] xl:max-w-[156px] 2xl:max-w-[176px] 3xl:max-w-[220px] h-6 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 text-[10px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base border-table-stroke text-nav-highlight hover:bg-primary-shade-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                intent="primary"
                disabled={
                  !previewData ||
                  selectedRowIds.length === 0 ||
                  isLoading ||
                  isParsing ||
                  !headerValid
                }
                onClick={handleUploadClick}
                className="w-full max-w-[118px] lg:max-w-[128px] xl:max-w-[170px] 2xl:max-w-[192px] 3xl:max-w-[240px] h-6 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 text-[10px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                    Import Selected ({selectedRowIds.length || 0})
                  </>
                )}
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader className="pb-4">
              <ModalTitle className="font-semibold text-center">
                Upload Complete
              </ModalTitle>
              <ModalDescription className="sr-only">Summary</ModalDescription>
            </ModalHeader>
            <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium">
                  {uploadResult.message ||
                    "Sub-categories imported successfully"}
                </p>
              </div>
              {uploadResult.validationErrors?.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-medium text-yellow-900 mb-2">
                    {uploadResult.validationErrors.length} rows skipped:
                  </p>
                  <div className="max-h-32 overflow-y-auto text-xs text-yellow-700 space-y-1">
                    {uploadResult.validationErrors
                      .slice(0, 5)
                      .map((err, idx) => (
                        <p key={idx}>
                          Row {err.row}: {err.errors?.join(", ") || err.message}
                        </p>
                      ))}
                    {uploadResult.validationErrors.length > 5 && (
                      <p>+ {uploadResult.validationErrors.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <ModalFooter className="flex-none border-t border-border pt-2 flex flex-row justify-center w-full mt-3 bg-background">
              <Button
                type="button"
                intent="primary"
                onClick={() => handleClose(false)}
                className="w-full max-w-[118px] h-6 text-[10px] bg-primary hover:bg-primary/90 text-white"
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
