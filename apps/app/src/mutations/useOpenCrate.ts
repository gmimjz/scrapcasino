import { ApiClient } from "../client/client";
import { onError } from "../utils/functions";
import { useMutation } from "@tanstack/react-query";

export function useOpenCrate() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await ApiClient.crates.crateControllerOpenCrate(id);
      return data;
    },
    onError,
  });
}
