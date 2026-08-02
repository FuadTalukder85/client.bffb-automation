/** Resolve taxonomy ref (populated object or id) to a display label. */
export function getTaxonomyLabel(value, fallback = "N/A") {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") {
    return value.name || value.label || fallback;
  }
  return fallback;
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
