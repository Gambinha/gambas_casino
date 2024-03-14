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
        <div className="h-full flex-auto flex flex-col items-center justify-between p-24 bg-[#1A242D]">
          {children}
        </div>
      </body>
    </html>
  );
}
