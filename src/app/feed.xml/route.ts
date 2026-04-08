import { getAllArticlesFromSource } from "@/lib/content-source";
import { buildAbsoluteUrl, siteDescription, siteName } from "@/lib/site-config";

export async function GET() {
  const articles = await getAllArticlesFromSource();

  const items = articles
    .map(
      (article) => `
        <item>
          <title><![CDATA[${article.title}]]></title>
          <link>${buildAbsoluteUrl(`/articles/${article.slug}`)}</link>
          <description><![CDATA[${article.excerpt}]]></description>
          <pubDate>${new Date(article.publishedAt.replace(" ", "T")).toUTCString()}</pubDate>
        </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${siteName}</title>
        <link>${buildAbsoluteUrl("/")}</link>
        <description>${siteDescription}</description>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
