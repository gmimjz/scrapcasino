"use client";

import { useChatStore } from "../store/chatStore";
import { twMerge } from "tailwind-merge";

type Props = {
  children?: React.ReactNode;
};

export const Page = ({ children }: Props) => {
  const { isOpen } = useChatStore();

  return (
    <div className="flex justify-center">
      <div
        className={twMerge(
          "mt-[72px] mb-[60px] w-full max-w-[1024px] transition-all duration-250 lg:mb-0",
          isOpen && "lg:ml-[320px] lg:w-[calc(100%-320px)]",
        )}
      >
        {children}
      </div>
    </div>
  );
};
