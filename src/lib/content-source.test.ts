import {
  articles,
  featurePanels,
  getArticleBySlug,
  sideFeatures,
  spotlightStory,
} from "./qdaily-data";
import {
  getAllArticleSlugsFromSource,
  getArticleBySlugFromSource,
  getArticlesForSearchFromSource,
  getHomePageData,
  getRelatedArticlesFromSource,
  mergeArticles,
} from "./content-source";
import { loadMarkdownArticles } from "./markdown-articles";
import type { Article } from "./qdaily-data";

describe("content source", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousAnonKey;
  });

  it("falls back to the local editorial seed when Supabase is not configured", async () => {
    const home = await getHomePageData();
    const markdownArticleCount = (await loadMarkdownArticles()).length;

    expect(home.spotlightStory.slug).toBe(spotlightStory.slug);
    expect(home.sideFeatures).toHaveLength(sideFeatures.length);
    expect(home.featurePanels.map((panel) => panel.slug)).toEqual(featurePanels.map((panel) => panel.slug));
    expect(home.feedStories).toHaveLength(articles.length + markdownArticleCount);
    expect(home.feedStories.some((story) => story.slug === "zhangxue-profile-editorial-reillustrated")).toBe(true);
    expect(home.feedStories.some((story) => story.slug === "avo-paper-feature-editorial")).toBe(true);
    expect(home.feedStories.some((story) => story.slug === "heqiong-profile-editorial")).toBe(true);
  });

  it("resolves article details and related stories through the async repository API", async () => {
    const article = await getArticleBySlugFromSource("rebuild-a-newsroom-wall");
    const related = await getRelatedArticlesFromSource("rebuild-a-newsroom-wall", 3);

    expect(article?.slug).toBe(getArticleBySlug("rebuild-a-newsroom-wall")?.slug);
    expect(related).toHaveLength(3);
    expect(related.every((story) => story.slug !== "rebuild-a-newsroom-wall")).toBe(true);
    expect(related.some((story) => story.slug === "zhangxue-profile-editorial-reillustrated")).toBe(true);
  });

  it("provides search listings and static params from the same source", async () => {
    const searchArticles = await getArticlesForSearchFromSource();
    const slugs = await getAllArticleSlugsFromSource();
    const markdownArticleCount = (await loadMarkdownArticles()).length;

    expect(searchArticles).toHaveLength(articles.length + markdownArticleCount);
    expect(slugs).toContain("rebuild-a-newsroom-wall");
    expect(slugs).toContain("zhangxue-profile-editorial-reillustrated");
    expect(slugs).toContain("avo-paper-feature-editorial");
    expect(slugs).toContain("heqiong-profile-editorial");
    expect(slugs).toHaveLength(articles.length + markdownArticleCount);
  });

  it("merges repository-backed markdown longform stories into the shared content source", async () => {
    const article = await getArticleBySlugFromSource("zhangxue-profile-editorial-reillustrated");
    const searchArticles = await getArticlesForSearchFromSource();
    const slugs = await getAllArticleSlugsFromSource();

    expect(article?.layout).toBe("longform");
    expect(article?.heroImage?.src).toBe("/editorial/zhangxue/hero-media-news-1.jpg");
    expect(article?.longformBlocks?.some((block) => block.type === "image")).toBe(true);
    expect(searchArticles.some((item) => item.slug === "zhangxue-profile-editorial-reillustrated")).toBe(true);
    expect(slugs).toContain("zhangxue-profile-editorial-reillustrated");
  });

  it("prefers Supabase articles over repository markdown when the same slug exists in both sources", () => {
    const supabaseArticle = {
      ...articles[0],
      slug: "shared-slug",
      title: "Supabase version",
      source: "supabase",
      heroImage: {
        src: "https://cdn.example.com/articles/shared-slug/hero.jpg",
        alt: "Supabase hero",
      },
    } satisfies Article;
    const markdownArticle = {
      ...articles[1],
      slug: "shared-slug",
      title: "Markdown version",
      source: "markdown",
      heroImage: {
        src: "/editorial/shared/hero.jpg",
        alt: "Markdown hero",
      },
    } satisfies Article;

    const merged = mergeArticles([supabaseArticle], [markdownArticle]);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.title).toBe("Supabase version");
    expect(merged[0]?.heroImage?.src).toBe("https://cdn.example.com/articles/shared-slug/hero.jpg");
  });
});
