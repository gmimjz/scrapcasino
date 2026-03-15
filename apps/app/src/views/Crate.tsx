"use client";

import type {
  CrateItemResponse,
  GetCrateResponse,
  UserResponse,
} from "../client/api";
import { Button } from "../components/Button";
import { CrateItem } from "../components/CrateItem";
import { Roll } from "../components/Roll";
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
import { FaChevronLeft } from "react-icons/fa";
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
    showAnimation,
    isRolling,
  } = useRoll(crateData?.crateItems ?? [], initialRolledItems);

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
          src={crateData.crate.imageUrl}
          alt="crate"
          width={80}
          height={80}
        />
        <p className="font-semibold text-white">{crateData.crate.name}</p>
      </div>
      <div className="flex flex-col">
        {rollsItems.map((rolledItems, i) => (
          <Roll
            key={i}
            offset={offsets[i] ?? 0}
            transitionDuration={transitionDuration}
            crateItems={rolledItems}
            items={crateData.items}
            showAnimation={showAnimation}
          />
        ))}
      </div>
      <div className="relative flex items-center justify-center gap-2">
        <div className="absolute left-0 flex gap-1">
          {CRATE_OPEN_COUNT_OPTIONS.map((countOption) => (
            <button
              key={countOption}
              className={twMerge(
                "h-6 cursor-pointer bg-white/25 px-3 text-xs font-bold text-white",
                count === countOption && "bg-blue",
                isRolling && "opacity-50",
              )}
              onClick={() => setCount(countOption)}
              disabled={isRolling}
            >
              {countOption}
            </button>
          ))}
        </div>
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
