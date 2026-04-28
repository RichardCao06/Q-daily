import type { MetadataRoute } from "next";

import {
  getAllArticlesFromSource,
  getAllCategorySlugsFromSource,
  getAllColumnSlugsFromSource,
  getAllTagSlugsFromSource,
} from "@/lib/content-source";
import { buildAbsoluteUrl } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categorySlugs, columnSlugs, tagSlugs] = await Promise.all([
    getAllArticlesFromSource(),
    getAllCategorySlugsFromSource(),
    getAllColumnSlugsFromSource(),
    getAllTagSlugsFromSource(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: buildAbsoluteUrl("/"),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: buildAbsoluteUrl("/special-columns"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: buildAbsoluteUrl("/search"),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: buildAbsoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: buildAbsoluteUrl(`/articles/${article.slug}`),
    lastModified: new Date(article.publishedAt.replace(" ", "T")),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: buildAbsoluteUrl(`/categories/${slug}`),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const columnEntries: MetadataRoute.Sitemap = columnSlugs.map((slug) => ({
    url: buildAbsoluteUrl(`/columns/${slug}`),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const tagEntries: MetadataRoute.Sitemap = tagSlugs.map((slug) => ({
    url: buildAbsoluteUrl(`/tags/${slug}`),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticEntries, ...articleEntries, ...columnEntries, ...categoryEntries, ...tagEntries];
}
