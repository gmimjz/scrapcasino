import { ApiClient } from "../client/client";
import { USER_QUERY_KEY } from "../queries/useUser";
import { STEAM_ID_BASE } from "../utils/consts";
import { ToastStatus } from "../utils/enums";
import { addToast, onError } from "../utils/functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const createSteamTradeUrlSchema = (steamId: string | null) =>
  z.object({
    steamTradeUrl: z.string().superRefine((val, ctx) => {
      if (
        !val.match(
          /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)$/,
        )
      ) {
        ctx.addIssue({ code: "custom", message: "Steam Trade URL is invalid" });
        return z.NEVER;
      }
      try {
        const partnerId = BigInt(
          new URL(val).searchParams.get("partner") ?? "0",
        );
        const steamTradeUrlSteamId = STEAM_ID_BASE + partnerId;
        if (steamTradeUrlSteamId.toString() !== steamId) {
          ctx.addIssue({
            code: "custom",
            message: "Steam Trade URL doesn't belong to you",
          });
        }
      } catch {
        ctx.addIssue({ code: "custom", message: "Steam Trade URL is invalid" });
      }
    }),
  });

export function useSetSteamTradeUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (steamTradeUrl: string) => {
      const { data } = await ApiClient.user.userControllerSetSteamTradeUrl({
        steamTradeUrl,
      });
      return data;
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(USER_QUERY_KEY, user);
      addToast("Steam Trade URL set successfully", ToastStatus.Success);
    },
    onError,
  });
}
