import type { Metadata } from "next";
import { trCopy } from "@/lib/copy/tr";
import "./globals.css";

export const metadata: Metadata = {
  title: trCopy.app.title,
  description: trCopy.app.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
