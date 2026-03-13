import { ChatMessageResponse } from "../client/api";
import { AxiosError } from "axios";

export interface ChatMessageWithBlocked extends ChatMessageResponse {
  isBlocked: boolean;
}

export type ApiError = AxiosError<{
  error: string;
  message: string;
  statusCode: number;
}>;
