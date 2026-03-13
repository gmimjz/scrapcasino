"use client";

import { useChatStore } from "../store/chatStore";
import { MenuItem } from "./MenuItem";
import { FaBoxOpen, FaComments, FaGift } from "react-icons/fa";

export const Navigation = () => {
  const { isOpenOnMobile, setIsOpenOnMobile } = useChatStore();

  return (
    <div className="fixed bottom-0 h-15 w-full gap-4 bg-black lg:hidden">
      <div className="flex h-full items-center justify-evenly bg-white/5">
        <MenuItem
          icon={<FaComments size={24} />}
          isMobile
          onClick={() => setIsOpenOnMobile(!isOpenOnMobile)}
        >
          CHAT
        </MenuItem>
        <MenuItem icon={<FaBoxOpen size={24} />} isMobile href="/crates">
          CRATES
        </MenuItem>
        <MenuItem icon={<FaGift size={24} />} isMobile href="/rewards">
          REWARDS
        </MenuItem>
      </div>
    </div>
  );
};
