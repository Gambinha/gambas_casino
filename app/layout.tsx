import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gamba`s Casino",
  description: "Simulação de um cassino on-line",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} h-screen flex`}>
        <nav className="h-full flex-auto max-w-60 bg-[#0F1923]"></nav>
        <main className="h-full flex-auto flex flex-col items-center justify-between p-24 bg-[#1A242D]">
          {children}
        </main>
      </body>
    </html>
  );
}
