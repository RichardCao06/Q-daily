import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Q-daily Recreation",
  description: "A Next.js recreation of the archived QDaily homepage editorial experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
