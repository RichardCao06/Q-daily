import type { Metadata } from "next";

import { HomePage } from "@/components/site/home-page";
import { getHomePageData } from "@/lib/content-source";
import { buildHomeMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildHomeMetadata();
export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getHomePageData();

  return <HomePage data={data} />;
}
