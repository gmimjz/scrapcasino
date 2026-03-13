import { ApiClient } from "../client/client";
import { useQuery } from "@tanstack/react-query";

export const MESSAGES_QUERY_KEY = ["messages"];

export const useMessages = () => {
  const { data } = useQuery({
    queryKey: MESSAGES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await ApiClient.chat.chatControllerGetMessages();
      return data;
    },
  });

  return data ?? null;
};
