import React, { useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const toTitle = (value = "") =>
  String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (m) => m.toUpperCase());

const deepClone = (value) => JSON.parse(JSON.stringify(value ?? null));

const setAtPath = (source, path, value) => {
  const next = Array.isArray(source) ? [...source] : { ...(source || {}) };
  let cursor = next;

  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    const current = cursor[key];
    const cloned = Array.isArray(current) ? [...current] : { ...(current || {}) };
    cursor[key] = cloned;
    cursor = cloned;
  }

  cursor[path[path.length - 1]] = value;
  return next;
};

const compactValue = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value.trim() || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    return value.map((item) => compactValue(item)).join(", ");
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "—";
    return keys
      .map((key) => `${toTitle(key)}: ${compactValue(value[key])}`)
      .join(" | ");
  }
  return String(value);
};

const toRows = (value, prefix = "", path = []) => {
  if (Array.isArray(value)) {
    if (!value.length) return [{ label: prefix || "Value", value: "—", unit: "", path, rawValue: null }];

    const isParameterArray = value.every(
      (item) => item && typeof item === "object" && ("parameterName" in item || "parameterValue" in item)
    );

    if (isParameterArray) {
      return value.map((item, index) => ({
        label: item.parameterName || "Parameter",
        value: item.parameterValue ?? "—",
        unit: item.parameterUnit || "",
        path: [...path, index, "parameterValue"],
        rawValue: item.parameterValue ?? null,
      }));
    }

    const isPrimitiveArray = value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item));
    if (isPrimitiveArray) {
      return value.map((item, index) => ({
        label: prefix ? `${prefix} ${index + 1}` : `Value ${index + 1}`,
        value: compactValue(item),
        unit: "",
        path: [...path, index],
        rawValue: item,
      }));
    }

    return value.flatMap((item, index) =>
      toRows(item, prefix ? `${prefix} ${index + 1}` : `Item ${index + 1}`, [...path, index])
    );
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return [{ label: prefix || "Value", value: "—", unit: "", path, rawValue: null }];

    return keys.flatMap((key) => {
      const nextLabel = prefix ? `${prefix} / ${toTitle(key)}` : toTitle(key);
      const nested = value[key];
      if (nested && typeof nested === "object") {
        return toRows(nested, nextLabel, [...path, key]);
      }
      return [{ label: nextLabel, value: compactValue(nested), unit: "", path: [...path, key], rawValue: nested }];
    });
  }

  return [{ label: prefix || "Value", value: compactValue(value), unit: "", path, rawValue: value }];
};

const parseCellInput = (raw, previousValue) => {
  if (raw === "") return null;
  if (typeof previousValue === "number" || previousValue === null) {
    const numeric = Number(raw);
    return Number.isNaN(numeric) ? previousValue : numeric;
  }
  return raw;
};

const BAKERY_TYPE = "Bakery";
const BAKERY_EXTRA_FIELDS = [
  "ovenTemperatureTunnelBaking",
  "normalBaking",
  "afterBake",
];

const displayNumber = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const parseNumericInput = (raw, previous) => {
  if (raw === "") return null;
  const numeric = Number(raw);
  return Number.isNaN(numeric) ? previous : numeric;
};

function BakeryCell({ value, unit, editable = false, onChange }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {editable ? (
        <input
          type="text"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full bg-transparent border border-border rounded-md px-2 py-1 text-[11px] font-semibold text-base-color focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <span className="text-[11px] font-semibold text-base-color">{displayNumber(value)}</span>
      )}
      {unit ? <span className="text-[10px] text-lighter-text font-bold uppercase">{unit}</span> : null}
    </div>
  );
}

function TunnelBakingTable({ value = {}, editable = false, onChange }) {
  const top = value.topTemperature || [];
  const bottom = value.bottomTemperature || [];

  const updateArrayValue = (arrayKey, index, raw) => {
    const previousValue = value[arrayKey]?.[index] ?? null;
    onChange?.([arrayKey, index], parseNumericInput(raw, previousValue));
  };

  return (
    <div className="overflow-hidden border border-border rounded-xl bg-white dark:bg-background shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="w-36 px-3 py-2 text-[11px] border-r border-border"></th>
            <th className="px-3 py-2 text-[11px] font-bold text-base-color border-r border-border text-center">1st Zone</th>
            <th className="px-3 py-2 text-[11px] font-bold text-base-color border-r border-border text-center">2nd Zone</th>
            <th className="px-3 py-2 text-[11px] font-bold text-base-color text-center">3rd Zone</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-3 py-2 text-[11px] font-medium text-lighter-text border-r border-border">Top Temperature</td>
            {[0, 1, 2].map((index) => (
              <td key={`top-${index}`} className={cn("px-3 py-2", index < 2 && "border-r border-border")}>
                <BakeryCell
                  value={top[index] ?? null}
                  unit="°C"
                  editable={editable}
                  onChange={(raw) => updateArrayValue("topTemperature", index, raw)}
                />
              </td>
            ))}
          </tr>

          <tr className="border-b border-border">
            <td className="px-3 py-2 text-[11px] font-medium text-lighter-text border-r border-border">Bottom Temperature</td>
            {[0, 1, 2].map((index) => (
              <td key={`bottom-${index}`} className={cn("px-3 py-2", index < 2 && "border-r border-border")}>
                <BakeryCell
                  value={bottom[index] ?? null}
                  unit="°C"
                  editable={editable}
                  onChange={(raw) => updateArrayValue("bottomTemperature", index, raw)}
                />
              </td>
            ))}
          </tr>

          <tr className="border-b border-border">
            <td className="px-3 py-2 text-[11px] font-medium text-lighter-text border-r border-border">Baking Time</td>
            <td className="px-3 py-2" colSpan={3}>
              <BakeryCell
                value={value.bakingTime ?? null}
                unit="min"
                editable={editable}
                onChange={(raw) => onChange?.(["bakingTime"], parseNumericInput(raw, value.bakingTime ?? null))}
              />
            </td>
          </tr>

          <tr>
            <td className="px-3 py-2 text-[11px] font-medium text-lighter-text border-r border-border">Belt Speed</td>
            <td className="px-3 py-2" colSpan={3}>
              <BakeryCell
                value={value.beltSpeed ?? null}
                unit=""
                editable={editable}
                onChange={(raw) => onChange?.(["beltSpeed"], parseNumericInput(raw, value.beltSpeed ?? null))}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function NormalBakingTable({ value = {}, editable = false, onChange }) {
  const ovenTemperature = value.ovenTemperature || [];
  const ovenTime = value.ovenTime || [];

  const updateArrayValue = (arrayKey, index, raw) => {
    const previousValue = value[arrayKey]?.[index] ?? null;
    onChange?.([arrayKey, index], parseNumericInput(raw, previousValue));
  };

  return (
    <div className="overflow-hidden border border-border rounded-xl bg-white dark:bg-background shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="w-36 px-3 py-2 text-[11px] border-r border-border"></th>
            <th className="px-3 py-2 text-[11px] font-bold text-base-color border-r border-border text-center">1st Baking</th>
            <th className="px-3 py-2 text-[11px] font-bold text-base-color text-center">2nd Baking</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-3 py-2 text-[11px] font-medium text-lighter-text border-r border-border">Oven Temperature</td>
            {[0, 1].map((index) => (
              <td key={`normal-temp-${index}`} className={cn("px-3 py-2", index === 0 && "border-r border-border")}>
                <BakeryCell
                  value={ovenTemperature[index] ?? null}
                  unit="°C"
                  editable={editable}
                  onChange={(raw) => updateArrayValue("ovenTemperature", index, raw)}
                />
              </td>
            ))}
          </tr>

          <tr className="border-b border-border">
            <td className="px-3 py-2 text-[11px] font-medium text-lighter-text border-r border-border">Oven Time</td>
            {[0, 1].map((index) => (
              <td key={`normal-time-${index}`} className={cn("px-3 py-2", index === 0 && "border-r border-border")}>
                <BakeryCell
                  value={ovenTime[index] ?? null}
                  unit="min"
                  editable={editable}
                  onChange={(raw) => updateArrayValue("ovenTime", index, raw)}
                />
              </td>
            ))}
          </tr>

          <tr>
            <td className="px-3 py-2 text-[11px] font-medium text-lighter-text border-r border-border">Steam</td>
            <td className="px-3 py-2" colSpan={2}>
              <BakeryCell
                value={value.steam ?? null}
                unit="unit"
                editable={editable}
                onChange={(raw) => onChange?.(["steam"], parseNumericInput(raw, value.steam ?? null))}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function AfterBakeTable({ value = {}, editable = false, onChange }) {
  const rows = [
    { label: "Weight", key: "weight", unit: "g" },
    { label: "Size", key: "size", unit: "mm" },
    { label: "Aeration", key: "aeration", unit: "" },
    { label: "aW", key: "aW", unit: "%" },
    { label: "Moisture", key: "moisture", unit: "%" },
  ];

  return (
    <div className="overflow-hidden border border-border rounded-xl bg-white dark:bg-background shadow-sm">
      <table className="w-full border-collapse">
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={cn(index < rows.length - 1 && "border-b border-border")}>
              <td className="w-36 px-3 py-2 text-[11px] font-medium text-lighter-text border-r border-border">{row.label}</td>
              <td className="px-3 py-2">
                <BakeryCell
                  value={value[row.key] ?? null}
                  unit={row.unit}
                  editable={editable}
                  onChange={(raw) => onChange?.([row.key], parseNumericInput(raw, value[row.key] ?? null))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BakeryStructuredField({ fieldKey, value, editable = false, onChange }) {
  if (fieldKey === "ovenTemperatureTunnelBaking") {
    return <TunnelBakingTable value={value || {}} editable={editable} onChange={onChange} />;
  }

  if (fieldKey === "normalBaking") {
    return <NormalBakingTable value={value || {}} editable={editable} onChange={onChange} />;
  }

  if (fieldKey === "afterBake") {
    return <AfterBakeTable value={value || {}} editable={editable} onChange={onChange} />;
  }

  return null;
}

function DiffTable({ rows = [], editable = false, onRowChange }) {
  const safeRows = rows.length ? rows : [{ label: "Value", value: "—", unit: "", rawValue: null }];

  return (
    <div className="overflow-hidden border border-border rounded-xl bg-white dark:bg-background shadow-sm">
      <table className="w-full border-collapse">
        <tbody>
          {safeRows.map((row, idx) => (
            <tr
              key={`${row.label}-${idx}`}
              className={cn("border-border h-[42px]", idx < safeRows.length - 1 && "border-b")}
            >
              <td className="w-[48%] px-3 text-[11px] text-lighter-text font-medium border-r border-border align-top py-2">
                {row.label}
              </td>
              <td className="w-[52%] px-3 text-[11px] text-base-color font-semibold py-2">
                <div className="flex items-center justify-between gap-2">
                  {editable ? (
                    <input
                      type="text"
                      value={row.rawValue === null || row.rawValue === undefined ? "" : String(row.rawValue)}
                      onChange={(event) => onRowChange?.(row.path, parseCellInput(event.target.value, row.rawValue))}
                      className="w-full bg-transparent border border-border rounded-md px-2 py-1 text-[11px] font-semibold text-base-color focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <span className="break-all leading-relaxed">{row.value}</span>
                  )}
                  {row.unit ? <span className="text-[10px] text-lighter-text font-bold">{row.unit}</span> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const recipeTypes = ["Bakery", "Beverage", "Beverage PSD", "Confectionary"];

export function ChangeRecipeTypeModal({
  open,
  onOpenChange,
  currentRecipeType,
  selectedRecipeType,
  onSelectRecipeType,
  preview,
  isPreviewLoading,
  isSubmitting,
  onConfirm,
  error,
}) {
  const targetTypes = recipeTypes.filter((type) => type !== currentRecipeType);
  const changedFields = useMemo(() => preview?.changedFields || [], [preview?.changedFields]);
  const [editableNextByField, setEditableNextByField] = useState({});

  const handleSelectType = (type) => {
    setEditableNextByField({});
    onSelectRecipeType(type);
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setEditableNextByField({});
    }
    onOpenChange(nextOpen);
  };

  const changedFieldRows = useMemo(
    () =>
      changedFields.map((item) => ({
        ...item,
        currentRows: toRows(item.currentValue),
        nextRows: toRows(editableNextByField[item.field] ?? item.nextValue),
      })),
    [changedFields, editableNextByField]
  );

  const isCurrentBakery = currentRecipeType === BAKERY_TYPE;
  const isTargetBakery = selectedRecipeType === BAKERY_TYPE;

  const visibleChangedFields = useMemo(
    () =>
      changedFieldRows.filter((field) => {
        if (!BAKERY_EXTRA_FIELDS.includes(field.field)) return true;
        return isCurrentBakery || isTargetBakery;
      }),
    [changedFieldRows, isCurrentBakery, isTargetBakery]
  );

  const handleEditableRowChange = (fieldKey, path, nextValue) => {
    setEditableNextByField((previous) => {
      const source = previous[fieldKey] ?? changedFields.find((item) => item.field === fieldKey)?.nextValue;
      return {
        ...previous,
        [fieldKey]: setAtPath(deepClone(source), path, nextValue),
      };
    });
  };

  const handleConfirm = () => {
    const payload = {};
    changedFields.forEach((item) => {
      payload[item.field] = editableNextByField[item.field] ?? item.nextValue;
    });
    onConfirm?.(payload);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="sm:max-w-[760px] md:max-w-[900px] rounded-3xl">
        <ModalHeader>
          <ModalTitle className="text-xl font-bold text-base-color">Change Recipe Type</ModalTitle>
        </ModalHeader>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border border-border rounded-2xl bg-background">
              <p className="text-xs font-semibold text-lighter-text mb-2">Current Recipe Type</p>
              <div className="px-3 py-2 text-sm font-semibold border border-border rounded-xl bg-primary-shade-2 text-base-color">
                {currentRecipeType || "N/A"}
              </div>
            </div>

            <div className="p-4 border border-border rounded-2xl bg-background">
              <p className="text-xs font-semibold text-lighter-text mb-2">Select Target Recipe Type</p>
              <div className="grid grid-cols-1 gap-2">
                {targetTypes.map((type) => {
                  const isActive = selectedRecipeType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectType(type)}
                      className={cn(
                        "px-3 py-2 text-left text-sm rounded-xl border transition-colors",
                        isActive
                          ? "border-primary bg-primary-shade-2 text-base-color"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedRecipeType ? (
            <div className="border border-border rounded-2xl p-4 bg-background">
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300 mb-3">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">
                  These fields will be updated after changing recipe type from {currentRecipeType} to {selectedRecipeType}.
                </p>
              </div>

              {isPreviewLoading ? (
                <div className="flex items-center gap-2 text-sm text-lighter-text">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading field impact...
                </div>
              ) : visibleChangedFields.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {visibleChangedFields.map((field) => {
                    const isBakeryField = BAKERY_EXTRA_FIELDS.includes(field.field);
                    const nextEditableValue = editableNextByField[field.field] ?? field.nextValue;

                    return (
                    <div key={field.field} className="border border-border rounded-xl overflow-hidden">
                      <div className="px-3 py-2 text-xs font-semibold bg-primary-shade-2 text-base-color border-b border-border">
                        {field.label}
                      </div>
                      <div className="grid md:grid-cols-2">
                        <div className="p-3 border-b md:border-b-0 md:border-r border-border">
                          <p className="text-[11px] font-semibold text-lighter-text mb-2">Current</p>
                          {isBakeryField ? (
                            isCurrentBakery ? (
                              <BakeryStructuredField fieldKey={field.field} value={field.currentValue} editable={false} />
                            ) : (
                              <div className="px-3 py-4 text-[11px] text-lighter-text border border-dashed border-border rounded-xl">
                                This field is not available in {currentRecipeType || "current"} recipe type.
                              </div>
                            )
                          ) : (
                            <DiffTable rows={field.currentRows} />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-[11px] font-semibold text-lighter-text mb-2">After Update (Editable)</p>
                          {isBakeryField ? (
                            isTargetBakery ? (
                              <BakeryStructuredField
                                fieldKey={field.field}
                                value={nextEditableValue}
                                editable={true}
                                onChange={(path, value) => handleEditableRowChange(field.field, path, value)}
                              />
                            ) : (
                              <div className="px-3 py-4 text-[11px] text-amber-700 dark:text-amber-300 border border-dashed border-amber-300 rounded-xl bg-amber-50/60 dark:bg-amber-900/20">
                                This bakery-only field will be removed after changing to {selectedRecipeType}.
                              </div>
                            )
                          ) : (
                            <DiffTable
                              rows={field.nextRows}
                              editable={true}
                              onRowChange={(path, value) => handleEditableRowChange(field.field, path, value)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-lighter-text">No field changes detected for the selected type.</p>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-2xl p-4 text-xs text-lighter-text">
              Select a target recipe type to view field changes.
            </div>
          )}

          {error ? (
            <div className="p-3 text-xs text-red-600 border border-red-200 rounded-lg bg-red-50 text-center">
              {error}
            </div>
          ) : null}
        </div>

        <ModalFooter className="mt-3 flex gap-3">
          <Button
            intent="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleConfirm}
            disabled={!selectedRecipeType || isSubmitting || isPreviewLoading}
            className="flex-1"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </span>
            ) : (
              "Change Recipe Type"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
