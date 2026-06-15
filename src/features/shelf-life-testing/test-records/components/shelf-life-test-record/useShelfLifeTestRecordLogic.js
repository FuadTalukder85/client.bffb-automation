import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useNavigate, useParams, useLocation } from "react-router";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useShelfLifeTestingBySample,
  useUpsertShelfLifeTesting,
  useCreateTestRecord,
  useUpdateTestRecord,
  useDeleteTestRecord,
  useRestoreTestRecord,
} from "@/hooks/useSamples";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { PERMISSIONS } from "@/constants/permissions";
import { hasPermission } from "@/lib/utils";

const MOCK_PROJECT = {
  projectName: "Cake Promo V1",
  projectCode: "BC-BA-CB-0000",
};

const MOCK_RECORD_DATA = {
  recipeCode: "CKB 17042401R10",
  recipeName: "Marble Cake 1",
  personResponsible: "Pakiza Rushda",
  productionDate: "2025-12-14",
  startDate: "2025-12-18",
  endDate: "2025-12-26",
  comment: "The sample expires before test period end date. Needs to be reworked.",
  entries: [],
};

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export function useShelfLifeTestRecordLogic() {
  const navigate = useNavigate();
  const { projectId, sampleId } = useParams();
  const location = useLocation();
  const isMobile = useIsMobile();

  const upsertTesting = useUpsertShelfLifeTesting();
  const createRecordMutation = useCreateTestRecord();
  const updateRecordMutation = useUpdateTestRecord();
  const deleteRecordMutation = useDeleteTestRecord();
  const restoreRecordMutation = useRestoreTestRecord();
  const { permissions = [] } = useUserPermissions();
  console.debug("shelf-life hook permissions", permissions);

  // superadmins receive a wildcard permission ("shelf-life-testing:*")
  // which is stripped out by backend expansion, leaving only individual
  // resource-specific permissions such as "shelf-life-testing:read".
  // therefore we treat ANY permission beginning with the resource prefix
  // as enough to enable management actions.
  const canManage = hasPermission(permissions, PERMISSIONS.SHELF_LIFE_TESTING.MANAGE) || 
                   hasPermission(permissions, PERMISSIONS.SHELF_LIFE_TESTING.UPDATE);
  const canExport = hasPermission(permissions, PERMISSIONS.SHELF_LIFE_TESTING.EXPORT_TEST_RECORDS);
  console.debug("canManage?", canManage, "canExport?", canExport);

  const { data: apiData, isLoading } = useShelfLifeTestingBySample(sampleId, { enabled: Boolean(sampleId) });

  const record = apiData?.sample?.project?.masterProject
    ? {
      projectName: apiData.sample.project.masterProject.title,
      projectCode: apiData.sample.project.masterProject.code,
    }
    : location.state?.record || MOCK_PROJECT;

  const [mockRecord, setMockRecord] = useState(MOCK_RECORD_DATA);

  useEffect(() => {
    // apiData can be null or may not include a sample when the request fails or
    // is still initializing. Guard strongly before attempting to access fields
    // on `sample`, since missing data was crashing the component in prod.
    if (!apiData || !apiData.sample) {
      return;
    }

    const { sample, testing, records } = apiData;
    const normalized = {
      recipeCode: sample.recipe?.recipeCode || "",
      recipeName: sample.recipe?.name || "",
      personResponsible: sample.applicationOfficer?.name || "",
      productionDate: sample.createdAt ? new Date(sample.createdAt).toLocaleDateString("en-GB") : null,
      startDate: testing?.testPeriodStartDate ? new Date(testing.testPeriodStartDate).toISOString().slice(0, 10) : "",
      endDate: testing?.testPeriodEndDate ? new Date(testing.testPeriodEndDate).toISOString().slice(0, 10) : "",
      comment: testing?.comment || "",
      isSubmitted: testing?.isSubmitted || false,
      entries: (records || []).map((rec, idx) => ({
        id: rec._id,
        isActive: rec.isActive !== false,
        sl: idx + 1,
        checkingDate: rec.checkingDate ? new Date(rec.checkingDate).toISOString().slice(0, 10) : "",
        attachments: (rec.attachments || []).map((attachment) => ({
          id: attachment._id,
          name: attachment.originalName,
          sizeInBytes: attachment.size,
          size: `${(Number(attachment.size || 0) / 1024).toFixed(2)} KB`,
          type: attachment.mimeType === "application/pdf" ? "pdf" : "image",
          mimeType: attachment.mimeType,
          date: attachment.uploadedAt
            ? new Date(attachment.uploadedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
          preview: attachment.url,
        })),
        conditions: (rec.storageConditions || []).map((c) => ({
          name: c.condition,
          organoleptic: c.organoleptic || "",
          appearance: c.appearance || "",
          physical: c.physicalProperty || "",
          moisture: c.moistureWaterActivity || "",
          microbiologicalTest: c.microbiologicalTest || "",
          comment: c.comment || "",
          score: c.score || 0,
        })),

      })),
    };
    
    // Preserve any temporary entries currently in state
    setMockRecord((prev) => {
      const tempEntries = (prev?.entries || []).filter((e) =>
        e.id?.toString().startsWith("temp-")
      );
      if (tempEntries.length > 0) {
        const adjustedTempEntries = tempEntries.map((e, idx) => ({
          ...e,
          sl: normalized.entries.length + idx + 1,
        }));
        return {
          ...normalized,
          entries: [...normalized.entries, ...adjustedTempEntries],
        };
      }
      return normalized;
    });
  }, [apiData]);

  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    if (!canExport) {
      toast.error("Insufficient permissions");
      return;
    }
    // build header row with renamed keys
    const headerData = [{
      "Test Period Start": mockRecord.startDate,
      "Test Period End": mockRecord.endDate,
      Comment: mockRecord.comment || "",
    }];

    const activeRows = [];
    mockRecord.entries
      .filter((e) => e.isActive)
      .forEach((e) => {
        e.conditions.forEach((cond, idx) => {
          // format checking date as DD MMM YYYY if present
          let formattedDate = "";
          if (idx === 0 && e.checkingDate) {
            const d = new Date(e.checkingDate);
            formattedDate = d.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }

          activeRows.push({
            SL: idx === 0 ? e.sl : "",
            "Checking Date": formattedDate,
            "Sample Storage Conditions": cond.name,
            Organoleptic: cond.organoleptic,
            Appearance: cond.appearance,
            "Physical Property": cond.physical,
            "Moisture | Water Activity": cond.moisture,
            "Microbiological Test": cond.microbiologicalTest,
            "Comments": cond.comment,
          });
        });
      });

    const wb = XLSX.utils.book_new();
    const headerSheet = XLSX.utils.json_to_sheet(headerData);
    const detailSheet = XLSX.utils.json_to_sheet(activeRows);

    // style header sheet: bold
    Object.keys(headerSheet).forEach((cell) => {
      if (cell[0] === "!") return;
      headerSheet[cell].s = { font: { bold: true } };
    });
    headerSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 40 }];

    // detail sheet styling: bold header row
    const range = XLSX.utils.decode_range(detailSheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (detailSheet[address]) {
        detailSheet[address].s = { font: { bold: true } };
      }
    }
    // set column widths - reduce SL and Score columns
    const cols = Array(range.e.c + 1).fill({ wch: 15 });
    // find indexes for SL and Score to shrink them further
    const headers = XLSX.utils.sheet_to_json(detailSheet, { header: 1 })[0] || [];
    const slIdx = headers.indexOf("SL");
    const scoreIdx = headers.indexOf("Score");
    if (slIdx >= 0) cols[slIdx] = { wch: 5 };
    if (scoreIdx >= 0) cols[scoreIdx] = { wch: 5 };
    detailSheet["!cols"] = cols;

    // auto filter on data range
    detailSheet["!autofilter"] = { ref: detailSheet["!ref"] };

    XLSX.utils.book_append_sheet(wb, headerSheet, "Shelf Life");
    XLSX.utils.book_append_sheet(wb, detailSheet, "ActiveTestRecords");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    // build filename with recipe name and current date
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const recipe = mockRecord.recipeName || "unknown";
    link.download = `Shelf Life Testing - ${recipe} - ${today}.xlsx`;
    link.click();
  };

  const handleAddEntry = async (customPayload) => {
    console.log('handleAddEntry triggered canManage=', canManage, 'apiData=', apiData, 'customPayload=', customPayload);

    let testingId = apiData?.testing?._id;
    if (!testingId) {
      try {
        const res = await upsertTesting.mutateAsync({
          sampleId,
          data: {
            comment: mockRecord.comment,
            testPeriodStartDate: mockRecord.startDate,
            testPeriodEndDate: mockRecord.endDate,
            isSubmitted: false,
          },
        });
        console.log('upsert returned', res);
        testingId = res.data?._id || res._id;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to initialize test records"));
        return false;
      }
    }

    if (!testingId) return false;

    const payload = {
      shelfLifeTestingId: testingId,
      checkingDate: customPayload?.checkingDate ? new Date(customPayload.checkingDate) : new Date(),
      storageConditions: customPayload?.storageConditions || [
        { condition: "Sunlight", comment: "" },
        { condition: "AC", comment: "" },
        { condition: "Ambient Temperature", comment: "" },
      ],
    };
    try {
      const response = await createRecordMutation.mutateAsync({ ...payload, sampleId });
      toast.success("Test record created");
      return response?.data?._id || response?._id || true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add entry"));
      return false;
    }
  };

  const handleArchiveEntry = async (id) => {
    if (!canManage) return;
    try {
      const response = await deleteRecordMutation.mutateAsync({ id, sampleId });
      toast.success(getResponseMessage(response, "Entry archived successfully"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to archive entry"));
    }
  };

  const handleRestoreEntry = async (id) => {
    if (!canManage) return;
    try {
      const response = await restoreRecordMutation.mutateAsync({ id, sampleId });
      toast.success(getResponseMessage(response, "Entry restored successfully"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to restore entry"));
    }
  };

  const handleUpdateEntry = async (updatedData) => {
    console.debug("handleUpdateEntry payload", updatedData, "sampleId", sampleId);
    if (!canManage) return false;
    try {
      const resp = await updateRecordMutation.mutateAsync({ id: updatedData.id, data: updatedData, sampleId });
      console.debug("updateRecordMutation response", resp);
      toast.success(getResponseMessage(resp, "Entry updated successfully"));
      return true;
    } catch (err) {
      console.error("update error", err);
      toast.error(getApiErrorMessage(err, "Failed to update entry"));
      return false;
    }
  };

  const handleSaveDraft = async () => {
    if (!canManage) return;
    try {
      const response = await upsertTesting.mutateAsync({
        sampleId,
        data: {
          comment: mockRecord.comment,
          testPeriodStartDate: mockRecord.startDate,
          testPeriodEndDate: mockRecord.endDate,
          isSubmitted: false,
        },
      });
      toast.success(getResponseMessage(response, "Draft saved successfully"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save draft"));
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await upsertTesting.mutateAsync({
        sampleId,
        data: {
          comment: mockRecord.comment,
          testPeriodStartDate: mockRecord.startDate,
          testPeriodEndDate: mockRecord.endDate,
          isSubmitted: true,
        },
      });
      toast.success(
        getResponseMessage(response, "Testing record submitted successfully")
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to submit"));
    }
  };

  const filteredEntries = mockRecord.entries.filter((entry) =>
    statusFilter === "archive" ? !entry.isActive : entry.isActive
  );

  return {
    sampleId,
    isMobile,
    record,
    mockRecord: { ...mockRecord, entries: filteredEntries },
    isLoading: isLoading,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    handleBack,
    handleDownload,
    onAddEntry: !mockRecord.isSubmitted ? handleAddEntry : undefined,
    onArchiveEntry: !mockRecord.isSubmitted ? handleArchiveEntry : undefined,
    onRestoreEntry: !mockRecord.isSubmitted ? handleRestoreEntry : undefined,
    onUpdateEntry: !mockRecord.isSubmitted ? handleUpdateEntry : undefined,
    onSaveDraft: !mockRecord.isSubmitted ? handleSaveDraft : undefined,
    onSubmit: !mockRecord.isSubmitted ? handleSubmit : undefined,
    canManage,
    setMockRecord,
    isSubmitted: mockRecord.isSubmitted,
  };
}
