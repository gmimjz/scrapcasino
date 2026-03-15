import { formatBalance } from "../utils/functions";
import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  icon: string;
  cost: number;
};

export const Crate = ({ id, name, icon, cost }: Props) => {
  return (
    <Link href={`/crate/${id}`}>
      <div className="flex w-full cursor-pointer flex-col items-center gap-4 bg-white/10 p-2 transition-colors duration-250 hover:bg-white/20">
        <p className="font-semibold text-white">{name}</p>
        <Image src={icon} alt={`${name} crate icon`} height={128} width={128} />
        <button className="flex h-8 w-full cursor-pointer items-center justify-center gap-2 bg-black text-sm font-semibold text-white">
          <Image src="/scrap.svg" alt="scrap" width={16} height={16} />
          {formatBalance(cost)}
        </button>
      </div>
    </Link>
  );
};
