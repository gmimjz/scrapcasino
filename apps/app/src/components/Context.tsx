import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  x: number;
  y: number;
  visible: boolean;
  children: React.ReactNode;
};

export const Context = forwardRef<HTMLDivElement, Props>(
  ({ x, y, visible, children }, ref) => {
    return (
      <div
        className={twMerge(
          "fixed z-20 w-fit bg-black transition-opacity duration-250",
          !visible && "pointer-events-none opacity-0",
          visible && "opacity-100",
        )}
        style={{ top: `${y}px`, left: `${x}px` }}
        onContextMenu={(e) => e.preventDefault()}
        ref={ref}
      >
        <div className="bg-white/10 p-2">{children}</div>
      </div>
    );
  },
);

Context.displayName = "Context";
