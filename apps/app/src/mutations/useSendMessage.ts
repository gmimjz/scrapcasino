import { ApiClient } from "../client/client";
import { onError } from "../utils/functions";
import { useMutation } from "@tanstack/react-query";

export function useSendMessage() {
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await ApiClient.chat.chatControllerSendMessage({
        message,
      });
      return data;
    },
    onError,
  });
}
