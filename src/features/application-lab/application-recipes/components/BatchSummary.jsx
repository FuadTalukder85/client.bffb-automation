import React, { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { cn } from "@/lib/utils";

// ================= REUSABLE CARD & ROW COMPONENTS =================
function SummaryCard({ children, isDimmed = false, className = "" }) {
  return (
    <div
      className={cn(
        "border border-[#EEEBF4] dark:border-primary/30 rounded-2xl overflow-hidden bg-[#FCFBFD] dark:bg-[#121019] text-xs divide-y divide-[#EEEBF4] dark:divide-primary/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-opacity duration-200",
        isDimmed && "opacity-30 pointer-events-none select-none",
        className
      )}
    >
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  subLabel,
  value,
  unit,
  isDimmed = false,
  isEditing = false,
  editInput = null,
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-[#EEEBF4] dark:divide-primary/30 min-h-[44px] transition-opacity duration-200",
        isDimmed && "opacity-30 pointer-events-none select-none"
      )}
    >
      {/* Left Label Cell */}
      <div className="px-3.5 py-2.5 bg-[#FAF9FC] dark:bg-white/[0.02] flex flex-col justify-center">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">
          {label}
        </span>
        {subLabel && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">
            {subLabel}
          </span>
        )}
      </div>

      {/* Right Value Cell */}
      <div className="px-3.5 py-2.5 bg-white dark:bg-[#0D0B14] flex items-center">
        {isEditing && editInput ? (
          editInput
        ) : (
          <span className="text-xs sm:text-[13px] font-bold text-gray-900 dark:text-white flex items-center gap-1">
            <span>{value}</span>
            {unit && <span className="font-bold text-gray-900 dark:text-white">{unit}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

function EditableCellInput({ value, onChange, unit }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 font-bold text-xs sm:text-[13px] text-gray-900 dark:text-white bg-transparent border-b border-[#4B208B] focus:border-b-2 focus:border-[#4B208B] focus:outline-none py-0.5"
      />
      {unit && (
        <span className="font-bold text-xs sm:text-[13px] text-gray-900 dark:text-white">
          {unit}
        </span>
      )}
    </div>
  );
}

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
  draftPerPiece: propDraftPerPiece,
  setDraftPerPiece: propSetDraftPerPiece,
  draftPacketQuantity: propDraftPacketQuantity,
  setDraftPacketQuantity: propSetDraftPacketQuantity,
  isBatchSummaryEditing,
  setIsBatchSummaryEditing,
  onSaveSpecificFields,
  isConfectionary = false,
}) {
  const [isSavingBatchSummary, setIsSavingBatchSummary] = useState(false);

  // Local state fallbacks if props are not passed from caller
  const [localPerPiece, setLocalPerPiece] = useState(
    vItem?.perPiece ?? data?.perPiece ?? 12
  );
  const [localPacketQuantity, setLocalPacketQuantity] = useState(
    vItem?.packetQuantity ?? data?.packetQuantity ?? 4
  );

  const draftPerPiece = propDraftPerPiece !== undefined ? propDraftPerPiece : localPerPiece;
  const setDraftPerPiece = propSetDraftPerPiece || setLocalPerPiece;

  const draftPacketQuantity =
    propDraftPacketQuantity !== undefined ? propDraftPacketQuantity : localPacketQuantity;
  const setDraftPacketQuantity = propSetDraftPacketQuantity || setLocalPacketQuantity;

  useEffect(() => {
    if (propDraftPerPiece === undefined) {
      setLocalPerPiece(vItem?.perPiece ?? data?.perPiece ?? 12);
    }
    if (propDraftPacketQuantity === undefined) {
      setLocalPacketQuantity(vItem?.packetQuantity ?? data?.packetQuantity ?? 4);
    }
  }, [
    vItem?.perPiece,
    data?.perPiece,
    vItem?.packetQuantity,
    data?.packetQuantity,
    propDraftPerPiece,
    propDraftPacketQuantity,
  ]);

  // Save Batch Summary for THIS version
  const handleSaveBatchSummary = async () => {
    try {
      setIsSavingBatchSummary(true);
      if (onSaveSpecificFields) {
        const payload = {
          yield: Number(draftYield),
          outputYield: Number(draftYield),
          servingSize: Number(draftServingSize),
          outputServingSize: Number(draftServingSize),
        };
        if (draftPerPiece !== undefined && draftPerPiece !== "") {
          payload.perPiece = Number(draftPerPiece);
        }
        if (draftPacketQuantity !== undefined && draftPacketQuantity !== "") {
          payload.packetQuantity = Number(draftPacketQuantity);
        }

        await onSaveSpecificFields(payload, vItem?._id || data?._id);
      }
      setIsBatchSummaryEditing(false);
    } catch (err) {
      console.error("Failed to save Batch Summary for version:", err);
    } finally {
      setIsSavingBatchSummary(false);
    }
  };

  const handleCancelBatchSummary = () => {
    setDraftYield(vItem?.yield ?? vItem?.outputYield ?? data?.yield ?? data?.outputYield ?? 100);
    setDraftServingSize(vItem?.servingSize ?? vItem?.outputServingSize ?? data?.servingSize ?? data?.outputServingSize ?? 100);
    setDraftPerPiece(vItem?.perPiece ?? data?.perPiece ?? 12);
    setDraftPacketQuantity(vItem?.packetQuantity ?? data?.packetQuantity ?? 4);
    setIsBatchSummaryEditing(false);
  };

  const setRootRef = React.useCallback(
    (node) => {
      if (!isFirstVersion || !batchRef) return;
      if (typeof batchRef === "function") {
        batchRef(node);
      } else if (batchRef && "current" in batchRef) {
        batchRef.current = node;
      }
    },
    [isFirstVersion, batchRef]
  );

  return (
    <div
      ref={isFirstVersion ? setRootRef : undefined}
      className="p-4 border-b border-[#EEEBF4] dark:border-primary/40 bg-white dark:bg-[#0D0B14]"
    >
      {/* ================= 1. Output Block ================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
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

        {/* Output Cards (Card 1: Yield & Serving Size, Card 2: Output Pieces & Output) */}
        <div className="space-y-3">
          {/* Card 1: Editable in Edit Mode */}
          <SummaryCard>
            <SummaryRow
              label="Yield"
              value={
                draftYield !== undefined && draftYield !== ""
                  ? draftYield
                  : vBatchSummary?.output?.yield ?? 100
              }
              unit="%"
              isEditing={isBatchSummaryEditing}
              editInput={
                <EditableCellInput
                  value={draftYield}
                  onChange={setDraftYield}
                  unit="%"
                />
              }
            />
            <SummaryRow
              label="Serving Size"
              value={
                draftServingSize !== undefined && draftServingSize !== ""
                  ? draftServingSize
                  : vBatchSummary?.output?.servingSize ?? 100
              }
              unit="g"
              isEditing={isBatchSummaryEditing}
              editInput={
                <EditableCellInput
                  value={draftServingSize}
                  onChange={setDraftServingSize}
                  unit="g"
                />
              }
            />
          </SummaryCard>

          {/* Card 2: Dimmed in Edit Mode */}
          <SummaryCard isDimmed={isBatchSummaryEditing}>
            <SummaryRow
              label="Output Pieces"
              value={
                vBatchSummary?.output?.outputPieces && vBatchSummary?.output?.outputPieces !== "0"
                  ? vBatchSummary.output.outputPieces
                  : 100
              }
              unit="pcs"
            />
            <SummaryRow
              label="Output"
              value={
                vBatchSummary?.output?.output && vBatchSummary?.output?.output !== "0"
                  ? vBatchSummary.output.output
                  : 100
              }
              unit="g"
            />
          </SummaryCard>
        </div>
      </div>

      {/* Full-width section divider */}
      <div className="border-t border-[#EEEBF4] dark:border-primary/30 -mx-4 my-5" />

      {/* ================= 2. BFF Cost Calculation Block ================= */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
            BFF Cost Calculation
          </span>
        </div>

        {/* 4 separate cards matching Image */}
        <div className="space-y-3">
          {/* Card 1: Per Piece (Editable) & Cost Per Piece (Dimmed in edit mode) */}
          <SummaryCard>
            <SummaryRow
              label="Per Piece"
              value={
                draftPerPiece !== undefined && draftPerPiece !== ""
                  ? draftPerPiece
                  : vBatchSummary?.bffCostCalculation?.perPiece ?? vBatchSummary?.confectionery?.perPiece ?? 12
              }
              unit="g"
              isEditing={isBatchSummaryEditing}
              editInput={
                <EditableCellInput
                  value={draftPerPiece}
                  onChange={setDraftPerPiece}
                  unit="g"
                />
              }
            />
            <SummaryRow
              label="Cost Per Piece"
              value={
                vBatchSummary?.bffCostCalculation?.costPerPiece ??
                vBatchSummary?.confectionery?.costPerPiece ??
                6
              }
              unit="BDT/pcs"
              isDimmed={isBatchSummaryEditing}
            />
          </SummaryCard>

          {/* Card 2: Packet Quantity (Editable) */}
          <SummaryCard>
            <SummaryRow
              label="Packet Quantity"
              value={
                draftPacketQuantity !== undefined && draftPacketQuantity !== ""
                  ? draftPacketQuantity
                  : vBatchSummary?.bffCostCalculation?.packetQuantity ?? vBatchSummary?.confectionery?.packetQuantity ?? 4
              }
              unit="pcs"
              isEditing={isBatchSummaryEditing}
              editInput={
                <EditableCellInput
                  value={draftPacketQuantity}
                  onChange={setDraftPacketQuantity}
                  unit="pcs"
                />
              }
            />
          </SummaryCard>

          {/* Card 3: Lab Output & Lab Output Cost (Dimmed in edit mode) */}
          <SummaryCard isDimmed={isBatchSummaryEditing}>
            <SummaryRow
              label="Lab Output"
              value={
                vBatchSummary?.bffCostCalculation?.labOutput ??
                vBatchSummary?.confectionery?.labOutput ??
                48
              }
              unit="g"
            />
            <SummaryRow
              label="Lab Output Cost"
              value={
                vBatchSummary?.bffCostCalculation?.labOutputCost ??
                vBatchSummary?.confectionery?.labOutputCost ??
                4
              }
              unit={
                vBatchSummary?.bffCostCalculation?.labOutputCostUnit ||
                vBatchSummary?.confectionery?.labOutputCostUnit ||
                "pcs"
              }
            />
          </SummaryCard>

          {/* Card 4: Wastage & Wastage Cost (Dimmed in edit mode) */}
          <SummaryCard isDimmed={isBatchSummaryEditing}>
            <SummaryRow
              label="Wastage"
              value={
                vBatchSummary?.bffCostCalculation?.wastage ??
                vBatchSummary?.confectionery?.wastage ??
                48
              }
              unit="g"
            />
            <SummaryRow
              label="Wastage Cost"
              value={
                vBatchSummary?.bffCostCalculation?.wastageCost ??
                vBatchSummary?.confectionery?.wastageCost ??
                6
              }
              unit="BDT"
            />
          </SummaryCard>
        </div>
      </div>

      {/* Full-width section divider */}
      <div className="border-t border-[#EEEBF4] dark:border-primary/30 -mx-4 my-5" />

      {/* ================= 3. Client Cost Calculation Block ================= */}
      <div>
        <div className="mb-3">
          <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
            Client Cost Calculation
          </span>
        </div>

        {/* Client Cost Card (Dimmed in edit mode) */}
        <div className="space-y-3">
          <SummaryCard isDimmed={isBatchSummaryEditing}>
            <SummaryRow
              label="Cost per kg"
              subLabel="(without loss)"
              value={
                vBatchSummary?.clientCostCalculation?.costPerKgWithoutLoss ??
                vBatchSummary?.confectionery?.clientCostPerKgWithoutLoss ??
                vBatchSummary?.costCalculation?.doughCostPerKg?.client ??
                "10000"
              }
              unit="BDT/kg"
            />
            <SummaryRow
              label="Cost per kg"
              subLabel="(with loss)"
              value={
                vBatchSummary?.clientCostCalculation?.costPerKgWithLoss ??
                vBatchSummary?.confectionery?.clientCostPerKgWithLoss ??
                vBatchSummary?.costCalculation?.costPerKgWithLoss?.client ??
                "12000"
              }
              unit="BDT/kg"
            />
            <SummaryRow
              label="Cost per piece"
              value={
                vBatchSummary?.clientCostCalculation?.costPerPiece ??
                vBatchSummary?.confectionery?.clientCostPerPiece ??
                vBatchSummary?.costCalculation?.costPerPiece?.client ??
                "150"
              }
              unit="BDT/pcs"
            />
          </SummaryCard>
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
