import { formatBalance, getColorFromPrice } from "../utils/functions";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type Props = {
  name: string;
  imageUrl: string;
  price: number;
  showWinAnimation: boolean;
  showLoseAnimation: boolean;
};

export const RollItem = ({
  name,
  imageUrl,
  price,
  showWinAnimation,
  showLoseAnimation,
}: Props) => {
  return (
    <div className="size-[72px] shrink-0 bg-black duration-250 sm:size-[108px]">
      <div
        className={`from-${getColorFromPrice(price)}/25 relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b to-black/25`}
      >
        <Image
          className={twMerge(
            "absolute w-[48px] sm:w-[72px]",
            showWinAnimation &&
              "-translate-y-[12px] scale-90 transition-transform duration-[500ms]",
            showLoseAnimation &&
              "scale-80 transition-transform duration-[500ms]",
          )}
          src={imageUrl}
          alt={name}
          width={80}
          height={80}
        />
        <div
          className={twMerge(
            "flex translate-y-[38px] gap-2 text-sm font-semibold text-white opacity-0 sm:translate-y-[52px] sm:text-base",
            showWinAnimation &&
              "translate-y-[24px] opacity-100 transition-opacity transition-transform duration-[500ms] sm:translate-y-[36px]",
          )}
        >
          <Image src="/scrap.svg" alt="scrap" width={16} height={16} />
          {formatBalance(price)}
        </div>
        <div
          className={twMerge(
            "events-none absolute inset-0 z-10 bg-black opacity-0",
            showLoseAnimation &&
              "opacity-75 transition-opacity duration-[500ms]",
          )}
        ></div>
      </div>
    </div>
  );
};
