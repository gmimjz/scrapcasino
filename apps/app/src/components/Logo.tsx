import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/">
      <Image
        className="block"
        src="/logo-dark.png"
        alt="logo"
        width={120}
        height={40}
      />
    </Link>
  );
};
