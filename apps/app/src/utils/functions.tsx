import { CrateItemResponse } from "../client/api";
import { ApiClient } from "../client/client";
import { Toast } from "../components/Toast";
import {
  BASE_XP,
  BASE_XP_INCREASE,
  BLOCKED_USERS_LOCAL_STORAGE_KEY,
  ROLL_ITEM_FIRST_INDEX,
  ROLL_ITEM_GAP_WIDTH,
  ROLL_ITEM_WIDTH,
  ROLL_ITEM_WIDTH_SM,
  ROLL_ITEM_WIDTH_XS,
  ROLL_ITEMS_COUNT,
  TICK_SOUNDS,
  WIN_ITEM_ROLL_INDEX,
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

export const playCrateSound = (
  totalDuration: number,
  getVolume: () => number,
) => {
  const totalItems = 50;
  const startTime = performance.now();

  let lastPlayedIndex = -1;

  const playSound = (index: number) => {
    const audio = new Audio(TICK_SOUNDS[index % TICK_SOUNDS.length]);
    audio.volume = getVolume();
    audio.play();
  };

  const tick = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);
    const easedProgress = easeOutQuad(progress);

    const currentIndex = Math.floor(easedProgress * totalItems);

    if (currentIndex !== lastPlayedIndex && currentIndex < totalItems) {
      playSound(currentIndex);
      lastPlayedIndex = currentIndex;
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      playSound(totalItems);
    }
  };

  requestAnimationFrame(tick);
};

export const formatBalance = (amount: number) => (amount / 100).toFixed(2);

export const getColorFromPrice = (price: number) => {
  if (price < 100) {
    return Color.White;
  } else if (price >= 100 && price < 1000) {
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

export const generateRandomRollItem = (
  crateItems: CrateItemResponse[],
): CrateItemResponse => {
  let totalWeight = 0;

  const biasedItems = crateItems.map((item) => {
    const biasedWeight = Math.pow(item.chance, 0.33);
    totalWeight += biasedWeight;

    return {
      ...item,
      biasedWeight,
    };
  });

  const number = Math.random() * totalWeight;
  let cumulativeChance = 0;

  for (const item of biasedItems) {
    cumulativeChance += item.biasedWeight;
    if (number < cumulativeChance) {
      return item;
    }
  }

  return biasedItems[biasedItems.length - 1];
};

export const generateRandomRoll = (
  crateItems: CrateItemResponse[],
  wonItem: CrateItemResponse,
): CrateItemResponse[] => {
  const results: CrateItemResponse[] = [];

  for (let i = 0; i < ROLL_ITEMS_COUNT; i++) {
    if (i === WIN_ITEM_ROLL_INDEX + ROLL_ITEM_FIRST_INDEX + 1) {
      results.push(wonItem);
    } else {
      results.push(generateRandomRollItem(crateItems));
    }
  }

  return results;
};

export const getItemWidth = () => {
  if (typeof window === "undefined") return ROLL_ITEM_WIDTH;
  return window.matchMedia("(min-width: 640px)").matches
    ? ROLL_ITEM_WIDTH_SM
    : ROLL_ITEM_WIDTH_XS;
};

const getRollBaseOffset = (itemWidth: number) =>
  (itemWidth + ROLL_ITEM_GAP_WIDTH) * WIN_ITEM_ROLL_INDEX + itemWidth / 2 + 4;

export const getCenterOffset = (itemWidth: number) =>
  getRollBaseOffset(itemWidth) + (itemWidth + ROLL_ITEM_GAP_WIDTH) / 2;

export const generateOffset = (itemWidth: number) => {
  const edgeBiasedOffset = Math.round(
    ((1 - Math.cos(Math.random() * Math.PI)) / 2) * itemWidth,
  );
  return getRollBaseOffset(itemWidth) + edgeBiasedOffset;
};
