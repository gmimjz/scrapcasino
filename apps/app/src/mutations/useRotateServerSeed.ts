import { ApiClient } from "../client/client";
import { USER_QUERY_KEY } from "../queries/useUser";
import { ToastStatus } from "../utils/enums";
import { addToast, onError } from "../utils/functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRotateServerSeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await ApiClient.user.userControllerRotateServerSeed();
      return data;
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(USER_QUERY_KEY, user);
      addToast("Server seed rotated successfully", ToastStatus.Success);
    },
    onError,
  });
}
