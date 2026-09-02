/**
 * Builds the SOP data shape for the UI from a recipe object (from the backend API).
 * If the recipe has no data for a field, falls back to empty defaults.
 *
 * Backend model fields → UI SOP shape:
 *   benchmarkSensoryFeedback  → benchmark.sensoryFeedback
 *   benchmarkParameters[]     → parameters.analyticalReport[]
 *   benchmarkOthers           → others
 *   benchmarkPDFeedback       → productDevelopmentFeedback
 *   procedureSOP              → procedure.steps (newline-split)
 *   procedureParameters[]     → procedureParameters (bakery: doughTemp/sg/ph, others: analyticalReport)
 *   ovenTemperatureTunnelBaking → ovenTemperature.tunnelBaking
 *   normalBaking              → ovenTemperature.normalBaking
 *   afterBake                 → afterBake.analyticalReport
 *   procedureOthers           → afterBakeOthers
 *   procedureSensoryFeedback  → sensoryFeedback
 */

// Default parameter structures per format (label templates)
const BAKERY_BENCHMARK_PARAMS = [
  { label: "Weight", unit: "g", backendKey: "weight" },
  { label: "Size", unit: "mm", backendKey: "size" },
  { label: "Aeration", unit: "", backendKey: "aeration" },
  { label: "aw", unit: "%", backendKey: "aW" },
  { label: "Moisture", unit: "%", backendKey: "moisture" },
];

const BEVERAGE_BENCHMARK_PARAMS = [
  { label: "Viscosity", unit: "" },
  { label: "pH", unit: "" },
  { label: "Brix", unit: "" },
  { label: "Acidity", unit: "" },
  { label: "Salt", unit: "%" },
];

const BEVERAGE_PSD_BENCHMARK_PARAMS = [
  { label: "Moisture", unit: "%" },
  { label: "pH", unit: "" },
  { label: "Brix", unit: "" },
  { label: "Acidity", unit: "" },
  { label: "Salt", unit: "%" },
];

const CONFECTIONERY_BENCHMARK_PARAMS = [
  { label: "Brix", unit: "" },
  { label: "Acidity", unit: "" },
];

export const CONFECTIONERY_PROCEDURE_PARAMS = [
  { label: "Cooking pH", value: "24", unit: "" },
  { label: "Final pH", value: "1.12", unit: "" },
  { label: "Brix", value: "1.12", unit: "" },
  { label: "Cooking Temperature", value: "24", unit: "°C" },
  { label: "Depositing Temperature", value: "24", unit: "°C" },
  { label: "Cooking Time", value: "24", unit: "min" },
  { label: "Gel Forming Time", value: "24", unit: "min" },
];

export const CONFECTIONERY_DEFAULT_PROCEDURE =
  "Mix all dry ingredients in the primary bowl for 2 minutes on low speed. Gradually add chilled water and liquid yeast while mixing on medium speed for an additional 8 minutes. Ensure dough windowpane test passes before transferring to the resting vat. Rest for 45 minutes at room temperature.";

/**
 * Convert backend benchmarkParameters array to UI analyticalReport shape.
 * Backend format: [{ parameterName, parameterValue, parameterUnit }]
 * UI format: [{ label, value, unit }]
 */
function mapBackendParamsToUI(backendParams = []) {
  if (!backendParams || backendParams.length === 0) return [];
  return backendParams.map(p => ({
    label: p.parameterName || "",
    value: p.parameterValue || "",
    unit: p.parameterUnit || "",
  }));
}

/**
 * Convert UI analyticalReport back to backend benchmarkParameters format.
 * UI format: [{ label, value, unit }]
 * Backend format: [{ parameterName, parameterValue, parameterUnit }]
 */
export function mapUIParamsToBackend(uiParams = []) {
  return uiParams
    .map(p => ({
      parameterName: p.label || "",
      parameterValue: p.value || "",
      parameterUnit: p.unit || "",
    }))
    // Filter out parameters where all fields are effectively empty
    .filter(p => p.parameterName.trim() || p.parameterValue.trim() || p.parameterUnit.trim());
}

/**
 * Build SOP UI data from a recipe object and the format.
 * The recipe comes from the backend API (GET /recipes/:id).
 */
export function buildSOPDataFromRecipe(recipe = {}, format = "bakery") {
  const isBakery = format === "bakery";
  const isConfectionary =
    String(format || "").toLowerCase().includes("confection") ||
    String(recipe?.recipeType || "").toLowerCase().includes("confection");

  // Benchmark
  const benchmark = {
    sensoryFeedback: recipe.benchmarkSensoryFeedback || "",
  };

  // Parameters — Analytical Report
  const parameters = {
    analyticalReport: mapBackendParamsToUI(recipe.benchmarkParameters),
  };

  // Others
  const others = recipe.benchmarkOthers || "";

  // Product Development Feedback
  const productDevelopmentFeedback = recipe.benchmarkPDFeedback || "";

  // Procedure
  const rawProcedure =
    recipe.procedureSOP || (isConfectionary ? CONFECTIONERY_DEFAULT_PROCEDURE : "");
  const procedure = {
    title: "Standard Operating Procedure",
    raw: rawProcedure,
    steps: rawProcedure ? rawProcedure.split("\n") : [],
  };

  // Procedure Parameters
  let procedureParameters;
  if (isBakery) {
    procedureParameters = {
      analyticalReport: mapBackendParamsToUI(recipe.procedureParameters),
    };
  } else if (isConfectionary) {
    const backendParams = mapBackendParamsToUI(recipe.procedureParameters);
    procedureParameters = {
      analyticalReport:
        backendParams.length > 0 ? backendParams : CONFECTIONERY_PROCEDURE_PARAMS,
    };
  } else {
    // Other formats: generic analyticalReport from procedureParameters
    procedureParameters = {
      analyticalReport: mapBackendParamsToUI(recipe.procedureParameters),
    };
  }

  // Oven Temperature (Bakery only)
  let ovenTemperature = null;
  if (isBakery) {
    const tunnelBaking = recipe.ovenTemperatureTunnelBaking || {};
    const normalBakingData = recipe.normalBaking || {};

    const topTemp = tunnelBaking.topTemperature || [];
    const bottomTemp = tunnelBaking.bottomTemperature || [];

    ovenTemperature = {
      tunnelBaking: {
        zones: [
          {
            label: "Top Temperature",
            zone1: topTemp[0]?.toString() || "",
            zone2: topTemp[1]?.toString() || "",
            zone3: topTemp[2]?.toString() || "",
            unit: "°C",
          },
          {
            label: "Bottom Temperature",
            zone1: bottomTemp[0]?.toString() || "",
            zone2: bottomTemp[1]?.toString() || "",
            zone3: bottomTemp[2]?.toString() || "",
            unit: "°C",
          },
        ],
        bakingTime: {
          value: tunnelBaking.bakingTime?.toString() || "",
          unit: "min",
        },
        beltSpeed: {
          value: tunnelBaking.beltSpeed?.toString() || "",
          unit: "",
        },
      },
      normalBaking: {
        bakings: [
          {
            label: "Oven Temperature",
            baking1: (normalBakingData.ovenTemperature?.[0] || "").toString(),
            baking2: (normalBakingData.ovenTemperature?.[1] || "").toString(),
            unit: "°C",
          },
          {
            label: "Oven Time",
            baking1: (normalBakingData.ovenTime?.[0] || "").toString(),
            baking2: (normalBakingData.ovenTime?.[1] || "").toString(),
            unit: "min",
          },
          {
            label: "Steam",
            baking1: (normalBakingData.steam || "").toString(),
            baking2: (normalBakingData.steam || "").toString(),
            unit: "unit",
          },
        ],
      },
    };
  }

  // After Bake (Bakery only)
  let afterBake = null;
  if (isBakery && recipe.afterBake) {
    const ab = recipe.afterBake;
    afterBake = {
      analyticalReport: [
        { label: "Weight", value: ab.weight?.toString() || "", unit: "g" },
        { label: "Size", value: ab.size?.toString() || "", unit: "mm" },
        { label: "Aeration", value: ab.aeration?.toString() || "", unit: "" },
        { label: "aw", value: ab.aW?.toString() || "", unit: "%" },
        { label: "Moisture", value: ab.moisture?.toString() || "", unit: "%" },
      ],
    };
  } else if (isBakery) {
    afterBake = {
      analyticalReport: BAKERY_BENCHMARK_PARAMS.map(p => ({
        label: p.label,
        value: "",
        unit: p.unit,
      })),
    };
  }

  // After Bake Others / Procedure Others
  const afterBakeOthers = recipe.procedureOthers || "";

  // Sensory Feedback
  const sensoryFeedback = recipe.procedureSensoryFeedback || "";

  return {
    benchmark,
    parameters,
    others,
    productDevelopmentFeedback,
    procedure,
    procedureParameters,
    ovenTemperature,
    afterBake,
    afterBakeOthers,
    sensoryFeedback,
  };
}

/**
 * Convert SOP UI data back to backend recipe fields for PATCH /recipes/:id.
 */
export function convertSOPDataToBackendFields(sopData, format = "bakery") {
  const isBakery = format === "bakery";
  const fields = {};

  // Benchmark fields
  if (sopData.benchmark) {
    fields.benchmarkSensoryFeedback = sopData.benchmark.sensoryFeedback || "";
  }
  if (sopData.parameters?.analyticalReport) {
    fields.benchmarkParameters = mapUIParamsToBackend(sopData.parameters.analyticalReport);
  }
  if (sopData.others !== undefined) {
    fields.benchmarkOthers = sopData.others || "";
  }
  if (sopData.productDevelopmentFeedback !== undefined) {
    fields.benchmarkPDFeedback = sopData.productDevelopmentFeedback || "";
  }

  // Procedure
  if (sopData.procedure) {
    fields.procedureSOP = sopData.procedure.raw !== undefined 
      ? sopData.procedure.raw 
      : (sopData.procedure.steps || []).join("\n");
  }

  // Helper to parse numbers safely for Zod (returns undefined instead of NaN/null)
  const parseNum = (val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  };

  // Procedure Parameters
  if (isBakery && sopData.procedureParameters) {
    if (sopData.procedureParameters.analyticalReport) {
      fields.procedureParameters = mapUIParamsToBackend(sopData.procedureParameters.analyticalReport);
    } else {
      const params = [];
      if (sopData.procedureParameters.doughTemperature) {
        params.push({
          parameterName: "Dough Temperature",
          parameterValue: sopData.procedureParameters.doughTemperature.value || "",
          parameterUnit: "°C",
        });
      }
      if (sopData.procedureParameters.sg) {
        params.push({
          parameterName: "SG",
          parameterValue: sopData.procedureParameters.sg.value || "",
          parameterUnit: "",
        });
      }
      if (sopData.procedureParameters.ph) {
        params.push({
          parameterName: "pH",
          parameterValue: sopData.procedureParameters.ph.value || "",
          parameterUnit: "",
        });
      }
      fields.procedureParameters = params;
    }
  } else if (sopData.procedureParameters?.analyticalReport) {
    fields.procedureParameters = mapUIParamsToBackend(sopData.procedureParameters.analyticalReport);
  }

  // Oven Temperature (Bakery)
  if (isBakery && sopData.ovenTemperature) {
    const tb = sopData.ovenTemperature.tunnelBaking;
    if (tb) {
      const topZone = tb.zones?.find(z => z.label === "Top Temperature");
      const bottomZone = tb.zones?.find(z => z.label === "Bottom Temperature");
      const tunnelData = {
        topTemperature: [topZone?.zone1, topZone?.zone2, topZone?.zone3]
          .map(v => parseNum(v))
          .filter(v => v !== undefined),
        bottomTemperature: [bottomZone?.zone1, bottomZone?.zone2, bottomZone?.zone3]
          .map(v => parseNum(v))
          .filter(v => v !== undefined),
        bakingTime: parseNum(tb.bakingTime?.value),
        beltSpeed: parseNum(tb.beltSpeed?.value),
      };

      // Filter out undefined to keep payload clean
      const cleaned = Object.fromEntries(Object.entries(tunnelData).filter(([_, v]) => v !== undefined));
      if (Object.keys(cleaned).length > 0) {
        fields.ovenTemperatureTunnelBaking = cleaned;
      }
    }

    const nb = sopData.ovenTemperature.normalBaking;
    if (nb) {
      const ovenTempBaking = nb.bakings?.find(b => b.label === "Oven Temperature");
      const ovenTimeBaking = nb.bakings?.find(b => b.label === "Oven Time");
      const steamBaking = nb.bakings?.find(b => b.label === "Steam");
      const normalData = {
        ovenTemperature: [ovenTempBaking?.baking1, ovenTempBaking?.baking2]
          .map(v => parseNum(v))
          .filter(v => v !== undefined),
        ovenTime: [ovenTimeBaking?.baking1, ovenTimeBaking?.baking2]
          .map(v => parseNum(v))
          .filter(v => v !== undefined),
        steam: parseNum(steamBaking?.baking1),
      };

      // Filter out undefined
      const cleaned = Object.fromEntries(Object.entries(normalData).filter(([_, v]) => v !== undefined));
      if (Object.keys(cleaned).length > 0) {
        fields.normalBaking = cleaned;
      }
    }
  }

  // After Bake (Bakery)
  if (isBakery && sopData.afterBake?.analyticalReport) {
    const report = sopData.afterBake.analyticalReport;
    const findVal = (label) => {
      const item = report.find(r => r.label === label);
      return parseNum(item?.value);
    };
    const abData = {
      weight: findVal("Weight"),
      size: findVal("Size"),
      aeration: findVal("Aeration"),
      aW: findVal("aw"),
      moisture: findVal("Moisture"),
    };

    // Filter out undefined
    const cleaned = Object.fromEntries(Object.entries(abData).filter(([_, v]) => v !== undefined));
    if (Object.keys(cleaned).length > 0) {
      fields.afterBake = cleaned;
    }
  }

  // Procedure Others
  if (sopData.afterBakeOthers !== undefined) {
    fields.procedureOthers = sopData.afterBakeOthers || "";
  }

  // Procedure Sensory Feedback
  if (sopData.sensoryFeedback !== undefined) {
    fields.procedureSensoryFeedback = sopData.sensoryFeedback || "";
  }

  return fields;
}

// Keep the old helper name for backward compatibility but deprecate it
export const getSOPDataByFormat = (format) => {
  // Returns empty structure — callers should use buildSOPDataFromRecipe instead
  return buildSOPDataFromRecipe({}, format);
};
