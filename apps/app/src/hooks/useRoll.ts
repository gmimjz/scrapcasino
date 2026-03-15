import { CrateItemResponse } from "../client/api";
import {
  ROLL_ITEM_FIRST_INDEX,
  ROLL_ITEM_GAP_WIDTH,
  ROLL_ITEM_WIDTH,
  ROLL_ITEMS_COUNT,
  WIN_ITEM_ROLL_INDEX,
} from "../utils/consts";
import { playCrateSound } from "../utils/functions";
import { useState } from "react";

export const useRoll = (crateItems: CrateItemResponse[]) => {
  const generateRandomRollItem = (): CrateItemResponse => {
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

  const generateRandomRoll = (wonItem: CrateItemResponse) => {
    const results = [];

    for (let i = 0; i < ROLL_ITEMS_COUNT; i++) {
      if (wonItem && i === WIN_ITEM_ROLL_INDEX + ROLL_ITEM_FIRST_INDEX + 1) {
        results.push(wonItem);
      } else {
        results.push(generateRandomRollItem());
      }
    }

    return results;
  };

  const [rolledItems, setRolledItems] = useState<CrateItemResponse[]>(() =>
    generateRandomRoll(generateRandomRollItem()),
  );
  const [wereItemsRolled, setWereItemsRolled] = useState(true);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const roll = (wonItem?: CrateItemResponse) =>
    new Promise((resolve) => {
      setIsRolling(true);

      if (!wereItemsRolled) {
        setRolledItems(generateRandomRoll(wonItem ?? generateRandomRollItem()));
      }

      setWereItemsRolled(false);
      setShowAnimation(false);
      setTransitionDuration(0);
      setOffset(0);
      playCrateSound();
      setTimeout(() => {
        setTransitionDuration(7000);
        setOffset(
          (ROLL_ITEM_WIDTH + ROLL_ITEM_GAP_WIDTH) * 50 +
            ROLL_ITEM_WIDTH / 2 +
            4 +
            Math.round(Math.random() * ROLL_ITEM_WIDTH),
        );
        setTimeout(() => {
          setTransitionDuration(250);
          setOffset(
            (ROLL_ITEM_WIDTH + ROLL_ITEM_GAP_WIDTH) * 50 +
              ROLL_ITEM_WIDTH / 2 +
              4 +
              (ROLL_ITEM_WIDTH + ROLL_ITEM_GAP_WIDTH) / 2,
          );
          setShowAnimation(true);

          setIsRolling(false);

          resolve(true);
        }, 7500);
      }, 1);
    });

  return {
    roll,
    offset,
    transitionDuration,
    rolledItems,
    showAnimation,
    isRolling,
  };
};
