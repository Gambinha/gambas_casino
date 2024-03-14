import { ReactNode } from "react";
import SocketProvider from "@/contexts/socket-context";

export default function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <nav className="h-full flex-auto max-w-60 bg-[#0F1923]"></nav>
      <main className="h-full flex-auto flex flex-col items-center justify-between p-24 bg-[#1A242D]">
        <SocketProvider>{children}</SocketProvider>
      </main>
    </>
  );
}
