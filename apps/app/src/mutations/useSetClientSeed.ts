import { ApiClient } from "../client/client";
import { USER_QUERY_KEY } from "../queries/useUser";
import { ToastStatus } from "../utils/enums";
import { addToast, onError } from "../utils/functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const clientSeedSchema = z.object({
  clientSeed: z
    .string()
    .min(1, "Client seed can't be empty")
    .max(32, "Client seed can't be longer than 32 characters"),
});

export function useSetClientSeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientSeed: string) => {
      const { data } = await ApiClient.user.userControllerSetClientSeed({
        clientSeed,
      });
      return data;
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(USER_QUERY_KEY, user);
      addToast("Client seed set successfully", ToastStatus.Success);
    },
    onError,
  });
}
