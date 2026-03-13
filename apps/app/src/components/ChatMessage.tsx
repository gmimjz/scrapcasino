import { PartialUserResponse } from "../client/api";
import { useUser } from "../queries/useUser";
import { Color } from "../utils/enums";
import { calculateLevelAndXpGoal } from "../utils/functions";
import { LevelBadge } from "./LevelBadge";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type Props = {
  id: string;
  user?: PartialUserResponse;
  message: string;
  isRemoved: boolean;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
};

export const ChatMessage = ({
  id,
  user: otherUser,
  message,
  onContextMenu = () => {},
  isRemoved,
}: Props) => {
  const user = useUser();

  const { level } = calculateLevelAndXpGoal(otherUser?.xp ?? 0);

  return (
    <div
      className="animate-slide-in-left flex gap-2 px-2 py-1 hover:bg-white/5"
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, id);
      }}
    >
      <div className={twMerge("flex gap-2", isRemoved && "opacity-25")}>
        <Image
          className="h-[30px] w-[30px] border border-white md:h-[38px] md:w-[38px]"
          src={otherUser?.avatarUrl ?? ""}
          alt={`${otherUser?.username ?? ""} avatar`}
          width={38}
          height={38}
        />
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <LevelBadge color={Color.Blue} level={level} />
            <p className="max-w-[208px] overflow-hidden text-xs font-semibold text-ellipsis text-white">
              {otherUser?.username ?? ""}
            </p>
          </div>
          <p className="max-w-[248px] text-xs break-words whitespace-normal text-white/75">
            {user?.role === "mod" || !isRemoved ? message : "message removed"}
          </p>
        </div>
      </div>
    </div>
  );
};
