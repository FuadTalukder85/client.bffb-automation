/**
 * Standalone BFF Product segment kinds (blue-highlighted form fields).
 * Each kind is managed under /bff-product/segment/:kind
 */
export const BFF_PRODUCT_SEGMENT_KINDS = {
  BFF_BRAND_NAME: "bff-brand-name",
  SEGMENT: "segment",
  CATEGORY: "category",
  MARKET: "market",
  BRAND: "brand",
  PRODUCT_TYPE: "product-type",
  REGULATORY_STATUS: "regulatory-status",
  CERTIFICATION: "certification",
  AVAILABLE_FORM: "available-form",
  SOLUBILITY: "solubility",
  PERFORM_STABILITY: "perform-stability",
  APPLICATION_AREA: "application-area",
};
export const BFF_PRODUCT_TAXONOMY_KINDS = BFF_PRODUCT_SEGMENT_KINDS;

export const BFF_PRODUCT_SEGMENT_KIND_VALUES = Object.values(BFF_PRODUCT_SEGMENT_KINDS);
export const BFF_PRODUCT_TAXONOMY_KIND_VALUES = BFF_PRODUCT_SEGMENT_KIND_VALUES;

export const BFF_PRODUCT_SEGMENT_LABELS = {
  [BFF_PRODUCT_SEGMENT_KINDS.BFF_BRAND_NAME]: "BFF Brand Name",
  [BFF_PRODUCT_SEGMENT_KINDS.SEGMENT]: "Segment",
  [BFF_PRODUCT_SEGMENT_KINDS.CATEGORY]: "Category",
  [BFF_PRODUCT_SEGMENT_KINDS.MARKET]: "Market",
  [BFF_PRODUCT_SEGMENT_KINDS.BRAND]: "Brand",
  [BFF_PRODUCT_SEGMENT_KINDS.PRODUCT_TYPE]: "Product Type",
  [BFF_PRODUCT_SEGMENT_KINDS.REGULATORY_STATUS]: "Regulatory Status",
  [BFF_PRODUCT_SEGMENT_KINDS.CERTIFICATION]: "Certifications",
  [BFF_PRODUCT_SEGMENT_KINDS.AVAILABLE_FORM]: "Available Forms",
  [BFF_PRODUCT_SEGMENT_KINDS.SOLUBILITY]: "Solubility",
  [BFF_PRODUCT_SEGMENT_KINDS.PERFORM_STABILITY]: "Perform Stability",
  [BFF_PRODUCT_SEGMENT_KINDS.APPLICATION_AREA]: "Application Area",
};
export const BFF_PRODUCT_TAXONOMY_LABELS = BFF_PRODUCT_SEGMENT_LABELS;

export const isValidSegmentKind = (kind) =>
  BFF_PRODUCT_SEGMENT_KIND_VALUES.includes(kind);
export const isValidTaxonomyKind = isValidSegmentKind;

/** Sidebar / nav items for segment kinds */
export const getBFFProductSegmentNavItems = () =>
  BFF_PRODUCT_SEGMENT_KIND_VALUES.map((kind) => ({
    id: `bff-product-segment-${kind}`,
    label: BFF_PRODUCT_SEGMENT_LABELS[kind],
    path: `/bff-product/segment/${kind}`,
  }));
export const getBFFProductTaxonomyNavItems = getBFFProductSegmentNavItems;
