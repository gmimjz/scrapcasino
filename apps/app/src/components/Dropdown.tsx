import { Item } from "./Item";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  close: () => void;
  items: { name: string; onClick: () => void; isHighlighted: boolean }[];
  align?: "left" | "center" | "right";
};

export const Dropdown = ({
  children,
  isOpen,
  close,
  items,
  align = "center",
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  return (
    <div className="relative">
      <div>{children}</div>
      <div
        className={twMerge(
          "pointer-events-none absolute top-[calc(100%+4px)] z-30 w-full min-w-[128px] bg-black opacity-0 duration-250",
          isOpen && "pointer-events-auto opacity-100",
          align === "left" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "right" && "right-0",
        )}
        ref={ref}
      >
        <div className="bg-white/10 p-2">
          {items.map(({ name, onClick, isHighlighted }) => (
            <Item
              key={name}
              onClick={() => {
                onClick();
                close();
              }}
              isHighlighted={isHighlighted}
            >
              {name}
            </Item>
          ))}
        </div>
      </div>
    </div>
  );
};
