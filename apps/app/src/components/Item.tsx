import { twMerge } from "tailwind-merge";

type Props = {
  children: string;
  onClick?: () => void;
  isHighlighted?: boolean;
};

export const Item = ({
  children,
  onClick = () => {},
  isHighlighted = false,
}: Props) => {
  return (
    <div
      className={twMerge(
        "flex h-8 cursor-pointer items-center justify-center text-sm font-semibold text-white duration-250 hover:bg-white/5",
        !isHighlighted && "text-white/50 hover:text-white/75",
      )}
      onClick={() => onClick()}
    >
      {children}
    </div>
  );
};
