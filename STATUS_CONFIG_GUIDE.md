# Status Configuration System - Developer Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Module-Specific Configuration](#module-specific-configuration)
5. [Custom Colors](#custom-colors)
6. [Best Practices](#best-practices)
7. [Migration Guide](#migration-guide)

## Overview

The Status Configuration System is an industry-grade, modular approach to managing status options and their colors across the application. Each module can define its own status sets and optionally override default colors without affecting other modules.

### Key Features
- ✅ **Module Independence**: Each module has its own status configuration
- ✅ **Color Consistency**: Centralized color palette with override capability
- ✅ **Type Safety**: Configuration builder with validation
- ✅ **Easy Maintenance**: Change status sets or colors in one place
- ✅ **Backward Compatible**: Existing code continues to work

## Architecture

```
src/
├── constants/
│   └── statusColors.js          # Global color palette (DO NOT MODIFY OFTEN)
├── config/
│   └── statusConfig.js          # Configuration factory & builder
└── features/
    └── project-overview/
        ├── shared/constants/
        │   └── projectOptions.js    # Base/shared configurations
        ├── master-project/constants/
        │   └── projectOptions.js    # Master Project specific
        ├── application-lab/constants/
        │   └── projectOptions.js    # Application Lab specific
        ├── product-development/constants/
        │   └── projectOptions.js    # Product Dev specific
        └── sensory/constants/
            └── projectOptions.js    # Sensory Lab specific
```

### Design Principles
1. **Single Responsibility**: Each file has one clear purpose
2. **Open/Closed**: Easy to extend, hard to break
3. **Don't Repeat Yourself**: Shared logic in reusable utilities
4. **Separation of Concerns**: Colors, configuration, and UI are separate

## Quick Start

### 1. Using Default Status Options

```javascript
// In your module's constants/projectOptions.js
import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";

// Create status options with default colors
export const myModuleStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Completed",
  "Rework",
  "Approved",
]);

// Create filter options (includes "All")
export const myModuleStatusFilterOptions = createFilterOptions(
  myModuleStatusOptions
);
```

### 2. Using in Components

```javascript
// In your list/table component
import { myModuleStatusFilterOptions } from "./constants/projectOptions";

<SearchFilterBar
  filters={[
    {
      id: "status",
      options: myModuleStatusFilterOptions,
      value: statusFilter,
      onChange: setStatusFilter,
      placeholder: "All Status",
    },
  ]}
/>
```

```javascript
// In your detail form component
import { myModuleStatusOptions } from "./constants/projectOptions";

<EditableField
  label="Status"
  type="select"
  options={myModuleStatusOptions}
  value={currentStatus}
  onSave={handleStatusUpdate}
/>
```

## Module-Specific Configuration

### Example: Master Project Module

```javascript
// src/features/project-overview/master-project/constants/projectOptions.js

import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";

/**
 * Master Project uses a simplified workflow
 */
export const masterProjectStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Approved",
  "Rework",
  "Completed",
]);

export const masterProjectStatusFilterOptions = createFilterOptions(
  masterProjectStatusOptions
);
```

### Example: Application Lab Module

```javascript
// src/features/project-overview/application-lab/constants/projectOptions.js

import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";

/**
 * Application Lab uses development-specific statuses
 */
export const applicationLabStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Completed",
  "Ready to Promote",
  "Rework",
  "Paused",
  "Cancelled",
]);

export const applicationLabStatusFilterOptions = createFilterOptions(
  applicationLabStatusOptions
);
```

## Custom Colors

### Method 1: Using Color Overrides

```javascript
import { buildStatusOptions } from "@/config/statusConfig";

// Override specific status colors
export const myModuleStatusOptions = buildStatusOptions(
  ["Not Started", "In Progress", "Completed"],
  {
    // Custom color for "In Progress" in this module only
    "In Progress": {
      bgColor: "#CUSTOM_BG_HEX",
      textColor: "#CUSTOM_TEXT_HEX",
    },
  }
);
```

### Method 2: Using the Builder Pattern

```javascript
import { createStatusConfig } from "@/config/statusConfig";

export const myModuleStatusOptions = createStatusConfig()
  .addStatus("Not Started", { paletteKey: "NOT_STARTED" })
  .addStatus("In Progress", {
    bgColor: "#CUSTOM_BG",
    textColor: "#CUSTOM_TEXT",
  })
  .addStatus("Completed", { paletteKey: "COMPLETED" })
  .build();
```

### Method 3: Creating Entirely Custom Status

```javascript
import { createStatusConfig, STATUS_COLOR_PALETTE } from "@/config/statusConfig";

export const customWorkflowOptions = createStatusConfig()
  .addStatus("Draft", {
    bgColor: "#F0F0F0",
    textColor: "#666666",
  })
  .addStatus("Review", {
    bgColor: "#FFF4E5",
    textColor: "#CC8800",
  })
  .addStatus("Published", { paletteKey: "COMPLETED" })
  .build();
```

## Best Practices

### ✅ DO

1. **Define status options at module level**
   ```javascript
   // ✅ Good: Module-specific configuration
   // src/features/my-module/constants/projectOptions.js
   export const myModuleStatusOptions = buildStatusOptions([...]);
   ```

2. **Use descriptive export names**
   ```javascript
   // ✅ Good: Clear naming
   export const applicationLabStatusFilterOptions = createFilterOptions(...);
   ```

3. **Document custom configurations**
   ```javascript
   /**
    * Custom status for X module because Y requirement
    */
   export const myModuleStatusOptions = buildStatusOptions([...], {
     "Custom Status": { bgColor: "...", textColor: "..." }
   });
   ```

4. **Keep color definitions in constants**
   ```javascript
   // ✅ Good: Defined in constants
   const CUSTOM_STATUS_COLORS = {
     bgColor: "#E6E6FA",
     textColor: "#4B0082",
   };
   ```

### ❌ DON'T

1. **Don't hardcode colors in components**
   ```javascript
   // ❌ Bad: Hardcoded in component
   <div style={{ backgroundColor: "#FFC0CB" }}>Status</div>
   ```

2. **Don't modify the global color palette without review**
   ```javascript
   // ❌ Bad: Changing global colors affects all modules
   STATUS_COLOR_PALETTE.IN_PROGRESS.bgColor = "#NEW_COLOR";
   ```

3. **Don't create duplicate status configurations**
   ```javascript
   // ❌ Bad: Duplicating configuration
   const status1 = buildStatusOptions([...]);
   const status2 = buildStatusOptions([...]); // Same values
   ```

## Migration Guide

### From Old System to New System

#### Before (Old Way - DEPRECATED)
```javascript
// ❌ DEPRECATED: Manual color enrichment (DO NOT USE)
// This old pattern is no longer needed
import { enrichStatusOptions } from "@/utils/enrichOptionsWithColors";

export const statusOptions = enrichStatusOptions([
  { label: "Not Started", value: "Not Started" },
  { label: "In Progress", value: "In Progress" },
]);
```

#### After (New Way - CURRENT)
```javascript
// ✅ CURRENT: Using configuration builder
import { buildStatusOptions } from "@/config/statusConfig";

export const statusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
]);
```

### Step-by-Step Migration

1. **Update imports** in your module's `constants/projectOptions.js`:
   ```javascript
   import { buildStatusOptions, createFilterOptions } from "@/config/statusConfig";
   ```

2. **Replace status option definitions**:
   ```javascript
   // Old - DEPRECATED
   export const myStatusOptions = enrichStatusOptions([
     { label: "Status1", value: "Status1" },
   ]);

   // New - CURRENT
   export const myStatusOptions = buildStatusOptions(["Status1"]);
   ```

3. **Create filter options** if needed:
   ```javascript
   export const myStatusFilterOptions = createFilterOptions(myStatusOptions);
   ```

4. **Test your module** to ensure colors display correctly

## Common Use Cases

### Use Case 1: Module with Standard Workflow

```javascript
import { buildStatusOptions, COMMON_STATUS_SETS } from "@/config/statusConfig";

// Use predefined status set
export const statusOptions = buildStatusOptions(COMMON_STATUS_SETS.BASIC_WORKFLOW);
```

### Use Case 2: Module with Custom Workflow

```javascript
import { buildStatusOptions } from "@/config/statusConfig";

export const statusOptions = buildStatusOptions([
  "Submitted",
  "Under Review",
  "Approved",
  "Rejected",
  "Archived",
]);
```

### Use Case 3: Multiple Status Types in One Module

```javascript
import { buildStatusOptions } from "@/config/statusConfig";

// Different status sets for different purposes
export const projectStatusOptions = buildStatusOptions([
  "Not Started",
  "In Progress",
  "Completed",
]);

export const approvalStatusOptions = buildStatusOptions([
  "Pending",
  "Approved",
  "Rejected",
]);
```

## Troubleshooting

### Colors Not Showing
- ✅ Check that you're using `buildStatusOptions()` or the config builder
- ✅ Verify status values match exactly (case-sensitive)
- ✅ Ensure the component supports colored options (EditableField, FilterInput, Select)

### Wrong Colors Displaying
- ✅ Check for color overrides in module configuration
- ✅ Verify palette key mapping is correct
- ✅ Clear browser cache and rebuild

### Status Options Not Available
- ✅ Check export names in module's projectOptions.js
- ✅ Verify import path is correct
- ✅ Ensure the constant is exported

## Support

For questions or issues:
1. Check this documentation
2. Review examples in existing modules
3. Consult the team lead

---

**Last Updated**: February 2026  
**Version**: 2.0 (Modular Configuration System)
