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
} from "./content-source";

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

    expect(home.spotlightStory.slug).toBe(spotlightStory.slug);
    expect(home.sideFeatures).toHaveLength(sideFeatures.length);
    expect(home.featurePanels.map((panel) => panel.slug)).toEqual(featurePanels.map((panel) => panel.slug));
    expect(home.feedStories).toHaveLength(articles.length + 1);
    expect(home.feedStories.some((story) => story.slug === "zhangxue-profile-editorial-reillustrated")).toBe(true);
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

    expect(searchArticles).toHaveLength(articles.length + 1);
    expect(slugs).toContain("rebuild-a-newsroom-wall");
    expect(slugs).toContain("zhangxue-profile-editorial-reillustrated");
    expect(slugs).toHaveLength(articles.length + 1);
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
});
