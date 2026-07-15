import type { Metadata } from "next";
import { Barlow, Inter_Tight } from "next/font/google";
import { trCopy } from "@/lib/copy/tr";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: trCopy.app.title,
  description: trCopy.app.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${barlow.variable} ${interTight.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
