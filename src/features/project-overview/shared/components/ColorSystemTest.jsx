/**
 * Color System Test Component
 * 
 * This component demonstrates and tests the status color system
 * across different select components.
 * 
 * Usage: Import and render this component to verify color implementation
 */

import React, { useState } from "react";
import { EditableField } from "@/components/editable-field";
import { Select } from "@/components/ui/Select/Select";
import { FilterInput } from "@/components/ui/FilterInput/FilterInput";
import { statusOptions } from "@/features/project-overview/shared/constants/projectOptions";
import { DEFAULT_STATUS_OPTIONS } from "@/constants/statusColors";

export const ColorSystemTest = () => {
  const [editableFieldValue, setEditableFieldValue] = useState("Not Started");
  const [selectValue, setSelectValue] = useState("Not Started");
  const [filterValue, setFilterValue] = useState("all");

  return (
    <div className="p-8 space-y-12 bg-background">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Status Color System Test</h1>
        <p className="text-sm text-muted-foreground">
          This page tests color consistency across all select components
        </p>
      </div>

      {/* Color Palette Reference */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Color Palette Reference</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {DEFAULT_STATUS_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="p-4 border rounded-lg border-table-stroke"
            >
              <div
                className="px-3 py-2 mb-2 text-sm font-medium rounded"
                style={{
                  backgroundColor: option.bgColor,
                  color: option.textColor,
                }}
              >
                {option.label}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>BG: {option.bgColor}</div>
                <div>Text: {option.textColor}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FilterInput Test */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">FilterInput Component</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Used in search filter bars and table filters
        </p>
        <div className="max-w-xs">
          <FilterInput
            config={{
              options: DEFAULT_STATUS_OPTIONS,
              value: filterValue,
              onValueChange: setFilterValue,
              placeholder: "All Status",
            }}
          />
        </div>
        <div className="mt-2 text-sm">
          Selected: <span className="font-medium">{filterValue}</span>
        </div>
      </section>

      {/* EditableField Test */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          EditableField Component (CustomSelect)
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Used in detail forms for inline editing
        </p>
        <div className="max-w-md p-4 border rounded-lg border-table-stroke">
          <EditableField
            label="Project Status"
            value={editableFieldValue}
            type="select"
            options={statusOptions}
            onSave={(newValue) => {
              setEditableFieldValue(newValue);
              return Promise.resolve();
            }}
            canEdit={true}
          />
        </div>
        <div className="mt-2 text-sm">
          Selected: <span className="font-medium">{editableFieldValue}</span>
        </div>
      </section>

      {/* Select Component Test */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Select Component</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Generic select component used in various forms
        </p>
        <div className="max-w-xs">
          <Select
            options={statusOptions}
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            placeholder="Select status..."
          />
        </div>
        <div className="mt-2 text-sm">
          Selected: <span className="font-medium">{selectValue}</span>
        </div>
      </section>

      {/* Side-by-side Comparison */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Side-by-Side Comparison</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          All components should display the same colors for the same status
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-medium">FilterInput</h3>
            <FilterInput
              config={{
                options: DEFAULT_STATUS_OPTIONS,
                value: "in_progress",
                onValueChange: () => {},
                placeholder: "All Status",
              }}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">EditableField</h3>
            <div className="p-3 border rounded-lg border-table-stroke">
              <EditableField
                label="Status"
                value="In Progress"
                type="select"
                options={statusOptions}
                onSave={() => Promise.resolve()}
                canEdit={true}
              />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Select</h3>
            <Select
              options={statusOptions}
              value="In Progress"
              onChange={() => {}}
              placeholder="Select status..."
            />
          </div>
        </div>
      </section>

      {/* All Statuses Test */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">All Statuses Display</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Testing all available statuses in EditableField
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className="p-3 border rounded-lg border-table-stroke"
            >
              <EditableField
                label={option.label}
                value={option.value}
                type="select"
                options={statusOptions}
                onSave={() => Promise.resolve()}
                canEdit={true}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Non-colored Options Test */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Non-Colored Options (Backward Compatibility)
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Options without color metadata should still work normally
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium">Purpose Options (No Colors)</h3>
            <Select
              options={[
                { label: "Campaign", value: "Campaign" },
                { label: "Project", value: "Project" },
                { label: "Client", value: "Client" },
              ]}
              value="Campaign"
              onChange={() => {}}
              placeholder="Select purpose..."
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Priority Options (No Colors)</h3>
            <Select
              options={[
                { label: "Low", value: "Low" },
                { label: "Medium", value: "Medium" },
                { label: "High", value: "High" },
              ]}
              value="High"
              onChange={() => {}}
              placeholder="Select priority..."
            />
          </div>
        </div>
      </section>

      {/* Color Metadata Info */}
      <section className="p-4 rounded-lg bg-muted/30">
        <h2 className="mb-2 text-xl font-semibold">Implementation Details</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Color Enrichment:</strong> Options are enriched with bgColor
            and textColor at module level
          </p>
          <p>
            <strong>Components:</strong> FilterInput, CustomSelect (in
            EditableField), and Select all support colored options
          </p>
          <p>
            <strong>Fallback:</strong> Options without colors display with
            default styling
          </p>
          <p>
            <strong>Consistency:</strong> Same color palette used across all
            components
          </p>
        </div>
      </section>
    </div>
  );
};

export default ColorSystemTest;
