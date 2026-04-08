import type { Metadata } from "next";
import "./globals.css";

import { getSiteUrl, siteDescription, siteName } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: siteName,
  description: siteDescription,
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
