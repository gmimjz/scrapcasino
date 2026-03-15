import { ApiClient } from "../client/client";
import { Toast } from "../components/Toast";
import {
  BASE_XP,
  BASE_XP_INCREASE,
  BLOCKED_USERS_LOCAL_STORAGE_KEY,
  TICK_SOUNDS,
} from "./consts";
import { Color, ToastStatus } from "./enums";
import { ApiError } from "./types";
import { toast } from "sonner";

export const fetchUser = async (cookie: string) => {
  try {
    const { data } = await ApiClient.user.userControllerGetUser({
      headers: { cookie },
    });
    return data.user;
  } catch {
    return null;
  }
};

export const fetchCrates = async () => {
  try {
    const { data } = await ApiClient.crates.crateControllerGetCrates();
    return data;
  } catch {
    return null;
  }
};

export const fetchCrate = async (id: string) => {
  try {
    const { data } = await ApiClient.crates.crateControllerGetCrate(id);
    return data;
  } catch {
    return null;
  }
};

export const calculateLevelAndXpGoal = (xp: number) => {
  let xpLeft = xp;
  let xpNeeded = BASE_XP;

  let level = 0;

  while (xpLeft >= xpNeeded) {
    xpLeft -= xpNeeded;
    level++;
    xpNeeded = Math.round(xpNeeded * BASE_XP_INCREASE);
  }

  return { level, xp: xpLeft, xpGoal: xpNeeded };
};

export const getBlockedUsers = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  return new Set(
    JSON.parse(localStorage.getItem(BLOCKED_USERS_LOCAL_STORAGE_KEY) || "[]"),
  );
};

export const saveBlockedUsers = (blockedUsers: Set<string>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    BLOCKED_USERS_LOCAL_STORAGE_KEY,
    JSON.stringify([...blockedUsers]),
  );
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const easeOutQuad = (t: number): number => {
  return t * (2 - t);
};

export const playCrateSound = () => {
  const totalItems = 50;
  const totalDuration = 7000;
  const startTime = performance.now();

  let lastPlayedIndex = -1;

  const tick = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);
    const easedProgress = easeOutQuad(progress);

    const currentIndex = Math.floor(easedProgress * totalItems);

    if (currentIndex !== lastPlayedIndex && currentIndex < totalItems) {
      new Audio(TICK_SOUNDS[currentIndex % TICK_SOUNDS.length]).play();
      lastPlayedIndex = currentIndex;
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      new Audio(TICK_SOUNDS[totalItems % TICK_SOUNDS.length]).play();
    }
  };

  requestAnimationFrame(tick);
};

export const formatBalance = (amount: number) => (amount / 100).toFixed(2);

export const getColorFromPrice = (price: number) => {
  if (price < 1000) {
    return Color.Green;
  } else if (price >= 1000 && price < 10000) {
    return Color.Blue;
  } else if (price >= 10000 && price < 50000) {
    return Color.Red;
  } else {
    return Color.Yellow;
  }
};

export const generateRandomSeed = () => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }

  return result;
};

export const addToast = (message?: string, status?: ToastStatus) => {
  return toast.custom(() => <Toast message={message} status={status} />);
};

export const onError = (error: ApiError) => {
  const message = error.response?.data.message;
  addToast(message, ToastStatus.Error);
};
