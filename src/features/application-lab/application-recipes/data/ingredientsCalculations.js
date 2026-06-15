const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatPercentValue = (value) => `${toNumber(value).toFixed(2)}`;
export const isConfectionaryRecipe = (recipeType = "") =>
  String(recipeType || "").toLowerCase().includes("confection");

const toTitle = (value = "") =>
  String(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const buildIngredientName = (item) => {
  if (item?.sourceName && item?.sourceCode) return `${item.sourceCode} - ${item.sourceName}`;
  if (item?.sourceName) return item.sourceName;
  if (item?.name) return item.name;
  if (item?.ingredientName) return item.ingredientName;

  const sourceType = item?.ingredientSourceType === "bffProductCode" ? "BFF" : "Raw";
  const sourceId = item?.sourceId ? String(item.sourceId).slice(-6) : "N/A";
  return `${sourceType} ${sourceId}`;
};

export function buildIngredientsDisplayData(recipeData, overrides = {}) {
  const ingredients = Array.isArray(recipeData?.ingredients) ? recipeData.ingredients : [];
  const isConfectionary = isConfectionaryRecipe(recipeData?.recipeType);

  const outputYield =
    overrides.outputYield !== undefined
      ? toNumber(overrides.outputYield)
      : toNumber(recipeData?.outputYield);
  const outputServingSize =
    overrides.outputServingSize !== undefined
      ? toNumber(overrides.outputServingSize)
      : toNumber(recipeData?.outputServingSize);

  const ingredientRows = ingredients.map((item, index) => {
    const quantity = toNumber(item?.quantity);
    const bffRate = toNumber(item?.bffRateAtCreation);
    const clientRate = toNumber(item?.clientRateAtCreation);

    return {
      ...item,
      sl: index + 1,
      originalIndex: index,
      role: toTitle(item?.role || "-"),
      type: toTitle(item?.type || "-"),
      process: item?.process || "",
      typeKey: String(item?.type || "").toLowerCase(),
      name: buildIngredientName(item),
      quantity,
      bffRate,
      clientRate,
      bffCost: (bffRate * quantity) / 1000,
      clientCost: (clientRate * quantity) / 1000,
      isSeparator: false,
      solidLiquid: null,
    };
  });

  const liquidRows = ingredientRows.filter((item) => item.typeKey === "liquid");
  const solidRows = ingredientRows.filter((item) => item.typeKey === "solid");
  const others = ingredientRows.filter((item) => !["liquid", "solid"].includes(item.typeKey));

  const totalQuantity = ingredientRows.reduce((sum, item) => sum + item.quantity, 0);
  const totalBFFCost = ingredientRows.reduce((sum, item) => sum + item.bffCost, 0);
  const totalClientCost = ingredientRows.reduce((sum, item) => sum + item.clientCost, 0);

  const liquidQuantity = liquidRows.reduce((sum, item) => sum + item.quantity, 0);
  const solidQuantity = solidRows.reduce((sum, item) => sum + item.quantity, 0);

  const solidPercent = totalQuantity > 0 ? (solidQuantity / totalQuantity) * 100 : 0;
  const liquidPercent = totalQuantity > 0 ? (liquidQuantity / totalQuantity) * 100 : 0;
  const withSolidLiquid = (rows, segmentPercent) =>
    rows.map((item, index) => ({
      ...item,
      solidLiquid: index === 0 ? formatPercentValue(segmentPercent) : null,
    }));

  const normalizedLiquidRows = withSolidLiquid(liquidRows, liquidPercent);
  const normalizedSolidRows = withSolidLiquid(solidRows, solidPercent);

  if (normalizedLiquidRows.length > 0 && normalizedSolidRows.length > 0) {
    normalizedLiquidRows[normalizedLiquidRows.length - 1] = {
      ...normalizedLiquidRows[normalizedLiquidRows.length - 1],
      isSeparator: true,
    };
  }

  const baseRows = isConfectionary
    ? [...ingredientRows].sort((a, b) => {
        const processA = String(a.process || "").toUpperCase();
        const processB = String(b.process || "").toUpperCase();
        if (processA !== processB) {
          return processA.localeCompare(processB);
        }
        return a.originalIndex - b.originalIndex;
      }).map((row) => ({
        ...row,
        isSeparator: false,
        solidLiquid: null,
      }))
    : [...normalizedLiquidRows, ...normalizedSolidRows, ...others];

  const orderedRows = baseRows.map((row, index) => {
    const composition = totalQuantity > 0 ? (row.quantity / totalQuantity) * 100 : 0;

    return {
      ...row,
      sl: index + 1,
      bffRate: toNumber(row.bffRate).toFixed(2),
      clientRate: toNumber(row.clientRate).toFixed(2),
      composition: formatPercentValue(composition),
      bffCost: toNumber(row.bffCost).toFixed(2),
      clientCost: toNumber(row.clientCost).toFixed(2),
    };
  });

  const outputGrams = totalQuantity * (outputYield / 100);
  const outputPieces = outputServingSize > 0 ? outputGrams / outputServingSize : 0;

  const doughCostPerKgBFF = totalQuantity > 0 ? totalBFFCost / (totalQuantity / 1000) : 0;
  const doughCostPerKgClient = totalQuantity > 0 ? totalClientCost / (totalQuantity / 1000) : 0;

  const costPerKgWithLossBFF = outputYield > 0 ? doughCostPerKgBFF / (outputYield / 100) : 0;
  const costPerKgWithLossClient = outputYield > 0 ? doughCostPerKgClient / (outputYield / 100) : 0;

  const costPerPieceBFF = outputPieces > 0 ? totalBFFCost / outputPieces : 0;
  const costPerPieceClient = outputPieces > 0 ? totalClientCost / outputPieces : 0;

  return {
    ingredients: orderedRows,
    totals: {
      quantity: totalQuantity.toFixed(2),
      composition: "100.00",
      bffCost: totalBFFCost.toFixed(2),
      clientCost: totalClientCost.toFixed(2),
    },
    batchSummary: {
      output: {
        yield: outputYield,
        servingSize: outputServingSize,
        outputPieces: outputPieces.toFixed(2),
        output: outputGrams.toFixed(2),
      },
      costCalculation: {
        doughCostPerKg: {
          bff: doughCostPerKgBFF.toFixed(2),
          client: doughCostPerKgClient.toFixed(2),
        },
        costPerKgWithLoss: {
          bff: costPerKgWithLossBFF.toFixed(2),
          client: costPerKgWithLossClient.toFixed(2),
        },
        costPerPiece: {
          bff: costPerPieceBFF.toFixed(2),
          client: costPerPieceClient.toFixed(2),
        },
      },
      solidLiquid: {
        solid: solidPercent.toFixed(2),
        liquid: liquidPercent.toFixed(2),
      },
    },
  };
}
