import { cache } from "react";

import {
  articles as fallbackArticles,
  featurePanels as fallbackFeaturePanels,
  getCategoryBySlug,
  getTagBySlug,
  sideFeatures as fallbackSideFeatures,
  siteCategories,
  siteTags,
  spotlightStory as fallbackSpotlightStory,
  type Article,
  type FeaturePanel,
  type HomePageData,
  type SideFeature,
  type SiteCategory,
  type SiteTag,
  type SpotlightStory,
  type Story,
} from "./qdaily-data";
import { isPublishedStatus } from "./article-management";
import type { Database } from "./supabase/database.types";
import { getSupabaseServerClient } from "./supabase/server";

type SiteSnapshot = {
  articles: Article[];
  categories: SiteCategory[];
  tags: SiteTag[];
  spotlightStory: SpotlightStory;
  featurePanels: FeaturePanel[];
  sideFeatures: SideFeature[];
};

type AuthorRow = Database["public"]["Tables"]["authors"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];
type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type ArticleBlockRow = Database["public"]["Tables"]["article_blocks"]["Row"];
type ArticleTagRow = Database["public"]["Tables"]["article_tags"]["Row"];
type HomepageModuleRow = Database["public"]["Tables"]["homepage_modules"]["Row"];

const shanghaiDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function sortByPublishedAt(left: Article, right: Article) {
  return new Date(right.publishedAt.replace(" ", "T")).getTime() - new Date(left.publishedAt.replace(" ", "T")).getTime();
}

function formatPublishedAt(input: string) {
  return shanghaiDateFormatter.format(new Date(input)).replace(",", "");
}

function buildFeedStories(siteArticles: Article[]): Story[] {
  return [...siteArticles].sort(sortByPublishedAt).map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    category: article.category.name,
    categoryHref: article.category.href,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    comments: article.comments,
    likes: article.likes,
    palette: article.palette,
  }));
}

function buildFallbackSnapshot(): SiteSnapshot {
  return {
    articles: [...fallbackArticles],
    categories: [...siteCategories],
    tags: [...siteTags],
    spotlightStory: fallbackSpotlightStory,
    featurePanels: [...fallbackFeaturePanels],
    sideFeatures: [...fallbackSideFeatures],
  };
}

function mapHomepageModules(
  moduleRows: {
    article_slug: string | null;
    category_label: string;
    excerpt: string;
    href: string;
    palette: string;
    slot_key: string;
    slot_type: "feature" | "side_feature" | "spotlight";
    sort_order: number;
    title: string;
  }[],
): Pick<SiteSnapshot, "spotlightStory" | "featurePanels" | "sideFeatures"> {
  if (moduleRows.length === 0) {
    return {
      spotlightStory: fallbackSpotlightStory,
      featurePanels: [...fallbackFeaturePanels],
      sideFeatures: [...fallbackSideFeatures],
    };
  }

  const orderedModules = [...moduleRows].sort((left, right) => left.sort_order - right.sort_order);
  const spotlightRow = orderedModules.find((module) => module.slot_type === "spotlight");
  const featureRows = orderedModules.filter((module) => module.slot_type === "feature");
  const sideFeatureRows = orderedModules.filter((module) => module.slot_type === "side_feature");

  return {
    spotlightStory: spotlightRow
      ? {
          slug: spotlightRow.article_slug ?? fallbackSpotlightStory.slug,
          category: spotlightRow.category_label,
          categoryHref: spotlightRow.href,
          title: spotlightRow.title,
          excerpt: spotlightRow.excerpt,
          palette: spotlightRow.palette,
        }
      : fallbackSpotlightStory,
    featurePanels:
      featureRows.length > 0
        ? featureRows.map((row) => ({
            id: row.slot_key,
            slug: row.article_slug ?? row.slot_key,
            category: row.category_label,
            title: row.title,
            excerpt: row.excerpt,
            palette: row.palette,
            href: row.href,
          }))
        : [...fallbackFeaturePanels],
    sideFeatures:
      sideFeatureRows.length > 0
        ? sideFeatureRows.map((row) => ({
            id: row.slot_key,
            category: row.category_label,
            title: row.title,
            excerpt: row.excerpt,
            palette: row.palette,
            href: row.href,
          }))
        : [...fallbackSideFeatures],
  };
}

const loadSiteSnapshot = cache(async (): Promise<SiteSnapshot> => {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return buildFallbackSnapshot();
  }

  try {
    const [authorsResult, categoriesResult, tagsResult, articlesResult, blocksResult, articleTagsResult, homepageModulesResult] =
      await Promise.all([
        supabase.from("authors").select("slug,name"),
        supabase.from("categories").select("slug,name,description"),
        supabase.from("tags").select("slug,name,description"),
        supabase
          .from("articles")
          .select("slug,legacy_id,title,excerpt,published_at,comments_count,likes_count,palette,author_slug,reading_time,cover_alt,category_slug,status")
          .eq("status", "published"),
        supabase.from("article_blocks").select("article_slug,position,kind,content").order("position", { ascending: true }),
        supabase.from("article_tags").select("article_slug,tag_slug"),
        supabase
          .from("homepage_modules")
          .select("slot_key,slot_type,sort_order,article_slug,category_label,title,excerpt,href,palette")
          .order("sort_order", { ascending: true }),
      ]);

    const results = [authorsResult, categoriesResult, tagsResult, articlesResult, blocksResult, articleTagsResult, homepageModulesResult];
    const failedResult = results.find((result) => result.error);

    if (failedResult?.error) {
      throw failedResult.error;
    }

    const authorRows = (authorsResult.data ?? []) as AuthorRow[];
    const categoryRows = (categoriesResult.data ?? []) as CategoryRow[];
    const tagRows = (tagsResult.data ?? []) as TagRow[];
    const articleRows = (articlesResult.data ?? []) as ArticleRow[];
    const blockRows = (blocksResult.data ?? []) as ArticleBlockRow[];
    const articleTagRows = (articleTagsResult.data ?? []) as ArticleTagRow[];
    const homepageModuleRows = (homepageModulesResult.data ?? []) as HomepageModuleRow[];

    const categories = categoryRows.map((category) => ({
      slug: category.slug,
      name: category.name,
      href: `/categories/${category.slug}`,
    }));
    const tags = tagRows.map((tag) => ({
      slug: tag.slug,
      name: tag.name,
      href: `/tags/${tag.slug}`,
    }));

    const authorsBySlug = new Map(authorRows.map((author) => [author.slug, author.name]));
    const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
    const tagsBySlug = new Map(tags.map((tag) => [tag.slug, tag]));
    const articleBlocksBySlug = new Map<string, string[]>();
    const articleTagsBySlug = new Map<string, string[]>();

    for (const block of blockRows) {
      if (block.kind !== "paragraph") {
        continue;
      }

      const existingBlocks = articleBlocksBySlug.get(block.article_slug) ?? [];
      existingBlocks.push(block.content);
      articleBlocksBySlug.set(block.article_slug, existingBlocks);
    }

    for (const articleTag of articleTagRows) {
      const existingTags = articleTagsBySlug.get(articleTag.article_slug) ?? [];
      existingTags.push(articleTag.tag_slug);
      articleTagsBySlug.set(articleTag.article_slug, existingTags);
    }

    const siteArticles: Article[] = articleRows
      .filter((article) => isPublishedStatus(article.status))
      .map((article) => {
        const category = categoriesBySlug.get(article.category_slug);
        if (!category) {
          return null;
        }

        const resolvedTags = (articleTagsBySlug.get(article.slug) ?? [])
          .map((tagSlug) => tagsBySlug.get(tagSlug))
          .filter((tag): tag is SiteTag => Boolean(tag));

        return {
          id: article.legacy_id ?? article.slug,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          publishedAt: formatPublishedAt(article.published_at ?? new Date().toISOString()),
          comments: article.comments_count,
          likes: article.likes_count,
          palette: article.palette,
          author: authorsBySlug.get(article.author_slug) ?? article.author_slug,
          readingTime: article.reading_time,
          coverAlt: article.cover_alt,
          body: articleBlocksBySlug.get(article.slug) ?? [],
          category,
          tags: resolvedTags,
        } satisfies Article;
      })
      .filter((article): article is Article => Boolean(article));

    const homeModules = mapHomepageModules(homepageModuleRows);

    return {
      articles: siteArticles,
      categories,
      tags,
      ...homeModules,
    };
  } catch {
    return buildFallbackSnapshot();
  }
});

export async function getHomePageData(): Promise<HomePageData> {
  const snapshot = await loadSiteSnapshot();

  return {
    spotlightStory: snapshot.spotlightStory,
    sideFeatures: snapshot.sideFeatures,
    featurePanels: snapshot.featurePanels,
    feedStories: buildFeedStories(snapshot.articles),
  };
}

export async function getAllArticlesFromSource() {
  const snapshot = await loadSiteSnapshot();
  return [...snapshot.articles].sort(sortByPublishedAt);
}

export async function getArticlesForSearchFromSource() {
  return getAllArticlesFromSource();
}

export async function getArticleBySlugFromSource(slug: string) {
  const snapshot = await loadSiteSnapshot();
  return snapshot.articles.find((article) => article.slug === slug) ?? null;
}

export async function getCategoryBySlugFromSource(slug: string) {
  const snapshot = await loadSiteSnapshot();
  return snapshot.categories.find((category) => category.slug === slug) ?? getCategoryBySlug(slug) ?? null;
}

export async function getTagBySlugFromSource(slug: string) {
  const snapshot = await loadSiteSnapshot();
  return snapshot.tags.find((tag) => tag.slug === slug) ?? getTagBySlug(slug) ?? null;
}

export async function getAllArticleSlugsFromSource() {
  const articles = await getAllArticlesFromSource();
  return articles.map((article) => article.slug);
}

export async function getAllCategorySlugsFromSource() {
  const snapshot = await loadSiteSnapshot();
  return snapshot.categories.map((category) => category.slug);
}

export async function getAllTagSlugsFromSource() {
  const snapshot = await loadSiteSnapshot();
  return snapshot.tags.map((tag) => tag.slug);
}

export async function getArticlesByCategoryFromSource(categorySlug: string) {
  const articles = await getAllArticlesFromSource();
  return articles.filter((article) => article.category.slug === categorySlug);
}

export async function getArticlesByTagFromSource(tagSlug: string) {
  const articles = await getAllArticlesFromSource();
  return articles.filter((article) => article.tags.some((tag) => tag.slug === tagSlug));
}

export async function getRelatedArticlesFromSource(slug: string, count = 3) {
  const articles = await getAllArticlesFromSource();
  const current = articles.find((article) => article.slug === slug);

  if (!current) {
    return [];
  }

  return articles
    .filter((article) => article.slug !== slug)
    .map((article) => {
      const sharedTagCount = article.tags.filter((tag) => current.tags.some((currentTag) => currentTag.slug === tag.slug)).length;
      const sameCategoryBoost = article.category.slug === current.category.slug ? 10 : 0;

      return {
        article,
        score: sameCategoryBoost + sharedTagCount,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return sortByPublishedAt(left.article, right.article);
    })
    .slice(0, count)
    .map((item) => item.article);
}
