import { Api } from "./api";

export const ApiClient = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  secure: true,
  withCredentials: true,
});
