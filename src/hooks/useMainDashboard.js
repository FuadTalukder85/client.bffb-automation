import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { projectService } from "@/services/projectService";

export function useMainDashboard({ enabled = true, startDate, endDate } = {}) {
  const queryParams = {
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  return useQuery({
    queryKey: queryKeys.mainDashboard.metrics(queryParams),
    queryFn: ({ signal }) =>
      projectService.getMainDashboard({
        signal,
        params: queryParams,
      }),
    enabled,
    select: (responseData) => responseData?.data || responseData || {},
  });
}
