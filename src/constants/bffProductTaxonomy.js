/**
 * Standalone BFF Product taxonomy kinds (blue-highlighted form fields).
 * Each kind is managed under /bff-product/taxonomy/:kind
 */
export const BFF_PRODUCT_TAXONOMY_KINDS = {
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

export const BFF_PRODUCT_TAXONOMY_KIND_VALUES = Object.values(BFF_PRODUCT_TAXONOMY_KINDS);

export const BFF_PRODUCT_TAXONOMY_LABELS = {
  [BFF_PRODUCT_TAXONOMY_KINDS.BFF_BRAND_NAME]: "BFF Brand Name",
  [BFF_PRODUCT_TAXONOMY_KINDS.SEGMENT]: "Segment",
  [BFF_PRODUCT_TAXONOMY_KINDS.CATEGORY]: "Category",
  [BFF_PRODUCT_TAXONOMY_KINDS.MARKET]: "Market",
  [BFF_PRODUCT_TAXONOMY_KINDS.BRAND]: "Brand",
  [BFF_PRODUCT_TAXONOMY_KINDS.PRODUCT_TYPE]: "Product Type",
  [BFF_PRODUCT_TAXONOMY_KINDS.REGULATORY_STATUS]: "Regulatory Status",
  [BFF_PRODUCT_TAXONOMY_KINDS.CERTIFICATION]: "Certifications",
  [BFF_PRODUCT_TAXONOMY_KINDS.AVAILABLE_FORM]: "Available Forms",
  [BFF_PRODUCT_TAXONOMY_KINDS.SOLUBILITY]: "Solubility",
  [BFF_PRODUCT_TAXONOMY_KINDS.PERFORM_STABILITY]: "Perform Stability",
  [BFF_PRODUCT_TAXONOMY_KINDS.APPLICATION_AREA]: "Application Area",
};

export const isValidTaxonomyKind = (kind) =>
  BFF_PRODUCT_TAXONOMY_KIND_VALUES.includes(kind);

/** Sidebar / nav items for taxonomy kinds */
export const getBFFProductTaxonomyNavItems = () =>
  BFF_PRODUCT_TAXONOMY_KIND_VALUES.map((kind) => ({
    id: `bff-product-taxonomy-${kind}`,
    label: BFF_PRODUCT_TAXONOMY_LABELS[kind],
    path: `/bff-product/taxonomy/${kind}`,
  }));
