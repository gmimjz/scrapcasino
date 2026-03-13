import { ApiClient } from "../client/client";
import { useUsersStore } from "../store/usersStore";
import { onError } from "../utils/functions";
import { useMutation } from "@tanstack/react-query";

type MuteUserData = {
  userId: string;
  duration: number;
};

export function useMuteUser() {
  const { updateUser } = useUsersStore();

  return useMutation({
    mutationFn: async ({ userId, duration }: MuteUserData) => {
      const { data } = await ApiClient.chat.chatControllerMuteUser(userId, {
        duration,
      });
      return data;
    },
    onSuccess: (data) => {
      updateUser(data?.user?.id, data?.user);
    },
    onError,
  });
}
