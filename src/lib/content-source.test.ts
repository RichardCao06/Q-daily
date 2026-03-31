import {
  articles,
  featurePanels,
  getArticleBySlug,
  getRelatedArticles,
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
    expect(home.feedStories).toHaveLength(articles.length);
  });

  it("resolves article details and related stories through the async repository API", async () => {
    const article = await getArticleBySlugFromSource("rebuild-a-newsroom-wall");
    const related = await getRelatedArticlesFromSource("rebuild-a-newsroom-wall", 3);

    expect(article?.slug).toBe(getArticleBySlug("rebuild-a-newsroom-wall")?.slug);
    expect(related.map((story) => story.slug)).toEqual(getRelatedArticles("rebuild-a-newsroom-wall", 3).map((story) => story.slug));
  });

  it("provides search listings and static params from the same source", async () => {
    const searchArticles = await getArticlesForSearchFromSource();
    const slugs = await getAllArticleSlugsFromSource();

    expect(searchArticles).toHaveLength(articles.length);
    expect(slugs).toContain("rebuild-a-newsroom-wall");
    expect(slugs).toHaveLength(articles.length);
  });
});
