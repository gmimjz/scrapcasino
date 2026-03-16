import { CrateItemResponse, ItemResponse } from "../client/api";
import {
  ROLL_ITEM_FIRST_INDEX,
  ROLL_ITEM_GAP_WIDTH,
  WIN_ITEM_ROLL_INDEX,
} from "../utils/consts";
import { RollItem } from "./RollItem";
import { useRef } from "react";

type Props = {
  offset: number;
  transitionDuration: number;
  crateItems: CrateItemResponse[];
  items: ItemResponse[];
  showAnimation: boolean;
  itemWidth: number;
};

export const Roll = ({
  offset,
  transitionDuration,
  crateItems,
  items,
  showAnimation,
  itemWidth,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative bg-[#000000] p-2">
      <div className="border-t-red absolute top-0 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-t-16 border-r-10 border-l-10 border-r-transparent border-l-transparent"></div>
      <div className="overflow-x-hidden">
        <div
          className="flex gap-1 pr-[50%] pl-[50%] transition ease-out"
          ref={containerRef}
          style={{
            transform: `translateX(-${offset + ROLL_ITEM_FIRST_INDEX * (itemWidth + ROLL_ITEM_GAP_WIDTH) + itemWidth / 2}px)`,
            transitionDuration: `${transitionDuration}ms`,
          }}
        >
          {crateItems.map((crateItem, index) => {
            const item = items.find((item) => item.id === crateItem.itemId);

            if (!item) return null;

            return (
              <RollItem
                key={index}
                name={item.name}
                imageUrl={item.imageUrl}
                price={crateItem.value}
                showWinAnimation={
                  index === WIN_ITEM_ROLL_INDEX + ROLL_ITEM_FIRST_INDEX + 1
                    ? showAnimation
                    : false
                }
                showLoseAnimation={
                  index !== WIN_ITEM_ROLL_INDEX + ROLL_ITEM_FIRST_INDEX + 1
                    ? showAnimation
                    : false
                }
              />
            );
          })}
        </div>
        <div className="bg-gradient roll-background absolute inset-0"></div>
      </div>
    </div>
  );
};
