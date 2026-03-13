import { ApiClient } from "../client/client";
import { USER_QUERY_KEY } from "../queries/useUser";
import { onError } from "../utils/functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await ApiClient.auth.authControllerLogout();
      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null);
    },
    onError,
  });
}
