"use client";

import { UserResponse } from "../client/api";
import { useLogout } from "../mutations/useLogout";
import { useModalStore } from "../store/modalStore";
import { Color } from "../utils/enums";
import { calculateLevelAndXpGoal } from "../utils/functions";
import { Dropdown } from "./Dropdown";
import { LevelBadge } from "./LevelBadge";
import { LevelBar } from "./LevelBar";
import Image from "next/image";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

type Props = {
  user: UserResponse;
};

export const Profile = ({ user: { avatarUrl, username, xp } }: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { setIsOpen } = useModalStore();
  const { mutate: logout } = useLogout();

  const { level, xp: currentXp, xpGoal } = calculateLevelAndXpGoal(xp);

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      close={() => setIsDropdownOpen(false)}
      items={[
        {
          name: "ACCOUNT",
          onClick: async () => {
            setIsOpen(true);
          },
          isHighlighted: true,
        },
        {
          name: "LOGOUT",
          onClick: async () => {
            logout();
          },
          isHighlighted: true,
        },
      ]}
      align="right"
    >
      <div
        className="group flex cursor-pointer items-center gap-2 p-1 transition-colors duration-250 hover:bg-white/5 md:w-[278px] md:p-2"
        onClick={() => setIsDropdownOpen(true)}
      >
        {avatarUrl && (
          <Image
            className="h-[30px] w-[30px] border border-white md:h-[38px] md:w-[38px]"
            src={avatarUrl}
            alt={`${username} avatar`}
            width={38}
            height={38}
          />
        )}
        <div className="hidden h-10 flex-1 flex-col justify-between md:flex">
          <div className="flex items-center justify-between gap-2">
            <p className="max-w-[152px] overflow-hidden text-sm font-semibold text-ellipsis text-white">
              {username}
            </p>
            <LevelBadge color={Color.Blue} level={level} />
          </div>
          <LevelBar xp={currentXp} xpGoal={xpGoal} />
        </div>
        <FaChevronDown className="text-white" size={16} />
      </div>
    </Dropdown>
  );
};
