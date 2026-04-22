import {
  getArticleBySlug,
  getArticlesByCategory,
  getArticlesByTag,
  getRelatedArticles,
  siteCategories,
  siteTags,
} from "./qdaily-data";

describe("qdaily data layer", () => {
  it("resolves article details by slug", () => {
    const article = getArticleBySlug("rebuild-a-newsroom-wall");

    expect(article).toBeDefined();
    expect(article?.title).toContain("品牌封面");
    expect(article?.category.slug).toBe("business");
    expect(article?.tags.map((tag) => tag.slug)).toEqual(["hao-wenzhang"]);
  });

  it("filters category pages with the newest stories first", () => {
    const category = siteCategories.find((item) => item.slug === "culture");
    const stories = getArticlesByCategory("culture");

    expect(category).toBeDefined();
    expect(stories).toHaveLength(2);
    expect(stories[0]?.publishedAt).toBe("2026-03-30 13:40");
    expect(stories.every((story) => story.category.slug === "culture")).toBe(true);
  });

  it("filters tag pages by shared editorial theme", () => {
    const tag = siteTags.find((item) => item.slug === "hao-wenzhang");
    const stories = getArticlesByTag("hao-wenzhang");

    expect(tag).toBeDefined();
    expect(stories.length).toBeGreaterThanOrEqual(3);
    expect(stories.every((story) => story.tags.some((storyTag) => storyTag.slug === "hao-wenzhang"))).toBe(true);
  });

  it("returns related stories without the current article", () => {
    const related = getRelatedArticles("rebuild-a-newsroom-wall");

    expect(related).toHaveLength(3);
    expect(related.some((story) => story.slug === "rebuild-a-newsroom-wall")).toBe(false);
    expect(related[0]?.category.slug).toBe("business");
  });
});
