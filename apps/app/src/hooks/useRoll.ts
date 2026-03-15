import { CrateItemResponse } from "../client/api";
import { ROLL_ITEM_CENTER_OFFSET } from "../utils/consts";
import {
  generateRandomRoll,
  generateRandomRollItem,
  generateOffset,
  playCrateSound,
} from "../utils/functions";
import { useCallback, useRef, useState } from "react";

export const useRoll = (
  crateItems: CrateItemResponse[],
  initialRolledItems: CrateItemResponse[],
) => {
  const [count, setCountState] = useState(1);
  const [rollsItems, setRollsItems] = useState<CrateItemResponse[][]>([
    initialRolledItems,
  ]);
  const [offsets, setOffsets] = useState<number[]>([0]);
  const [transitionDuration, setTransitionDuration] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [fastSpin, setFastSpin] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const volumeRef = useRef(volume);

  const setVolume = useCallback((newVolume: number) => {
    volumeRef.current = newVolume;
    setVolumeState(newVolume);
  }, []);

  const setCount = useCallback(
    (newCount: number) => {
      setCountState(newCount);
      setRollsItems((prev) => {
        if (prev.length === newCount) return prev;
        if (prev.length < newCount) {
          return [
            ...prev,
            ...Array.from({ length: newCount - prev.length }, () =>
              generateRandomRoll(
                crateItems,
                generateRandomRollItem(crateItems),
              ),
            ),
          ];
        }
        return prev.slice(0, newCount);
      });
    },
    [crateItems],
  );

  const roll = (wonItems?: CrateItemResponse[]) =>
    new Promise((resolve) => {
      const spinDuration = fastSpin ? 3000 : 8000;

      setIsRolling(true);
      setRollsItems(
        Array.from({ length: count }, (_, i) =>
          generateRandomRoll(
            crateItems,
            wonItems?.[i] ?? generateRandomRollItem(crateItems),
          ),
        ),
      );
      setShowAnimation(false);
      setTransitionDuration(0);
      setOffsets(Array(count).fill(0));
      playCrateSound(spinDuration, () => volumeRef.current);
      setTimeout(() => {
        setTransitionDuration(spinDuration);
        setOffsets(Array.from({ length: count }, () => generateOffset()));
        setTimeout(() => {
          setTransitionDuration(250);
          setOffsets(Array(count).fill(ROLL_ITEM_CENTER_OFFSET));
          setShowAnimation(true);
          setIsRolling(false);
          resolve(true);
        }, spinDuration + 500);
      }, 1);
    });

  return {
    count,
    setCount,
    roll,
    offsets,
    transitionDuration,
    rollsItems,
    showAnimation,
    isRolling,
    fastSpin,
    setFastSpin,
    volume,
    setVolume,
  };
};
