"use client";

import type {
  CrateItemResponse,
  GetCrateResponse,
  UserResponse,
} from "../client/api";
import { Button } from "../components/Button";
import { CrateItem } from "../components/CrateItem";
import { Roll } from "../components/Roll";
import { Slider } from "../components/Slider";
import { useRoll } from "../hooks/useRoll";
import { useOpenCrate } from "../mutations/useOpenCrate";
import { useCrate } from "../queries/useCrate";
import { USER_QUERY_KEY, useUser } from "../queries/useUser";
import { CRATE_OPEN_COUNT_OPTIONS } from "../utils/consts";
import { Color } from "../utils/enums";
import { formatBalance } from "../utils/functions";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { FaChevronLeft, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { FaBoltLightning } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

type Props = {
  id: string;
  initialData: GetCrateResponse | null;
  initialRolledItems: CrateItemResponse[];
};

export const Crate = ({ id, initialData, initialRolledItems }: Props) => {
  const crateData = useCrate(id, initialData);
  const user = useUser();
  const { mutateAsync: openCrate } = useOpenCrate();
  const queryClient = useQueryClient();
  const controlsRef = useRef<HTMLDivElement>(null);

  const updateBalance = (delta: number) => {
    queryClient.setQueryData<UserResponse>(USER_QUERY_KEY, (user) => {
      if (!user) return user;
      return {
        ...user,
        balance: user.balance + delta,
      };
    });
  };

  const updateXp = (delta: number) => {
    queryClient.setQueryData<UserResponse>(USER_QUERY_KEY, (user) => {
      if (!user) return user;
      return {
        ...user,
        xp: user.xp + delta,
      };
    });
  };

  const {
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
  } = useRoll(crateData?.crateItems ?? [], initialRolledItems);

  useEffect(() => {
    const timeout = setTimeout(() => {
      controlsRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 250);

    return () => clearTimeout(timeout);
  }, [count]);

  if (!crateData) {
    return <></>;
  }

  const totalCost = crateData.crate.cost * count;

  const handleOpen = async () => {
    const wonItems = await openCrate({ id, count });
    const totalWonValue = wonItems.reduce((sum, item) => sum + item.value, 0);
    updateBalance(-totalCost);
    updateXp(totalCost);
    await roll(wonItems);
    updateBalance(totalWonValue);
  };

  const isOpenButtonDisabled = isRolling || !user || totalCost > user.balance;

  const leftSide = (
    <>
      {CRATE_OPEN_COUNT_OPTIONS.map((countOption) => (
        <button
          key={countOption}
          className={twMerge(
            "size-7 cursor-pointer bg-white/25 text-xs font-bold text-white duration-250 hover:bg-white/50",
            count === countOption && "bg-blue",
            isRolling && "opacity-50",
          )}
          onClick={() => setCount(countOption)}
          disabled={isRolling}
        >
          {countOption}
        </button>
      ))}
    </>
  );

  const rightSide = (
    <>
      <button
        className={twMerge(
          "flex size-7 cursor-pointer items-center justify-center bg-white/25 text-xs font-bold text-white duration-250 hover:bg-white/50",
          fastSpin && "bg-blue",
        )}
        onClick={() => setFastSpin(!fastSpin)}
      >
        <FaBoltLightning size={14} />
      </button>
      <div className="group relative">
        <button
          className="flex size-7 cursor-pointer items-center justify-center bg-white/25 text-xs font-bold text-white duration-250 hover:bg-white/50"
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
        >
          {volume === 0 ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
        </button>
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 translate-y-1 border border-4 border-transparent opacity-0 transition-all duration-250 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 md:-right-1 md:left-auto md:translate-x-0">
          <div className="bg-black">
            <div className="bg-white/25 px-2 py-1">
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={setVolume}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="mx-2 my-8 flex flex-col gap-4">
      <div className="relative flex flex-col items-center gap-2">
        <Link
          href="/crates"
          className="absolute left-0 flex cursor-pointer items-center gap-2 text-sm font-semibold text-white/50 transition-colors duration-250 hover:text-white/75"
        >
          <FaChevronLeft size={16} />
          BACK TO CRATES
        </Link>
        <Image
          className="mt-8 sm:mt-0"
          src={crateData.crate.imageUrl}
          alt="crate"
          width={80}
          height={80}
        />
        <p className="font-semibold text-white">{crateData.crate.name}</p>
      </div>
      <div className="flex flex-col">
        {rollsItems.map((rolledItems, i) => (
          <div
            key={i}
            className={twMerge(
              "overflow-hidden",
              exitingIndices.has(i)
                ? "animate-roll-exit"
                : "animate-roll-enter",
            )}
          >
            <Roll
              offset={offsets[i] ?? 0}
              transitionDuration={transitionDuration}
              crateItems={rolledItems}
              items={crateData.items}
              showAnimation={showAnimation}
              itemWidth={itemWidth}
            />
          </div>
        ))}
      </div>
      <div
        ref={controlsRef}
        className="flex scroll-mb-19 flex-col items-center justify-between gap-4 md:flex-row lg:scroll-mb-4"
      >
        <div className="hidden flex-1 gap-1 md:flex">{leftSide}</div>
        <div className="flex items-center gap-2">
          <Button
            color={Color.Red}
            onClick={handleOpen}
            disabled={isOpenButtonDisabled}
          >
            <p className="flex gap-1">
              OPEN {count} FOR
              <Image src="/scrap.svg" alt="scrap" width={16} height={16} />
              {formatBalance(totalCost)}
            </p>
          </Button>
          <Button
            color={Color.Transparent}
            isHighlighted={false}
            onClick={() => roll()}
            disabled={isRolling}
          >
            DEMO SPIN
          </Button>
        </div>
        <div className="hidden flex-1 justify-end gap-1 md:flex">
          {rightSide}
        </div>
        <div className="flex w-full justify-between gap-1 md:hidden">
          <div className="flex gap-1">{leftSide}</div>
          <div className="flex gap-1">{rightSide}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-white">ITEMS</p>
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
          {crateData.crateItems
            .sort((a, b) => b.value - a.value)
            .map((crateItem) => {
              const item = crateData.items.find(
                (item) => item.id === crateItem.itemId,
              );

              if (!item) return null;

              return (
                <CrateItem
                  key={crateItem.id}
                  name={item.name}
                  icon={item.imageUrl}
                  price={crateItem.value}
                  chance={crateItem.chance}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};
