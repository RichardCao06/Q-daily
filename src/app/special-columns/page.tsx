import type { Metadata } from "next";

import { ColumnsPage, type ColumnCategorySummary, type FeaturedColumnCategory } from "@/components/site/columns-page";
import { getAllCategorySlugsFromSource, getArticlesByCategoryFromSource, getCategoryBySlugFromSource } from "@/lib/content-source";
import { siteName } from "@/lib/site-config";

type CategorySnapshot = ColumnCategorySummary & {
  featuredDescription: string;
  latestPublishedAt: string | null;
  featuredStory: FeaturedColumnCategory["featuredStory"];
  averageReadingMinutes: number;
};

const categoryCopyBySlug: Record<string, { summary: string; featured: string }> = {
  business: {
    summary: "追踪产品、平台与商业结构变化。",
    featured: "商业栏目关注产品、平台与产业接口如何变化。",
  },
  smart: {
    summary: "跟进 AI、自动化与技术判断。",
    featured: "智能栏目追踪模型、机器人与系统层能力如何进入现实世界。",
  },
  design: {
    summary: "记录视觉系统、界面和媒介表达。",
    featured: "设计栏目从界面、品牌到媒介形式，持续观察表达如何影响判断。",
  },
  fashion: {
    summary: "从品牌、消费与审美情绪观察时尚。",
    featured: "时尚栏目把品牌、消费心理与审美变化放回同一个观察面上。",
  },
  entertainment: {
    summary: "关注内容工业、明星机制与流行叙事。",
    featured: "娱乐栏目关注内容工业、明星机制和流行叙事如何互相放大。",
  },
  culture: {
    summary: "用更慢的节奏看人与叙事如何被塑形。",
    featured: "文化栏目用更慢的节奏看人与叙事如何被塑形。",
  },
  gaming: {
    summary: "观察游戏如何连接技术、商业与文化。",
    featured: "游戏栏目把系统设计、玩家文化与产业判断放在一起看。",
  },
};

function resolveCategoryCopy(slug: string, name: string) {
  return (
    categoryCopyBySlug[slug] ?? {
      summary: `${name}栏目持续追踪这个主题下正在发生的变化。`,
      featured: `${name}栏目把这个主题下最值得持续进入的问题聚合在一起。`,
    }
  );
}

function parseReadingMinutes(readingTime: string) {
  const matched = readingTime.match(/\d+/);
  return matched ? Number(matched[0]) : 0;
}

function toTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  return new Date(value.replace(" ", "T")).getTime();
}

async function loadCategorySnapshots(): Promise<CategorySnapshot[]> {
  const categorySlugs = await getAllCategorySlugsFromSource();

  const snapshots = await Promise.all(
    categorySlugs.map(async (slug) => {
      const category = await getCategoryBySlugFromSource(slug);

      if (!category) {
        return null;
      }

      const stories = await getArticlesByCategoryFromSource(slug);
      const copy = resolveCategoryCopy(category.slug, category.name);
      const averageReadingMinutes =
        stories.length > 0
          ? stories.reduce((total, story) => total + parseReadingMinutes(story.readingTime), 0) / stories.length
          : 0;

      return {
        slug: category.slug,
        name: category.name,
        href: category.href,
        description: copy.summary,
        featuredDescription: copy.featured,
        articleCount: stories.length,
        latestPublishedAt: stories[0]?.publishedAt ?? null,
        featuredStory: stories[0]
          ? {
              slug: stories[0].slug,
              title: stories[0].title,
              excerpt: stories[0].excerpt,
              publishedAt: stories[0].publishedAt,
            }
          : null,
        averageReadingMinutes,
      } satisfies CategorySnapshot;
    }),
  );

  return snapshots.reduce<CategorySnapshot[]>((result, snapshot) => {
    if (snapshot) {
      result.push(snapshot);
    }

    return result;
  }, []);
}

function buildHighlight(categorySnapshots: CategorySnapshot[]) {
  const categoriesWithStories = categorySnapshots.filter((category) => category.articleCount > 0);
  const fallbackName = categorySnapshots[0]?.name ?? "栏目";
  const busiest =
    [...categoriesWithStories].sort((left, right) => right.articleCount - left.articleCount || toTimestamp(right.latestPublishedAt) - toTimestamp(left.latestPublishedAt))[0]
      ?.name ?? fallbackName;
  const reflective =
    [...categoriesWithStories].sort(
      (left, right) =>
        right.averageReadingMinutes - left.averageReadingMinutes ||
        right.articleCount - left.articleCount ||
        left.name.localeCompare(right.name, "zh-CN"),
    )[0]?.name ?? busiest;
  const freshest =
    [...categoriesWithStories].sort((left, right) => toTimestamp(right.latestPublishedAt) - toTimestamp(left.latestPublishedAt))[0]?.name ?? busiest;

  return {
    busiest,
    reflective,
    freshest,
  };
}

export const metadata: Metadata = {
  title: `栏目中心 | ${siteName}`,
  description: "按栏目浏览 Q-daily 内容，先进入主题，再决定读哪篇文章。",
};

export default async function SpecialColumnsRoute() {
  const categorySnapshots = await loadCategorySnapshots();
  const categorySummaries: ColumnCategorySummary[] = categorySnapshots.map((category) => ({
    slug: category.slug,
    name: category.name,
    href: category.href,
    description: category.description,
    articleCount: category.articleCount,
  }));
  const featuredCategories: FeaturedColumnCategory[] = [...categorySnapshots]
    .filter((category) => category.articleCount > 0)
    .sort(
      (left, right) =>
        right.articleCount - left.articleCount || toTimestamp(right.latestPublishedAt) - toTimestamp(left.latestPublishedAt),
    )
    .slice(0, 3)
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      href: category.href,
      description: category.featuredDescription,
      articleCount: category.articleCount,
      featuredStory: category.featuredStory,
    }));

  return (
    <ColumnsPage
      categorySummaries={categorySummaries}
      featuredCategories={featuredCategories}
      highlight={buildHighlight(categorySnapshots)}
    />
  );
}
