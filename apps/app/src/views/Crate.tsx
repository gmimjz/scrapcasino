"use client";

import type { GetCrateResponse, UserResponse } from "../client/api";
import { Button } from "../components/Button";
import { CrateItem } from "../components/CrateItem";
import { Roll } from "../components/Roll";
import { Sound } from "../components/Sound";
import { useRoll } from "../hooks/useRoll";
import { useOpenCrate } from "../mutations/useOpenCrate";
import { useCrate } from "../queries/useCrate";
import { USER_QUERY_KEY, useUser } from "../queries/useUser";
import { Color } from "../utils/enums";
import { formatBalance, playCrateSound } from "../utils/functions";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { FaChevronLeft } from "react-icons/fa";

type Props = {
  id: string;
  initialData: GetCrateResponse | null;
};

export const Crate = ({ id, initialData }: Props) => {
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

  const soundRef = useRef<HTMLSourceElement>(null);

  const {
    roll,
    offset,
    transitionDuration,
    rolledItems,
    showAnimation,
    isRolling,
  } = useRoll(crateData?.crateItems ?? [], () => playCrateSound(soundRef));

  if (!crateData) {
    return <></>;
  }

  const handleOpen = async () => {
    const cost = crateData.crate.cost;
    const wonItem = await openCrate(id);
    updateBalance(-cost);
    updateXp(cost);
    await roll(wonItem);
    updateBalance(wonItem.value);
  };

  const isOpenButtonDisabled =
    isRolling ||
    !user ||
    crateData.crate.cost > user.balance;

  return (
    <div className="mx-2 my-8 flex flex-col gap-4">
      <Sound ref={soundRef} />
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
      <Roll
        offset={offset}
        transitionDuration={transitionDuration}
        crateItems={rolledItems}
        items={crateData.items}
        showAnimation={showAnimation}
      />
      <div className="flex justify-center gap-2">
        <Button
          color={Color.Red}
          onClick={handleOpen}
          disabled={isOpenButtonDisabled}
        >
          <p className="flex gap-1">
            OPEN <Image src="/scrap.svg" alt="scrap" width={16} height={16} />
            {formatBalance(crateData.crate.cost)}
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
