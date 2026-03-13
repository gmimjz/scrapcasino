import { Color } from "../utils/enums";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

type Props = {
  children?: React.ReactNode;
  color: Color;
  icon?: React.ReactNode;
  href?: string;
  type?: HTMLButtonElement["type"];
  disabled?: boolean;
  isHighlighted?: boolean;
  isFullWidth?: boolean;
  onClick?: () => void;
};

export const Button = ({
  children,
  color,
  icon,
  href,
  type = "button",
  disabled = false,
  isHighlighted = true,
  isFullWidth,
  onClick = () => {},
}: Props) => {
  const button = (
    <button
      type={type}
      onClick={() => !disabled && onClick()}
      className={twMerge(
        `h-8 px-2 bg-${color} hover:bg-${color}/75 flex cursor-pointer items-center justify-center gap-2 text-white/50 transition-colors duration-250`,
        isHighlighted && "text-white",
        !isHighlighted && "hover:text-white/75",
        isFullWidth && "w-full",
        disabled && isHighlighted && "bg-white/50 hover:bg-white/50",
        disabled && !isHighlighted && "hover:text-white/50",
      )}
      disabled={disabled}
    >
      {icon}
      {children && <span className="text-sm font-semibold">{children}</span>}
    </button>
  );

  if (href) {
    return <Link href={href}>{button}</Link>;
  }

  return button;
};
