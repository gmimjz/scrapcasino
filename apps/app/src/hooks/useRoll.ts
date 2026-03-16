import { CrateItemResponse } from "../client/api";
import {
  generateRandomRoll,
  generateRandomRollItem,
  generateOffset,
  getCenterOffset,
  getItemWidth,
  playCrateSound,
} from "../utils/functions";
import { useCallback, useRef, useState } from "react";

const EXIT_ANIMATION_DURATION = 250;

export const useRoll = (
  crateItems: CrateItemResponse[],
  initialRolledItems: CrateItemResponse[],
) => {
  const [itemWidth] = useState(getItemWidth);
  const [count, setCountState] = useState(1);
  const [rollsItems, setRollsItems] = useState<CrateItemResponse[][]>([
    initialRolledItems,
  ]);
  const [exitingIndices, setExitingIndices] = useState<Set<number>>(new Set());
  const [offsets, setOffsets] = useState<number[]>([0]);
  const [transitionDuration, setTransitionDuration] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [fastSpin, setFastSpin] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const volumeRef = useRef(volume);
  const rollsLengthRef = useRef(1);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setVolume = useCallback((newVolume: number) => {
    volumeRef.current = newVolume;
    setVolumeState(newVolume);
  }, []);

  const setCount = useCallback(
    (newCount: number) => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
        setExitingIndices(new Set());
      }

      setCountState(newCount);

      const currentLength = rollsLengthRef.current;
      if (currentLength === newCount) return;

      if (currentLength < newCount) {
        rollsLengthRef.current = newCount;
        setRollsItems((prev) => [
          ...prev,
          ...Array.from({ length: newCount - prev.length }, () =>
            generateRandomRoll(crateItems, generateRandomRollItem(crateItems)),
          ),
        ]);
      } else {
        const exitSet = new Set<number>();
        for (let i = newCount; i < currentLength; i++) {
          exitSet.add(i);
        }
        setExitingIndices(exitSet);
        exitTimeoutRef.current = setTimeout(() => {
          rollsLengthRef.current = newCount;
          setRollsItems((prev) => prev.slice(0, newCount));
          setExitingIndices(new Set());
          exitTimeoutRef.current = null;
        }, EXIT_ANIMATION_DURATION);
      }
    },
    [crateItems],
  );

  const roll = (wonItems?: CrateItemResponse[]) =>
    new Promise((resolve) => {
      const spinDuration = fastSpin ? 3000 : 8000;

      setIsRolling(true);
      rollsLengthRef.current = count;
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
        setOffsets(
          Array.from({ length: count }, () => generateOffset(itemWidth)),
        );
        setTimeout(() => {
          setTransitionDuration(250);
          setOffsets(Array(count).fill(getCenterOffset(itemWidth)));
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
    exitingIndices,
    showAnimation,
    isRolling,
    fastSpin,
    setFastSpin,
    volume,
    setVolume,
    itemWidth,
  };
};
