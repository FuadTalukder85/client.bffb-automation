import React, { useMemo, useRef, useState } from "react";
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
import { cn, extractPathFromHeader, formatHeaderLabel } from "@/lib/utils";
import { Upload, AlertCircle, CheckCircle, Loader2, FileSpreadsheet } from "lucide-react";


const isNonEmptyRow = (row = []) =>
  row.some((cell) => String(cell ?? "").trim() !== "");

const formatCellValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

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
  XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

const getHeaderIndexByPath = (headers = [], path) =>
  headers.findIndex((header) => extractPathFromHeader(header) === path);

export function UploadCSVModal({
  open,
  onOpenChange,
  onUpload,
  isLoading = false,
  uploadError = null,
  className,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const fileInputRef = useRef(null);

  const isValidFile = (file) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    return validTypes.includes(file.type) || /\.(xlsx?|csv)$/i.test(file.name);
  };

  const resetState = () => {
    setDragActive(false);
    setSelectedFile(null);
    setIsParsing(false);
    setPreviewError(null);
    setPreviewData(null);
    setSelectedProjectIds([]);
  };

  const handleClose = (isOpen) => {
    if (isLoading) return;
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseWorkbookPreview = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    const projectsSheet = workbook.Sheets["Projects"];
    if (!projectsSheet) {
      throw new Error("The workbook is missing the required `Projects` sheet.");
    }

    const projectMatrix = buildSheetMatrix(projectsSheet).filter(
      (row, index) => index === 0 || isNonEmptyRow(row)
    );

    if (projectMatrix.length < 2) {
      throw new Error("The `Projects` sheet does not contain any project rows.");
    }

    const projectHeaders = projectMatrix[0].map((header) => String(header || "").trim());
    const projectIdIndex = getHeaderIndexByPath(projectHeaders, "_id");
    const projectCodeIndex = getHeaderIndexByPath(projectHeaders, "masterProject.code");
    const projectTitleIndex = getHeaderIndexByPath(projectHeaders, "masterProject.title");

    if (projectIdIndex === -1 && projectCodeIndex === -1) {
      throw new Error(
        "The `Projects` sheet must include either `Project Id (_id)` or `Master Project Code (masterProject.code)` columns."
      );
    }

    const projectRows = projectMatrix.slice(1).map((rowValues, index) => {
      const normalizedValues = projectHeaders.map((_, columnIndex) =>
        formatCellValue(rowValues[columnIndex])
      );

      const projectId = projectIdIndex >= 0 ? normalizedValues[projectIdIndex] : "";
      const projectCode = projectCodeIndex >= 0 ? normalizedValues[projectCodeIndex] : "";
      const selectionId = projectId || projectCode;
      const projectTitle = projectTitleIndex >= 0 ? normalizedValues[projectTitleIndex] : "";

      return {
        rowIndex: index,
        excelRowNumber: index + 2,
        projectId: selectionId,
        projectCode,
        projectTitle,
        values: normalizedValues,
      };
    });

    return {
      projectHeaders,
      projectRows,
    };
  };

  const handleFileSelection = async (file) => {
    if (!file || !isValidFile(file)) {
      setPreviewError("Please choose a valid Excel or CSV file.");
      return;
    }

    setIsParsing(true);
    setPreviewError(null);
    setSelectedFile(file);

    try {
      const parsedPreview = await parseWorkbookPreview(file);
      setPreviewData(parsedPreview);
      setSelectedProjectIds(parsedPreview.projectRows.map((row) => row.projectId).filter(Boolean));
    } catch (error) {
      setPreviewData(null);
      setSelectedProjectIds([]);
      setPreviewError(error.message || "Unable to read the workbook.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    void handleFileSelection(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    void handleFileSelection(file);
  };

  const allSelectableProjectIds = useMemo(
    () => previewData?.projectRows.map((row) => row.projectId).filter(Boolean) || [],
    [previewData]
  );

  const selectedProjectIdSet = useMemo(
    () => new Set(selectedProjectIds),
    [selectedProjectIds]
  );
  const allSelected =
    allSelectableProjectIds.length > 0 &&
    allSelectableProjectIds.every((projectId) => selectedProjectIdSet.has(projectId));

  const handleToggleAll = () => {
    if (!previewData) return;

    setSelectedProjectIds((current) =>
      current.length === allSelectableProjectIds.length ? [] : allSelectableProjectIds
    );
  };

  const handleToggleProject = (projectId) => {
    setSelectedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId]
    );
  };

  const handleUpload = async () => {
    if (!selectedFile || !previewData || selectedProjectIds.length === 0 || !onUpload) {
      return;
    }

    const selectedProjectRows = previewData.projectRows
      .filter((row) => selectedProjectIdSet.has(row.projectId))
      .map((row) => row.values);

    const workbook = XLSX.utils.book_new();
    const projectsSheet = XLSX.utils.aoa_to_sheet([
      previewData.projectHeaders,
      ...selectedProjectRows,
    ]);
    XLSX.utils.book_append_sheet(workbook, projectsSheet, "Projects");

    const workbookData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const filteredFile = new File(
      [workbookData],
      selectedFile.name.replace(/(\.[^.]+)?$/, "-selected.xlsx"),
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    await onUpload(filteredFile);
    resetState();
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "w-[96vw] max-w-[94vw] h-[92vh] max-h-[92vh] overflow-hidden flex flex-col gap-0 p-4 lg:p-3 xl:p-4 2xl:p-5 3xl:p-6 rounded-2xl md:rounded-3xl",
          className
        )}
      >
        <ModalHeader className="pb-4 lg:pb-2 xl:pb-2.5 2xl:pb-3 3xl:pb-4">
          <ModalTitle className="font-semibold text-xs lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl">
            Import Projects
          </ModalTitle>
          <ModalDescription className="text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
            Preview the workbook, select the projects you want, and import only those rows.
          </ModalDescription>
        </ModalHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-2 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 overflow-hidden">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full rounded-xl border-2 border-dashed p-5 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-5 text-center transition-colors cursor-pointer",
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              selectedFile ? "border-green-500 bg-green-50 dark:bg-primary/10" : ""
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading || isParsing}
            />

            <div className="flex flex-col items-center gap-3 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3">
              <div className="flex items-center justify-center w-7.5 lg:w-7.5 xl:w-10 2xl:w-11 3xl:w-14 h-7.5 lg:h-7.5 xl:h-10 2xl:h-11 3xl:h-14 rounded-full bg-primary text-white">
                <FileSpreadsheet className="w-7 lg:w-3.5 xl:w-5 2xl:w-5.5 3xl:w-7 h-7 lg:h-3.5 xl:h-5 2xl:h-5.5 3xl:h-7" />
              </div>

              <div>
                <p className="text-[9px] lg:text-[9px] xl:text-[11px] 2xl:text-xs 3xl:text-base font-medium text-foreground">
                  {selectedFile ? selectedFile.name : "Drag and drop an Excel export, or click to browse"}
                </p>
                <p className="mt-1 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-lighter-text">
                  Supports `.xlsx`, `.xls`, and `.csv`
                </p>
              </div>

              {selectedFile && !isParsing && (
                <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-green-700">
                  <CheckCircle className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                  <span>{(selectedFile.size / 1024).toFixed(1)} KB loaded</span>
                </div>
              )}

              {isParsing && (
                <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-primary">
                  <Loader2 className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                  <span>Reading workbook preview...</span>
                </div>
              )}
            </div>
          </div>

          {previewData && (
            <div className="flex-1 min-h-0 rounded-xl border border-border bg-background overflow-hidden flex flex-col">
              <div className="flex flex-col gap-3 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-3 border-b border-border px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-1.5 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3 md:flex-row md:items-center md:justify-between flex-none">
                <div>
                  <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm  font-semibold text-foreground">
                    Workbook Preview
                  </p>
                  <p className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-foreground">
                    {selectedProjectIds.length} of {previewData.projectRows.length} projects selected
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs text-foreground">
                  <span className="rounded-full bg-muted px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-0.5 xl:py-0.5 2xl:py-1 3xl:py-1">
                    Projects: {previewData.projectRows.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className="rounded-full border border-table-stroke px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-0.5 lg:py-0.5 xl:py-0.5 2xl:py-1 3xl:py-1 font-medium text-nav-highlight hover:bg-primary-shade-2"
                  >
                    {allSelected ? "Clear Selection" : "Select All"}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
                <table className="min-w-full border-separate border-spacing-0 text-[8px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-foreground">
                  <thead className="sticky top-0 z-30">
                    <tr>
                      <th className="sticky left-0 z-20 bg-background border-b border-l border-r border-border px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-left font-semibold min-w-[50px] lg:min-w-[64px] xl:min-w-[85px] 2xl:min-w-[96px] 3xl:min-w-[120px] relative shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <span className="pointer-events-none absolute inset-y-0 left-[-100px] right-0 bg-inherit" aria-hidden="true" />
                        <span className="relative z-10">Select</span>
                      </th>
                      {previewData.projectHeaders.map((header, index) => (
                        <th
                          key={`${header}-${index}`}
                          className="bg-background border-b border-r border-border px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 text-left font-semibold whitespace-nowrap z-20"
                        >
                          {formatHeaderLabel(header)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.projectRows.map((row) => {
                      const checked = selectedProjectIdSet.has(row.projectId);

                      return (
                        <tr
                          key={`${row.projectId}-${row.rowIndex}`}
                          className={cn(
                            checked ? "bg-primary/5" : "bg-background"
                          )}
                        >
                          <td className="sticky left-0 z-20 border-l border-r border-b border-border px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 align-top min-w-[50px] lg:min-w-[64px] xl:min-w-[85px] 2xl:min-w-[96px] 3xl:min-w-[120px] bg-[#e2e7ee] dark:bg-[#552e8e] relative shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <span className="pointer-events-none absolute inset-y-0 left-[-100px] right-0 bg-inherit" aria-hidden="true" />
                            <label className="relative z-10 flex items-start gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleProject(row.projectId)}
                                className="mt-0.5 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 rounded border-table-stroke text-primary focus:ring-primary"
                              />
                              <span className="min-w-0">
                                <span className="block font-medium text-foreground">
                                  {row.projectCode || row.projectId || `Row ${row.excelRowNumber}`}
                                </span>
                                <span className="block text-[7px] lg:text-[7.5px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] text-muted-foreground">
                                  {row.projectTitle || `Excel row ${row.excelRowNumber}`}
                                </span>
                              </span>
                            </label>
                          </td>

                          {row.values.map((value, index) => (
                            <td
                              key={`${row.projectId}-${index}`}
                              className="border-r border-b border-border/60 px-3 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 py-1 lg:py-1 xl:py-[5px] 2xl:py-1.5 3xl:py-2 align-top whitespace-nowrap"
                              title={value}
                            >
                              <div className="max-w-[120px] lg:max-w-[128px] xl:max-w-[170px] 2xl:max-w-[192px] 3xl:max-w-[240px] z-0 overflow-hidden text-ellipsis">
                                {value || "—"}
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

          <div className="w-full rounded-lg bg-muted/40 px-2 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-4 py-3 lg:py-1 xl:py-1.5 2xl:py-2 3xl:py-3 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs text-foreground">
            The importer currently syncs only the `Projects` sheet.
          </div>

          {(previewError || uploadError) && (
            <div className="flex w-full  gap-2 gap-[4.5px] xl:gap-[5.5px] 2xl:gap-[6.5px] 3xl:gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 w-3.5 h-3.5 lg:h-2.5 xl:h-3.5 2xl:h-4 3xl:h-5 lg:w-2.5 xl:w-3.5 2xl:w-4 3xl:w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{previewError || uploadError}</p>
            </div>
          )}
        </div>

        <ModalFooter className="flex-none border-t border-border pt-2 lg:pt-2 xl:pt-2.5 2xl:pt-3 3xl:pt-4 flex flex-row justify-center w-full gap-2 lg:gap-1 xl:gap-2 2xl:gap-3 3xl:gap-4 mt-3 lg:mt-3 xl:mt-4 2xl:mt-5 3xl:mt-6 bg-background">
          <Button
            intent="outline"
            onClick={() => handleClose(false)}
            disabled={isLoading || isParsing}
            className="w-full max-w-[110px] lg:max-w-[117px] xl:max-w-[156px] 2xl:max-w-[176px] 3xl:max-w-[220px] h-6 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 text-[10px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base border-table-stroke text-nav-highlight hover:bg-primary-shade-2"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleUpload}
            disabled={!previewData || selectedProjectIds.length === 0 || isLoading || isParsing}
            className="w-full max-w-[118px] lg:max-w-[128px] xl:max-w-[170px] 2xl:max-w-[192px] 3xl:max-w-[240px] h-6 lg:h-6.5 xl:h-8.5 2xl:h-9.5 3xl:h-12 text-[10px] lg:text-[10px] xl:text-xs 2xl:text-sm 3xl:text-base bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                Import Selected ({selectedProjectIds.length || 0})
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
