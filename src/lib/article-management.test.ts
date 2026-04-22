import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";

import { buildArticleMutation, isPublishedStatus, joinArticleBody, splitArticleBody } from "./article-management";

describe("article management helpers", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-31T10:15:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("splits textarea content into trimmed paragraphs and removes empty blocks", () => {
    expect(splitArticleBody("第一段。\n\n第二段。\n\n\n第三段。")).toEqual(["第一段。", "第二段。", "第三段。"]);
    expect(joinArticleBody(["第一段。", "第二段。"])).toBe("第一段。\n\n第二段。");
  });

  it("builds a draft mutation payload with normalized metadata and ordered paragraphs", () => {
    const payload = buildArticleMutation({
      title: " 新文章标题 ",
      slug: "new-editorial-story",
      excerpt: " 一段摘要 ",
      authorSlug: "richard-cao",
      categorySlug: "business",
      readingTime: "6 分钟",
      coverAlt: "封面说明",
      heroImageUrl: "https://cdn.example.com/articles/new-editorial-story/hero.jpg",
      heroImageCaption: "图注：新的头图。",
      palette: "linear-gradient(135deg, #111 0%, #333 100%)",
      tagSlugs: ["hao-wenzhang", "hao-guandian"],
      sourceMarkdown: "## 第一节\n\n第一段。\n\n![配图](https://cdn.example.com/articles/new-editorial-story/inline-1.jpg)\n\n*图注：配图说明。*",
      status: "draft",
      publishedAt: "",
    });

    expect(payload.article.status).toBe("draft");
    expect(payload.article.publishedAt).toBeNull();
    expect(payload.article.title).toBe("新文章标题");
    expect(payload.article.excerpt).toBe("一段摘要");
    expect(payload.article.heroImageUrl).toBe("https://cdn.example.com/articles/new-editorial-story/hero.jpg");
    expect(payload.article.heroImageCaption).toBe("图注：新的头图。");
    expect(payload.article.sourceMarkdown).toContain("## 第一节");
    expect(payload.tagSlugs).toEqual(["hao-wenzhang", "hao-guandian"]);
    expect(payload.blocks).toEqual([
      { type: "heading", level: 2, content: "第一节" },
      { type: "paragraph", content: "第一段。" },
      {
        type: "image",
        src: "https://cdn.example.com/articles/new-editorial-story/inline-1.jpg",
        alt: "配图",
        caption: "图注：配图说明。",
      },
    ]);
  });

  it("assigns the current time when publishing without an explicit publish timestamp", () => {
    const payload = buildArticleMutation({
      title: "发布文章",
      slug: "published-editorial-story",
      excerpt: "摘要",
      authorSlug: "richard-cao",
      categorySlug: "culture",
      readingTime: "5 分钟",
      coverAlt: "封面",
      heroImageUrl: "https://cdn.example.com/articles/published-editorial-story/hero.jpg",
      heroImageCaption: "",
      palette: "linear-gradient(135deg, #222 0%, #555 100%)",
      tagSlugs: [],
      sourceMarkdown: "正文第一段。",
      status: "published",
      publishedAt: "",
    });

    expect(payload.article.status).toBe("published");
    expect(payload.article.publishedAt).toBe("2026-03-31T10:15:00.000Z");
  });

  it("rejects invalid slugs and empty article bodies", () => {
    expect(() =>
      buildArticleMutation({
        title: "无效 slug",
        slug: "Invalid Slug",
        excerpt: "摘要",
        authorSlug: "richard-cao",
        categorySlug: "culture",
        readingTime: "5 分钟",
        coverAlt: "封面",
        heroImageUrl: "",
        heroImageCaption: "",
        palette: "linear-gradient(135deg, #222 0%, #555 100%)",
        tagSlugs: [],
        sourceMarkdown: "正文第一段。",
        status: "draft",
        publishedAt: "",
      }),
    ).toThrow("Slug");

    expect(() =>
      buildArticleMutation({
        title: "空正文",
        slug: "empty-body",
        excerpt: "摘要",
        authorSlug: "richard-cao",
        categorySlug: "culture",
        readingTime: "5 分钟",
        coverAlt: "封面",
        heroImageUrl: "",
        heroImageCaption: "",
        palette: "linear-gradient(135deg, #222 0%, #555 100%)",
        tagSlugs: [],
        sourceMarkdown: "   ",
        status: "draft",
        publishedAt: "",
      }),
    ).toThrow("正文");
  });

  it("treats only published content as public", () => {
    expect(isPublishedStatus("published")).toBe(true);
    expect(isPublishedStatus("draft")).toBe(false);
    expect(isPublishedStatus(null)).toBe(false);
  });
});
