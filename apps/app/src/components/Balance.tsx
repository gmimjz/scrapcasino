import Image from "next/image";

type Props = {
  amount: string;
};

export const Balance = ({ amount }: Props) => {
  return (
    <div className="flex h-8 items-center gap-1 bg-white/5 px-2">
      <Image src="/scrap.svg" alt="scrap" width={16} height={16} />
      <span className="text-xs font-semibold text-white">{amount}</span>
    </div>
  );
};
