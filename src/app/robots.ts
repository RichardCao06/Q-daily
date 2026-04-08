import type { MetadataRoute } from "next";

import { buildAbsoluteUrl, getSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    host: new URL(getSiteUrl()).host,
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: buildAbsoluteUrl("/sitemap.xml"),
  };
}
