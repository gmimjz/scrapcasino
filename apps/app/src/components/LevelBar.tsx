type Props = {
  xp: number;
  xpGoal: number;
};

export const LevelBar = ({ xp, xpGoal }: Props) => {
  return (
    <div className="group relative flex h-[14px] w-full items-center justify-center bg-white/10">
      <div
        className="bg-green absolute left-0 -z-10 h-[14px] h-full"
        style={{ width: `${Math.round((xp / xpGoal) * 100)}%` }}
      ></div>
      <span className="text-xs font-semibold text-black/75 opacity-0 transition-opacity duration-250 group-hover:opacity-100">
        {xp}/{xpGoal} XP
      </span>
    </div>
  );
};
