import { ApiClient } from "../client/client";
import { onError } from "../utils/functions";
import { useMutation } from "@tanstack/react-query";

type OpenCrateData = {
  id: string;
  count: number;
};

export function useOpenCrate() {
  return useMutation({
    mutationFn: async ({ id, count }: OpenCrateData) => {
      const { data } = await ApiClient.crates.crateControllerOpenCrate(id, {
        count,
      });
      return data.items;
    },
    onError,
  });
}
