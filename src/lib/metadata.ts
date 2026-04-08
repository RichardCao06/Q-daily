import type { Metadata } from "next";

import type { Article, SiteCategory, SiteTag } from "./qdaily-data";
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

export function buildCollectionMetadata(collection: SiteCategory | SiteTag, kind: "category" | "tag"): Metadata {
  const suffix = kind === "category" ? "栏目页" : "标签页";
  const canonical = buildAbsoluteUrl(collection.href);

  return {
    title: `${collection.name}${suffix} | ${siteName}`,
    description: `浏览 Q-daily 中与${collection.name}相关的${suffix}内容。`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${collection.name}${suffix} | ${siteName}`,
      description: `浏览 Q-daily 中与${collection.name}相关的${suffix}内容。`,
      url: canonical,
      siteName,
      locale: "zh_CN",
      type: "website",
    },
  };
}
