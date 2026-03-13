"use client";

import { Account } from "../modals/Account";
import { useModalStore } from "../store/modalStore";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const Modal = () => {
  const [selectedTabName, setSelectedTabName] = useState("ACCOUNT");
  const { isOpen, setIsOpen } = useModalStore();

  const tabs = [
    { name: "ACCOUNT", tab: <Account /> },
    { name: "GAME HISTORY", tab: <></> },
  ];

  const selectedTab = tabs.find(({ name }) => selectedTabName === name)?.tab;

  return (
    <>
      <div
        className={twMerge(
          "fixed inset-0 z-30 cursor-pointer bg-black/75 transition-opacity duration-250",
          !isOpen && "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      ></div>
      <div
        className={twMerge(
          "fixed top-[10vh] left-1/2 z-30 w-[calc(100vw-16px)] max-w-[1024px] -translate-x-1/2 bg-black transition-opacity duration-250 md:w-[calc(100vw-32px)]",
          !isOpen && "pointer-events-none opacity-0",
        )}
      >
        <div className="bg-white/5 md:flex">
          <div className="bg-red flex justify-center md:w-[320px] md:flex-col">
            {tabs.map(({ name }) => (
              <button
                className={twMerge(
                  "flex h-12 cursor-pointer items-center justify-end px-4 text-xl font-bold text-white transition-colors duration-250 md:ml-4 md:pl-0",
                  selectedTabName === name && "bg-black/50",
                  selectedTabName !== name && "hover:bg-black/10",
                )}
                key={name}
                onClick={() => setSelectedTabName(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="scrollbar-thin flex h-[calc(80vh-48px)] flex-1 flex-col gap-4 overflow-y-auto px-2 py-4 md:h-[80vh] md:px-4 md:py-8">
            <p className="text-2xl font-bold text-white">{selectedTabName}</p>
            <div className="flex flex-col gap-4">{selectedTab}</div>
          </div>
        </div>
      </div>
    </>
  );
};
