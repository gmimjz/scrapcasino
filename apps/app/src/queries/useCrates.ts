import { GetCratesResponse } from "../client/api";
import { ApiClient } from "../client/client";
import { useQuery } from "@tanstack/react-query";

export const CRATES_QUERY_KEY = ["crates"];

export const useCrates = (initialData?: GetCratesResponse | null) => {
  const { data } = useQuery({
    queryKey: CRATES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await ApiClient.crates.crateControllerGetCrates();
      return data;
    },
    initialData: initialData ?? undefined,
  });

  return data ?? null;
};
