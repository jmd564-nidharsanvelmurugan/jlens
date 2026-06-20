import { useQuery,  } from "@tanstack/react-query";
import { analyticsApi } from "../actions";

export const useAnalytics = {
  list: () =>
    useQuery({
      queryKey: ["analytics:list"],
      queryFn: () => analyticsApi.getDashboards(),
    }),

  get: (id: string) =>
    useQuery({
      queryKey: ["analytics:detail", id],
      queryFn: () => analyticsApi.getDashboardById(id),
    }),
};
