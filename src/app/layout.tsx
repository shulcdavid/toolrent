import type { Metadata } from "next";
import { Outfit, Figtree } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rente – Rent tools from your neighbours",
  description: "Peer-to-peer tool rental platform. Find drills, ladders, pressure washers and more near you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f7f6f2] font-figtree text-[#20201f]">{children}</body>
    </html>
  );
}
