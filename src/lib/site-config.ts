const defaultSiteUrl = "https://piggpywithpuppy.cn";

export const siteName = "Q-daily";
export const siteDescription = "Q-daily 的编辑式文章、栏目与专题阅读站点。";

function normalizeSiteUrl(input: string) {
  return input.endsWith("/") ? input.slice(0, -1) : input;
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || defaultSiteUrl);
}

export function buildAbsoluteUrl(pathname = "/") {
  const siteUrl = getSiteUrl();

  if (pathname === "/") {
    return siteUrl;
  }

  return `${siteUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
