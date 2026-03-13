import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

type Props = {
  selectedItem: string;
  items: string[];
  onChange?: (value: string) => void;
};

export const Select = ({ selectedItem, items, onChange = () => {} }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative flex h-8 w-full items-center bg-white/10">
      <div
        className="flex w-full cursor-pointer items-center justify-between px-2 text-sm text-white/75"
        onClick={() => setIsOpen(true)}
      >
        {selectedItem} <FaChevronDown className="text-white" size={16} />
      </div>
      <div
        className={twMerge(
          "pointer-events-none absolute top-full w-full bg-black opacity-0 duration-250",
          isOpen && "pointer-events-auto opacity-100",
        )}
        ref={ref}
      >
        <div className="bg-white/10 p-2 pt-0">
          {items.map((item) => (
            <div
              className="transform-colors flex h-8 cursor-pointer items-center px-2 text-sm text-white/75 duration-250 hover:bg-white/10"
              key={item}
              onClick={() => {
                onChange(item);
                setIsOpen(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
