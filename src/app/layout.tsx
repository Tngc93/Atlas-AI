import type { Metadata } from "next";
import { Barlow, Inter_Tight } from "next/font/google";
import { trCopy } from "@/lib/copy/tr";
import { resolveSiteUrl } from "@/lib/public-site/site-url";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  applicationName: "Atlas AI",
  title: trCopy.app.title,
  description: trCopy.app.description,
  referrer: "no-referrer",
  formatDetection: { telephone: false },
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
