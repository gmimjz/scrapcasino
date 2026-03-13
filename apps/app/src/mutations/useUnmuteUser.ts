import { ApiClient } from "../client/client";
import { onError } from "../utils/functions";
import { useMutation } from "@tanstack/react-query";

export function useUnmuteUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await ApiClient.chat.chatControllerUnmuteUser(userId);
      return data;
    },
    onError,
  });
}
