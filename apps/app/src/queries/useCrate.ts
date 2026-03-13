import { GetCrateResponse } from "../client/api";
import { ApiClient } from "../client/client";
import { useQuery } from "@tanstack/react-query";

export const CRATE_QUERY_KEY = (id: string) => ["crate", id];

export const useCrate = (id: string, initialData?: GetCrateResponse | null) => {
  const { data } = useQuery({
    queryKey: CRATE_QUERY_KEY(id),
    queryFn: async () => {
      const { data } = await ApiClient.crates.crateControllerGetCrate(id);
      return data;
    },
    initialData: initialData ?? undefined,
    retry: false,
  });

  return data ?? null;
};
