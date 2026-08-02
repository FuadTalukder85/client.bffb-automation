import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { bffProductSegmentService } from "@/services/bffProductSegmentService";
import { isValidSegmentKind } from "@/constants/bffProductSegment";

const DEFAULT_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

const STATUS_MAP = {
  active: "true",
  archived: "false",
  all: "all",
};

const prepareParams = ({ searchTerm = "", status = "active", page, limit }) => {
  const params = { page, limit };
  const trimmedTerm = searchTerm.trim();

  if (trimmedTerm.length > 0) {
    params.search = trimmedTerm;
  }

  if (status && status !== "all") {
    params.isActive = STATUS_MAP[status];
  }

  return params;
};

const transformItem = (item) => ({
  id: item._id,
  _id: item._id,
  name: item.name,
  kind: item.kind,
  status: item.isActive ? "Active" : "Archived",
  isActive: item.isActive,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

/**
 * Fetch paginated segment items for a kind
 */
export function useBFFProductSegment(kind, filters = {}) {
  const { page = DEFAULT_PAGINATION.page, limit = DEFAULT_PAGINATION.limit } = filters;
  const apiParams = prepareParams({ ...filters, page, limit });
  const enabled = isValidSegmentKind(kind);

  return useQuery({
    queryKey: queryKeys.bffProductTaxonomy.list(kind, apiParams),
    queryFn: ({ signal }) =>
      bffProductSegmentService.getItems(kind, apiParams, { signal }),
    enabled,
    placeholderData: keepPreviousData,
    select: (responseData) => {
      const result = responseData?.data || responseData || {};
      return {
        data: (result.data || result.items || []).map(transformItem),
        pagination: result.pagination || DEFAULT_PAGINATION,
      };
    },
  });
}
export const useBFFProductTaxonomy = useBFFProductSegment;

/**
 * Fetch available segment kinds
 */
export function useBFFProductSegmentKinds({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.bffProductTaxonomy.kinds(),
    queryFn: ({ signal }) => bffProductSegmentService.getKinds({ signal }),
    enabled,
    select: (response) => response?.data || response || [],
  });
}
export const useBFFProductTaxonomyKinds = useBFFProductSegmentKinds;

/**
 * Fetch a single segment item
 */
export function useBFFProductSegmentItem(kind, id, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.bffProductTaxonomy.detail(kind, id),
    queryFn: ({ signal }) => bffProductSegmentService.getItem(kind, id, { signal }),
    enabled: enabled && !!kind && !!id && isValidSegmentKind(kind),
    select: (response) => {
      const data = response?.data || response;
      return data ? transformItem(data) : null;
    },
  });
}
export const useBFFProductTaxonomyItem = useBFFProductSegmentItem;
