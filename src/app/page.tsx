import type { Metadata } from "next";

import { HomePage } from "@/components/site/home-page";
import { buildHomeMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildHomeMetadata();

export default function Home() {
  return <HomePage />;
}
