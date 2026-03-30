import type { Metadata } from "next";

import type { Article, SiteCategory, SiteTag } from "./qdaily-data";

const siteName = "Q-daily Recreation";

export function buildHomeMetadata(): Metadata {
  return {
    title: siteName,
    description: "A Next.js recreation of the archived QDaily homepage, article pages, and editorial collections.",
  };
}

export function buildArticleMetadata(article: Article): Metadata {
  return {
    title: `${article.title} | ${article.category.name} | ${siteName}`,
    description: article.excerpt,
  };
}

export function buildCollectionMetadata(collection: SiteCategory | SiteTag, kind: "category" | "tag"): Metadata {
  const suffix = kind === "category" ? "栏目页" : "标签页";

  return {
    title: `${collection.name}${suffix} | ${siteName}`,
    description: `浏览 QDaily 风格复刻站点中的${collection.name}${suffix}内容。`,
  };
}
