import { Chat } from "../components/Chat";
import { Header } from "../components/Header";
import { Modal } from "../components/Modal";
import { Navigation } from "../components/Navigation";
import { Page } from "../components/Page";
import { Provider } from "../providers/Provider";
import { fetchUser } from "../utils/functions";
import "./globals.css";
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "sonner";

export const soraSans = Sora({
  variable: "--font-sora-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scrap Casino: The Ultimate Rust Gaming Site",
  description:
    "Scrap Casino is the ultimate Rust gaming site. Try your luck with crates and win big! Earn free scrap through faucet, daily cases and level rewards.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const user = await fetchUser(cookieStore.toString());

  return (
    <html
      lang="en"
      className="scrollbar-thumb-white/10 scrollbar-track-white/10"
    >
      <body
        className={`${soraSans.variable} scrollbar-thin bg-black antialiased`}
      >
        <Provider initialUser={user}>
          <Header />
          <Chat />
          <Page>{children}</Page>
          <Navigation />
          <Modal />
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
