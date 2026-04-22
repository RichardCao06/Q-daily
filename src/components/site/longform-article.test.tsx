import { render, screen } from "@testing-library/react";

import { getCategoryBySlug, getTagBySlug, type Article } from "@/lib/qdaily-data";

import { LongformArticlePage } from "./longform-article";

const article = {
  id: "longform-1",
  slug: "zhangxue-profile-editorial-reillustrated",
  title: "张雪不太喜欢“创业者”这个词",
  excerpt: "这不是一个机车品牌如何夺冠的故事。",
  publishedAt: "2026-03-30 10:00",
  comments: 0,
  likes: 0,
  palette: "linear-gradient(135deg, #111 0%, #333 100%)",
  author: "Richard Cao",
  readingTime: "9 分钟",
  coverAlt: "WSBK 葡萄牙站庆祝现场",
  body: ["很多人先认识张雪，不是因为一辆车。"],
  category: getCategoryBySlug("business")!,
  tags: [getTagBySlug("hao-wenzhang")!, getTagBySlug("hao-guandian")!],
  layout: "longform",
  heroImage: {
    src: "/editorial/zhangxue/hero-media-news-1.jpg",
    alt: "WSBK 葡萄牙站庆祝现场",
    caption: "图注：WSBK 葡萄牙站夺冠后的庆祝现场。",
  },
  longformBlocks: [
    { type: "paragraph", content: "很多人先认识张雪，不是因为一辆车。" },
    { type: "image", src: "/editorial/zhangxue/product-500rr-1.png", alt: "500RR", caption: "图注：500RR 官方产品图。" },
    { type: "heading", level: 2, content: "冠军之后，问题才真正开始" },
  ],
} satisfies Article;

describe("LongformArticlePage", () => {
  it("renders longform content in a single markdown-faithful document flow", () => {
    render(<LongformArticlePage article={article} relatedStories={[]} />);

    const title = screen.getByRole("heading", { level: 1, name: article.title });
    const excerpt = screen.getByText(article.excerpt);
    const heroImage = screen.getByAltText("WSBK 葡萄牙站庆祝现场");
    const firstParagraph = screen.getByText("很多人先认识张雪，不是因为一辆车。");
    const inlineImage = screen.getByAltText("500RR");
    const sectionHeading = screen.getByRole("heading", { level: 2, name: "冠军之后，问题才真正开始" });

    const story = firstParagraph.closest("article");

    expect(story).not.toBeNull();
    expect(story).toContainElement(title);
    expect(story).toContainElement(excerpt);
    expect(story).toContainElement(heroImage);
    expect(story).toContainElement(inlineImage);
    expect(story).toContainElement(sectionHeading);

    expect(screen.getByText("图注：WSBK 葡萄牙站夺冠后的庆祝现场。")).toBeInTheDocument();
    expect(screen.getByText("图注：500RR 官方产品图。")).toBeInTheDocument();
    expect(screen.queryByText("栏目")).not.toBeInTheDocument();
    expect(screen.queryByText("标签")).not.toBeInTheDocument();

    expect(title.compareDocumentPosition(heroImage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(heroImage.compareDocumentPosition(firstParagraph) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(firstParagraph.compareDocumentPosition(inlineImage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(inlineImage.compareDocumentPosition(sectionHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
