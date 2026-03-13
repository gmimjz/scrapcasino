import { ApiClient } from "../client/client";
import { useChatStore } from "../store/chatStore";
import { onError } from "../utils/functions";
import { useMutation } from "@tanstack/react-query";

export function useRemoveChatMessage() {
  const { updateChatMessage } = useChatStore();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data } =
        await ApiClient.chat.chatControllerDeleteMessage(messageId);
      return data;
    },
    onSuccess: (data) => {
      updateChatMessage(data.chatMessage.id, { isRemoved: true });
    },
    onError,
  });
}
