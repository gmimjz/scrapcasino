import Link from "next/link";
import { twMerge } from "tailwind-merge";

type Props = {
  children: string;
  icon: React.ReactNode;
  isMobile?: boolean;
  href?: string;
  onClick?: () => void;
};

export const MenuItem = ({
  children,
  icon,
  isMobile = false,
  href,
  onClick = () => {},
}: Props) => {
  const button = (
    <button
      className={twMerge(
        "flex cursor-pointer items-center gap-2 text-white transition-colors duration-250 hover:text-white/75",
        isMobile && "flex-col gap-1",
      )}
      onClick={() => onClick()}
    >
      {icon} <span className="text-sm font-semibold">{children}</span>
    </button>
  );

  if (href) {
    return <Link href={href}>{button}</Link>;
  }

  return button;
};
