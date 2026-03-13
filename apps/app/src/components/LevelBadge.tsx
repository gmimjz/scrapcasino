import { Color } from "../utils/enums";

type Props = {
  color: Color;
  level: number;
};

export const LevelBadge = ({ color, level }: Props) => {
  return (
    <div
      className={`h-[14px] w-8 shrink-0 bg-${color} flex items-center justify-center text-xs font-semibold`}
    >
      {level}
    </div>
  );
};
