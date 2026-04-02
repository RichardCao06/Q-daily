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
  tags: [getTagBySlug("longform")!, getTagBySlug("newsroom")!],
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
  it("renders the longform hero, image captions, and section rhythm", () => {
    render(<LongformArticlePage article={article} relatedStories={[]} />);

    expect(screen.getByRole("heading", { level: 1, name: article.title })).toBeInTheDocument();
    expect(screen.getByAltText("WSBK 葡萄牙站庆祝现场")).toBeInTheDocument();
    expect(screen.getByText("图注：WSBK 葡萄牙站夺冠后的庆祝现场。")).toBeInTheDocument();
    expect(screen.getByAltText("500RR")).toBeInTheDocument();
    expect(screen.getByText("图注：500RR 官方产品图。")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "冠军之后，问题才真正开始" })).toBeInTheDocument();
    expect(screen.getByText("很多人先认识张雪，不是因为一辆车。")).toBeInTheDocument();
  });
});
