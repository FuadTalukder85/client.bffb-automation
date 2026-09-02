import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { FaEdit } from "react-icons/fa";

// ================= BATCH SUMMARY VERSION COLUMN =================
export default function BatchSummary({
  vItem,
  data,
  isFirstVersion = false,
  batchRef,
  vBatchSummary,
  draftYield,
  setDraftYield,
  draftServingSize,
  setDraftServingSize,
  isBatchSummaryEditing,
  setIsBatchSummaryEditing,
  onSaveSpecificFields,
}) {
  const [isSavingBatchSummary, setIsSavingBatchSummary] = useState(false);

  // Save Batch Summary for THIS version
  const handleSaveBatchSummary = async () => {
    try {
      setIsSavingBatchSummary(true);
      if (onSaveSpecificFields) {
        await onSaveSpecificFields(
          {
            outputYield: Number(draftYield),
            outputServingSize: Number(draftServingSize),
          },
          vItem?._id || data?._id
        );
      }
      setIsBatchSummaryEditing(false);
    } catch (err) {
      console.error("Failed to save Batch Summary for version:", err);
    } finally {
      setIsSavingBatchSummary(false);
    }
  };

  const handleCancelBatchSummary = () => {
    setDraftYield(vItem?.outputYield ?? data?.outputYield ?? 0);
    setDraftServingSize(vItem?.outputServingSize ?? data?.outputServingSize ?? 0);
    setIsBatchSummaryEditing(false);
  };

  return (
    <div
      ref={isFirstVersion ? batchRef : undefined}
      className="p-4 space-y-6 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]"
    >
      {/* Output Block */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Output
          </span>

          {isBatchSummaryEditing ? (
            <div className="flex items-center overflow-hidden rounded-xl bg-[#4B208B] text-white shadow-sm">
              <button
                type="button"
                onClick={handleSaveBatchSummary}
                disabled={isSavingBatchSummary}
                title="Save Batch Summary"
                className="flex items-center justify-center w-8 h-8 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-white/30" />
              <button
                type="button"
                onClick={handleCancelBatchSummary}
                disabled={isSavingBatchSummary}
                title="Cancel Batch Summary"
                className="flex items-center justify-center w-8 h-8 hover:bg-[#3E1B77] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsBatchSummaryEditing(true)}
              title="Edit Batch Summary"
              className="w-8 h-8 rounded-xl bg-[#4B208B] hover:bg-[#3E1B77] text-white flex items-center justify-center shadow-sm cursor-pointer"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2x2 Tiles Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Yield */}
          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[11px] font-medium text-gray-500">Yield</span>
            {isBatchSummaryEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={draftYield}
                  onChange={(e) => setDraftYield(e.target.value)}
                  className="w-full text-xs font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                />
                <span className="text-xs font-bold text-gray-900 dark:text-white">%</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {draftYield} %
              </span>
            )}
          </div>

          {/* Serving Size */}
          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[11px] font-medium text-gray-500">Serving Size</span>
            {isBatchSummaryEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={draftServingSize}
                  onChange={(e) => setDraftServingSize(e.target.value)}
                  className="w-full text-xs font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-[#4B208B] focus:outline-none"
                />
                <span className="text-xs font-bold text-gray-900 dark:text-white">g</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {draftServingSize} g
              </span>
            )}
          </div>

          {/* Output Pieces */}
          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[11px] font-medium text-gray-500">Output Pieces</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vBatchSummary?.output?.outputPieces ?? "-"} pcs
            </span>
          </div>

          {/* Output */}
          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[11px] font-medium text-gray-500">Output</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vBatchSummary?.output?.output ?? "-"} g
            </span>
          </div>
        </div>
      </div>

      {/* BFF Cost Calculation Block */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            BFF Cost Calculation
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per kg (without loss)</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vBatchSummary?.costCalculation?.doughCostPerKg?.bff ?? "-"} %
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per kg (with loss)</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vBatchSummary?.costCalculation?.costPerKgWithLoss?.bff ?? "-"} g
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per piece</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vBatchSummary?.costCalculation?.costPerPiece?.bff ?? "-"} pcs
            </span>
          </div>
        </div>
      </div>

      {/* Client Cost Calculation Block */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Client Cost Calculation
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per kg (without loss)</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vBatchSummary?.costCalculation?.doughCostPerKg?.client ?? "-"} %
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per kg (with loss)</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vBatchSummary?.costCalculation?.costPerKgWithLoss?.client ?? "-"} g
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FCFBFD] dark:bg-primary/10 border border-[#EEEBF4] dark:border-primary/30 flex flex-col justify-between min-h-[58px]">
            <span className="text-[10px] font-medium text-gray-500 leading-tight">Cost per piece</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {vBatchSummary?.costCalculation?.costPerPiece?.client ?? "-"} pcs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= BATCH SUMMARY LEFT COLUMN =================
export function BatchSummaryLeftHeader({ height }) {
  return (
    <div
      style={height ? { height: `${height}px` } : undefined}
      className="p-6 border-b border-[#EEEBF4] dark:border-primary/40 flex flex-col justify-start"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        Batch Summary
      </h2>
    </div>
  );
}
