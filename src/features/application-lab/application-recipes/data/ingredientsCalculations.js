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
  return "";
};

export function buildIngredientsDisplayData(recipeData, overrides = {}) {
  const ingredients = Array.isArray(recipeData?.ingredients) ? recipeData.ingredients : [];
  const isConfectionary = isConfectionaryRecipe(recipeData?.recipeType);

  const outputYield =
    overrides.yield !== undefined
      ? toNumber(overrides.yield)
      : overrides.outputYield !== undefined
      ? toNumber(overrides.outputYield)
      : toNumber(recipeData?.yield ?? recipeData?.outputYield);
  const outputServingSize =
    overrides.servingSize !== undefined
      ? toNumber(overrides.servingSize)
      : overrides.outputServingSize !== undefined
      ? toNumber(overrides.outputServingSize)
      : toNumber(recipeData?.servingSize ?? recipeData?.outputServingSize);

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
  const totalSolidLiquid = solidPercent + liquidPercent;

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

  // Sum exact (unrounded) composition values to avoid rounding drift (e.g. 100.01)
  const rawTotalComposition = ingredients.reduce((sum, item) => {
    const qty = toNumber(item?.quantity);
    return sum + (totalQuantity > 0 ? (qty / totalQuantity) * 100 : 0);
  }, 0);
  const totalComposition =
    Math.abs(rawTotalComposition - 100) < 0.01 ? 100 : rawTotalComposition;

  const outputGrams = totalQuantity * (outputYield / 100);
  const outputPieces = outputServingSize > 0 ? outputGrams / outputServingSize : 0;
  const wastageGrams = Math.max(0, totalQuantity - outputGrams);

  const doughCostPerKgBFF = totalQuantity > 0 ? totalBFFCost / (totalQuantity / 1000) : 0;
  const doughCostPerKgClient = totalQuantity > 0 ? totalClientCost / (totalQuantity / 1000) : 0;

  const costPerKgWithLossBFF = outputYield > 0 ? doughCostPerKgBFF / (outputYield / 100) : 0;
  const costPerKgWithLossClient = outputYield > 0 ? doughCostPerKgClient / (outputYield / 100) : 0;

  const labOutputCostBFF = totalBFFCost * (outputYield / 100);
  const wastageCostBFF = Math.max(0, totalBFFCost - labOutputCostBFF);
  const costPerPieceBFF = outputPieces > 0 ? labOutputCostBFF / outputPieces : 0;
  const costPerPacketBFF = costPerPieceBFF * outputPieces;

  const costPerPieceClient = outputPieces > 0 ? (totalClientCost * (outputYield / 100)) / outputPieces : 0;

  const confectioneryPerPiece =
    overrides.perPiece !== undefined
      ? toNumber(overrides.perPiece)
      : toNumber(recipeData?.perPiece, outputServingSize > 0 ? outputServingSize : 12);

  const confectioneryPacketQuantity =
    overrides.packetQuantity !== undefined
      ? toNumber(overrides.packetQuantity)
      : toNumber(recipeData?.packetQuantity, outputPieces > 0 ? Math.round(outputPieces) : 4);

  const confLabOutput =
    confectioneryPerPiece > 0 && confectioneryPacketQuantity > 0
      ? confectioneryPerPiece * confectioneryPacketQuantity
      : outputGrams > 0
      ? outputGrams
      : 48;

  const confCostPerPiece =
    costPerKgWithLossBFF > 0 && confectioneryPerPiece > 0
      ? (costPerKgWithLossBFF / 1000) * confectioneryPerPiece
      : costPerPieceBFF > 0
      ? costPerPieceBFF
      : 6;

  const confCostPerPacket = confCostPerPiece * confectioneryPacketQuantity;

  const confLabOutputCost =
    confCostPerPiece > 0 && confectioneryPacketQuantity > 0
      ? confCostPerPiece * confectioneryPacketQuantity
      : labOutputCostBFF > 0
      ? labOutputCostBFF
      : 24;

  const confWastage =
    totalQuantity > 0 && confLabOutput > 0
      ? Math.max(0, totalQuantity - confLabOutput)
      : wastageGrams > 0
      ? wastageGrams
      : 48;

  const confWastageCost =
    doughCostPerKgBFF > 0 && confWastage > 0
      ? (doughCostPerKgBFF / 1000) * confWastage
      : wastageCostBFF > 0
      ? wastageCostBFF
      : 6;

  const formatConfectioneryNum = (num, fallback = "0") => {
    if (!Number.isFinite(num) || num === 0) return fallback;
    return num % 1 === 0 ? String(num) : num.toFixed(2);
  };

  const formatConfectioneryCost = (num, fallback = "0") => {
    if (!Number.isFinite(num) || num === 0) return fallback;
    return num % 1 === 0
      ? String(num)
      : num >= 100
      ? num.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
      : num.toFixed(2);
  };

  return {
    ingredients: orderedRows,
    totals: {
      quantity: totalQuantity % 1 === 0 ? String(totalQuantity) : totalQuantity.toFixed(2),
      composition: totalComposition > 0 ? (totalComposition % 1 === 0 ? String(totalComposition) : totalComposition.toFixed(2)) : "0.00",
      solidLiquid: totalSolidLiquid > 0 ? (totalSolidLiquid % 1 === 0 ? String(totalSolidLiquid) : totalSolidLiquid.toFixed(2)) : "-",
      bffCost: totalBFFCost.toFixed(2),
      clientCost: totalClientCost.toFixed(2),
    },
    batchSummary: {
      output: {
        yield: outputYield,
        servingSize: outputServingSize,
        outputPieces: outputPieces > 0 ? (outputPieces % 1 === 0 ? String(outputPieces) : outputPieces.toFixed(2)) : "100",
        output: outputGrams > 0 ? (outputGrams % 1 === 0 ? String(outputGrams) : outputGrams.toFixed(2)) : "100",
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
      bffCostCalculation: {
        perPiece: confectioneryPerPiece > 0 ? formatConfectioneryNum(confectioneryPerPiece, "12") : "12",
        costPerPiece: confCostPerPiece > 0 ? formatConfectioneryNum(confCostPerPiece, "6") : "6",
        packetQuantity: confectioneryPacketQuantity > 0 ? formatConfectioneryNum(confectioneryPacketQuantity, "4") : "4",
        labOutput: confLabOutput > 0 ? formatConfectioneryNum(confLabOutput, "48") : "48",
        labOutputCost: confLabOutputCost > 0 ? formatConfectioneryNum(confLabOutputCost, "4") : "4",
        labOutputCostUnit: "pcs",
        wastage: confWastage > 0 ? formatConfectioneryNum(confWastage, "48") : "48",
        wastageCost: confWastageCost > 0 ? formatConfectioneryNum(confWastageCost, "6") : "6",
      },
      clientCostCalculation: {
        costPerKgWithoutLoss: doughCostPerKgClient > 0 ? formatConfectioneryCost(doughCostPerKgClient, "10000") : "10000",
        costPerKgWithLoss: costPerKgWithLossClient > 0 ? formatConfectioneryCost(costPerKgWithLossClient, "12000") : "12000",
        costPerPiece: costPerPieceClient > 0 ? formatConfectioneryCost(costPerPieceClient, "150") : "150",
      },
      confectionery: {
        batchSizeCost: totalBFFCost > 0 ? formatConfectioneryNum(totalBFFCost, "30") : "30",
        perPiece: confectioneryPerPiece > 0 ? formatConfectioneryNum(confectioneryPerPiece, "12") : "12",
        packetQuantity: confectioneryPacketQuantity > 0 ? formatConfectioneryNum(confectioneryPacketQuantity, "4") : "4",
        labOutput: confLabOutput > 0 ? formatConfectioneryNum(confLabOutput, "48") : "48",
        wastage: confWastage > 0 ? formatConfectioneryNum(confWastage, "48") : "48",
        costPerPiece: confCostPerPiece > 0 ? formatConfectioneryNum(confCostPerPiece, "6") : "6",
        costPerPacket: confCostPerPacket > 0 ? formatConfectioneryNum(confCostPerPacket, "24") : "24",
        labOutputCost: confLabOutputCost > 0 ? formatConfectioneryNum(confLabOutputCost, "4") : "4",
        wastageCost: confWastageCost > 0 ? formatConfectioneryNum(confWastageCost, "6") : "6",
        clientCostPerKgWithoutLoss: doughCostPerKgClient > 0 ? formatConfectioneryCost(doughCostPerKgClient, "10000") : "10000",
        clientCostPerKgWithLoss: costPerKgWithLossClient > 0 ? formatConfectioneryCost(costPerKgWithLossClient, "12000") : "12000",
        clientCostPerPiece: costPerPieceClient > 0 ? formatConfectioneryCost(costPerPieceClient, "150") : "150",
      },
      solidLiquid: {
        solid: solidPercent.toFixed(2),
        liquid: liquidPercent.toFixed(2),
      },
    },
  };
}
