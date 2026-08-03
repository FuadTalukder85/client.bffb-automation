const typeDisplayMap = {
  solid: "Solid",
  liquid: "Liquid",
};

/** Resolve taxonomy ref (populated object, array, string, or id) to display label(s). */
export function getTaxonomyLabel(value, fallback = "N/A") {
  if (value == null || value === "") return fallback;
  if (typeof value === "object" && value !== null) {
    return value.name || value.label || value.title || fallback;
  }
  if (typeof value === "string") {
    return typeDisplayMap[value] || value;
  }
  return fallback;
}

export function getTaxonomyLabels(value, fallback = "N/A") {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((item) => getTaxonomyLabel(item, "")).filter(Boolean);
}

export function getProductDisplayName(product, fallback = "N/A") {
  if (!product) return fallback;
  return product.productName || product.name || fallback;
}

export function getProductDisplayCode(product, fallback = "N/A") {
  if (!product) return fallback;
  return (
    product.commercialCode ||
    product.commercializedProductCode ||
    product.xpCode ||
    product.displayProductCode ||
    product.productCode ||
    fallback
  );
}

export function formatDate(value, fallback = "N/A") {
  if (!value) return fallback;
  const date = new Date(value);
  if (isNaN(date.getTime())) return typeof value === "string" ? value : fallback;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

