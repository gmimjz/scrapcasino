import { formatBalance, getColorFromPrice } from "../utils/functions";
import Image from "next/image";

type Props = {
  name: string;
  price: number;
  chance: number;
  icon: string;
};

export const CrateItem = ({ name, price, chance, icon }: Props) => {
  return (
    <div className="shrink-0 bg-black duration-250">
      <div
        className={`from-${getColorFromPrice(price)}/25 flex h-full w-full flex-col gap-2 overflow-hidden bg-gradient-to-b to-white/5 p-2`}
      >
        <p className="text-xs font-semibold text-white">
          {(chance / 100).toFixed(2)}%
        </p>
        <div className="flex justify-center">
          <Image className="" src={icon} alt={name} width={80} height={80} />
        </div>
        <p className="overflow-hidden text-center text-xs font-semibold text-ellipsis whitespace-nowrap text-white">
          {name}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
          <Image src="/scrap.svg" alt="scrap" width={16} height={16} />
          {formatBalance(price)}
        </div>
      </div>
    </div>
  );
};
