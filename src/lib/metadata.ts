import type { Metadata } from "next";

import type { Article, SiteCategory, SiteColumn, SiteTag } from "./qdaily-data";
import { buildAbsoluteUrl, siteDescription, siteName } from "./site-config";

export function buildHomeMetadata(): Metadata {
  return {
    title: siteName,
    description: siteDescription,
    alternates: {
      canonical: buildAbsoluteUrl("/"),
    },
    openGraph: {
      title: siteName,
      description: siteDescription,
      url: buildAbsoluteUrl("/"),
      siteName,
      locale: "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
    },
  };
}

export function buildArticleMetadata(article: Article): Metadata {
  const canonical = buildAbsoluteUrl(`/articles/${article.slug}`);

  return {
    title: `${article.title} | ${article.category.name} | ${siteName}`,
    description: article.excerpt,
    alternates: {
      canonical,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonical,
      siteName,
      locale: "zh_CN",
      type: "article",
      images: article.heroImage
        ? [
            {
              url: buildAbsoluteUrl(article.heroImage.src),
              alt: article.heroImage.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: article.heroImage ? "summary_large_image" : "summary",
      title: article.title,
      description: article.excerpt,
      images: article.heroImage ? [buildAbsoluteUrl(article.heroImage.src)] : undefined,
    },
  };
}

export function buildCollectionMetadata(
  collection: SiteCategory | SiteTag | SiteColumn,
  kind: "category" | "tag" | "column",
): Metadata {
  const suffix = kind === "category" ? "领域页" : kind === "column" ? "栏目页" : "标签页";
  const canonical = buildAbsoluteUrl(collection.href);
  const description = (collection as SiteColumn).description ?? `浏览好有趣日报中与${collection.name}相关的${suffix}内容。`;

  return {
    title: `${collection.name}${suffix} | ${siteName}`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${collection.name}${suffix} | ${siteName}`,
      description,
      url: canonical,
      siteName,
      locale: "zh_CN",
      type: "website",
    },
  };
}
