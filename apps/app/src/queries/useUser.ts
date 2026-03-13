import { UserResponse } from "../client/api";
import { ApiClient } from "../client/client";
import { useQuery } from "@tanstack/react-query";

export const USER_QUERY_KEY = ["user"];

export const useUser = (initialUser?: UserResponse | null) => {
  const { data } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      try {
        const { data } = await ApiClient.user.userControllerGetUser();
        return data.user;
      } catch {
        return null;
      }
    },
    initialData: initialUser ?? undefined,
    retry: false,
  });

  return data ?? null;
};
