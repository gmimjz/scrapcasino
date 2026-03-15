import { CrateItemResponse } from "../client/api";
import { ROLL_ITEM_GAP_WIDTH, ROLL_ITEM_WIDTH } from "../utils/consts";
import { playCrateSound } from "../utils/functions";
import { generateRandomRoll, generateRandomRollItem } from "../utils/functions";
import { useState } from "react";

export const useRoll = (
  crateItems: CrateItemResponse[],
  initialRolledItems: CrateItemResponse[],
) => {
  const [rolledItems, setRolledItems] =
    useState<CrateItemResponse[]>(initialRolledItems);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const roll = (wonItem?: CrateItemResponse) =>
    new Promise((resolve) => {
      setIsRolling(true);
      setRolledItems(
        generateRandomRoll(
          crateItems,
          wonItem ?? generateRandomRollItem(crateItems),
        ),
      );
      setShowAnimation(false);
      setTransitionDuration(0);
      setOffset(0);
      playCrateSound();
      setTimeout(() => {
        setTransitionDuration(7000);
        const edgeBiasedOffset = Math.round(
          ((1 - Math.cos(Math.random() * Math.PI)) / 2) * ROLL_ITEM_WIDTH,
        );
        setOffset(
          (ROLL_ITEM_WIDTH + ROLL_ITEM_GAP_WIDTH) * 50 +
            ROLL_ITEM_WIDTH / 2 +
            4 +
            edgeBiasedOffset,
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
