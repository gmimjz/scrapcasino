"use client";

import { useUser } from "../queries/useUser";
import { Color } from "../utils/enums";
import { calculateLevelAndXpGoal } from "../utils/functions";
import { Balance } from "./Balance";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { LevelBadge } from "./LevelBadge";
import { LevelBar } from "./LevelBar";
import { Logo } from "./Logo";
import { MenuItem } from "./MenuItem";
import { Profile } from "./Profile";
import { useState } from "react";
import { FaBoxOpen, FaGift, FaSteamSymbol, FaWallet } from "react-icons/fa";

export const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = useUser();

  const { level, xp, xpGoal } = calculateLevelAndXpGoal(user?.xp || 0);

  return (
    <div className="fixed z-10 h-[72px] w-full bg-black">
      <div className="flex h-full flex-col justify-center gap-1 bg-white/5 px-2 lg:px-4 lg:py-0">
        {user && (
          <div className="flex gap-2 md:hidden">
            <LevelBadge color={Color.Blue} level={level} />
            <LevelBar xp={xp} xpGoal={xpGoal} />
          </div>
        )}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden gap-4 lg:flex">
              <MenuItem icon={<FaBoxOpen size={16} />} href="/crates">
                CRATES
              </MenuItem>
              <MenuItem icon={<FaGift size={16} />} href="/rewards">
                REWARDS
              </MenuItem>
            </div>
          </div>
          {user ? (
            <div className="gap flex items-center gap-2">
              <div className="hidden gap-2 sm:flex">
                <Button color={Color.Transparent} isHighlighted={false}>
                  WITHDRAW
                </Button>
                <Button color={Color.Red}>DEPOSIT</Button>
              </div>
              <div className="flex">
                <div className="sm:hidden">
                  <Dropdown
                    isOpen={isDropdownOpen}
                    close={() => setIsDropdownOpen(false)}
                    items={[
                      {
                        name: "DEPOSIT",
                        onClick: () => {},
                        isHighlighted: true,
                      },
                      {
                        name: "WITHDRAW",
                        onClick: () => {},
                        isHighlighted: false,
                      },
                    ]}
                    align="center"
                  >
                    <Button
                      icon={<FaWallet size={16} />}
                      color={Color.Green}
                      onClick={() => setIsDropdownOpen(true)}
                    />
                  </Dropdown>
                </div>
                <Balance amount={user.balance} />
              </div>
              <Profile user={user} />
            </div>
          ) : (
            <Button
              color={Color.Red}
              icon={<FaSteamSymbol size={16} />}
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login`}
            >
              LOG IN WITH STEAM
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
