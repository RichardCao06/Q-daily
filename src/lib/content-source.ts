import { cache } from "react";

import { isPublishedStatus } from "./article-management";
import { deserializeStoredArticleBlock, deserializeStoredHeroImage } from "./markdown-import";
import {
  defaultHomePageCopy,
  footerColumns as fallbackFooterColumns,
  type HomePageCopy,
  primaryLinks,
  type Article,
  type ArticleLongformBlock,
  type FeaturePanel,
  type HomePageData,
  type SideFeature,
  type SiteCategory,
  type SiteLink,
  type SiteTag,
  type SpotlightStory,
  utilityLinks,
  type Story,
} from "./qdaily-data";
import type { Database } from "./supabase/database.types";
import { getSupabaseServerClient } from "./supabase/server";

type SiteSnapshot = {
  articles: Article[];
  categories: SiteCategory[];
  tags: SiteTag[];
  spotlightStory: SpotlightStory | null;
  featurePanels: FeaturePanel[];
  sideFeatures: SideFeature[];
  copy: HomePageCopy | null;
};

export type SiteChromeData = {
  channelLinks: SiteLink[];
  primaryLinks: SiteLink[];
  utilityLinks: SiteLink[];
  footerColumns: SiteLink[][];
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
    coverImage: article.heroImage
      ? {
          src: article.heroImage.src,
          alt: article.heroImage.alt,
        }
      : undefined,
  }));
}

export function buildSiteChromeData(categories: SiteCategory[], tags: SiteTag[]): SiteChromeData {
  const channelLinks = [
    ...tags.slice(0, 3).map((item) => ({ label: item.name, href: item.href })),
    ...categories.map((item) => ({ label: item.name, href: item.href })),
  ];

  return {
    channelLinks,
    primaryLinks,
    utilityLinks,
    footerColumns: [
      [
        { label: "首页", href: "/" },
        ...tags.slice(0, 3).map((item) => ({ label: item.name, href: item.href })),
        { label: "好奇心研究所", href: "/labs" },
        { label: "栏目中心", href: "/special-columns" },
      ],
      categories.map((item) => ({ label: item.name, href: item.href })),
      fallbackFooterColumns[2] ?? [],
    ],
  };
}

export function mapHomepageModules(
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
): Pick<SiteSnapshot, "spotlightStory" | "featurePanels" | "sideFeatures" | "copy"> {
  if (moduleRows.length === 0) {
    return {
      spotlightStory: null,
      featurePanels: [],
      sideFeatures: [],
      copy: null,
    };
  }

  const orderedModules = [...moduleRows].sort((left, right) => left.sort_order - right.sort_order);
  const modulesByKey = new Map(orderedModules.map((module) => [module.slot_key, module]));
  const spotlightRow = orderedModules.find((module) => module.slot_key === "home-spotlight" || module.slot_type === "spotlight");
  const featureRows = orderedModules.filter((module) => module.slot_key.startsWith("home-feature-") || module.slot_type === "feature");
  const latestRow = modulesByKey.get("home-side-latest");
  const downloadRow = modulesByKey.get("home-side-download");

  const sideFeatures = [latestRow, downloadRow]
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((row) => ({
      id: row.slot_key,
      category: row.category_label,
      title: row.title,
      excerpt: row.excerpt,
      palette: row.palette,
      href: row.href,
      coverImage: undefined,
    }));

  const curatorNoteRow = modulesByKey.get("home-curator-note");
  const curatorKickerRow = modulesByKey.get("home-curator-kicker");
  const editorMemoRow = modulesByKey.get("home-editor-memo");
  const latestMetaRow = modulesByKey.get("home-latest-meta");
  const loginRow = modulesByKey.get("home-login");
  const loginActionsRow = modulesByKey.get("home-login-actions");
  const feedHeadingRow = modulesByKey.get("home-feed-heading");
  const controlsRow = modulesByKey.get("home-controls");
  const footerBrandRow = modulesByKey.get("home-footer-brand");
  const footerSearchRow = modulesByKey.get("home-search");

  const copy =
    curatorNoteRow &&
    curatorKickerRow &&
    editorMemoRow &&
    latestMetaRow &&
    loginRow &&
    loginActionsRow &&
    feedHeadingRow &&
    controlsRow &&
    footerBrandRow &&
    footerSearchRow
      ? {
          ...defaultHomePageCopy,
          curatorNote: {
            label: curatorNoteRow.category_label,
            text: curatorNoteRow.excerpt,
          },
          curatorKicker: {
            title: curatorKickerRow.title,
            text: curatorKickerRow.excerpt,
          },
          editorMemo: {
            label: editorMemoRow.category_label,
            text: editorMemoRow.excerpt,
          },
          latestMeta: {
            statusLabel: latestMetaRow.category_label,
            updatedAtPrefix: latestMetaRow.title,
          },
          loginModule: {
            eyebrow: loginRow.category_label,
            title: loginRow.title,
            text: loginRow.excerpt,
            href: loginRow.href,
          },
          loginActions: {
            loginLabel: loginActionsRow.category_label,
            registerLabel: loginActionsRow.title,
          },
          feedHeading: {
            eyebrow: feedHeadingRow.category_label,
            title: feedHeadingRow.title,
            hint: feedHeadingRow.excerpt,
          },
          controls: {
            loadMoreLabel: controlsRow.category_label,
            backToTopLabel: controlsRow.title,
          },
          footerBrand: {
            title: footerBrandRow.category_label,
            text: footerBrandRow.title,
          },
          footerSearch: {
            label: footerSearchRow.category_label,
            placeholder: footerSearchRow.title,
            copyright: footerSearchRow.excerpt,
          },
        }
      : null;

  return {
    spotlightStory: spotlightRow
      ? {
          slug: spotlightRow.article_slug ?? spotlightRow.slot_key,
          category: spotlightRow.category_label,
          categoryHref: spotlightRow.href,
          title: spotlightRow.title,
          excerpt: spotlightRow.excerpt,
          palette: spotlightRow.palette,
          coverImage: undefined,
        }
      : null,
    featurePanels: featureRows.map((row) => ({
      id: row.slot_key,
      slug: row.article_slug ?? row.slot_key,
      category: row.category_label,
      title: row.title,
      excerpt: row.excerpt,
      palette: row.palette,
      href: row.href,
      coverImage: undefined,
    })),
    sideFeatures,
    copy,
  };
}

function requireSupabaseServerClient() {
  const client = getSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase is not configured for content reads.");
  }

  return client;
}

const loadSiteSnapshot = cache(async (): Promise<SiteSnapshot> => {
  const supabase = requireSupabaseServerClient();

  const [authorsResult, categoriesResult, tagsResult, articlesResult, blocksResult, articleTagsResult, homepageModulesResult] = await Promise.all([
    supabase.from("authors").select("slug,name"),
    supabase.from("categories").select("slug,name,description"),
    supabase.from("tags").select("slug,name,description"),
    supabase
      .from("articles")
      .select("slug,legacy_id,title,excerpt,published_at,comments_count,likes_count,palette,author_slug,reading_time,cover_alt,category_slug,status,hero_image_url,hero_image_caption")
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
  const articleBlocksBySlug = new Map<string, ArticleLongformBlock[]>();
  const articleHeroImagesBySlug = new Map<string, NonNullable<Article["heroImage"]>>();
  const articleTagsBySlug = new Map<string, string[]>();

  for (const block of blockRows) {
    const heroImage = deserializeStoredHeroImage({
      kind: block.kind,
      content: block.content,
    });

    if (heroImage) {
      articleHeroImagesBySlug.set(block.article_slug, heroImage);
      continue;
    }

    const decodedBlock = deserializeStoredArticleBlock({
      kind: block.kind,
      content: block.content,
    });

    if (!decodedBlock) {
      continue;
    }

    const existingBlocks = articleBlocksBySlug.get(block.article_slug) ?? [];
    existingBlocks.push(decodedBlock);
    articleBlocksBySlug.set(block.article_slug, existingBlocks);
  }

  for (const articleTag of articleTagRows) {
    const existingTags = articleTagsBySlug.get(articleTag.article_slug) ?? [];
    existingTags.push(articleTag.tag_slug);
    articleTagsBySlug.set(articleTag.article_slug, existingTags);
  }

  const siteArticles = articleRows
    .filter((article) => isPublishedStatus(article.status))
    .flatMap((article) => {
      const category = categoriesBySlug.get(article.category_slug);
      if (!category) {
        return [];
      }

      const resolvedTags = (articleTagsBySlug.get(article.slug) ?? [])
        .map((tagSlug) => tagsBySlug.get(tagSlug))
        .filter((tag): tag is SiteTag => Boolean(tag));

      const resolvedBlocks = articleBlocksBySlug.get(article.slug) ?? [];

      return [{
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
        body: resolvedBlocks.filter((block): block is Extract<ArticleLongformBlock, { type: "paragraph" }> => block.type === "paragraph").map((block) => block.content),
        category,
        tags: resolvedTags,
        source: "supabase",
        heroImage: article.hero_image_url
          ? {
              src: article.hero_image_url,
              alt: article.cover_alt,
              caption: article.hero_image_caption ?? undefined,
            }
          : articleHeroImagesBySlug.get(article.slug),
        longformBlocks: resolvedBlocks.length > 0 ? resolvedBlocks : undefined,
      } satisfies Article];
    });

  return {
    articles: siteArticles,
    categories,
    tags,
    ...mapHomepageModules(homepageModuleRows),
  };
});

export async function getSiteChromeData(): Promise<SiteChromeData> {
  const snapshot = await loadSiteSnapshot();
  return buildSiteChromeData(snapshot.categories, snapshot.tags);
}

export async function getHomePageData(): Promise<HomePageData> {
  const snapshot = await loadSiteSnapshot();
  const chrome = buildSiteChromeData(snapshot.categories, snapshot.tags);
  const feedStories = buildFeedStories(snapshot.articles);
  const isEmpty =
    !snapshot.spotlightStory || snapshot.featurePanels.length < 2 || snapshot.sideFeatures.length < 2 || feedStories.length === 0;

  return {
    ...chrome,
    spotlightStory: snapshot.spotlightStory,
    sideFeatures: snapshot.sideFeatures,
    featurePanels: snapshot.featurePanels,
    feedStories,
    copy: snapshot.copy,
    isEmpty: isEmpty || !snapshot.copy,
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
  return snapshot.categories.find((category) => category.slug === slug) ?? null;
}

export async function getTagBySlugFromSource(slug: string) {
  const snapshot = await loadSiteSnapshot();
  return snapshot.tags.find((tag) => tag.slug === slug) ?? null;
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
