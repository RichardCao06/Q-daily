import { render, screen } from "@testing-library/react";

import { getArticleBySlug } from "@/lib/qdaily-data";

import { ArticlePage } from "./article-page";

describe("ArticlePage", () => {
  it("renders a QDaily-like article layout with sidebar modules, comments, and related stories", () => {
    const article = getArticleBySlug("rebuild-a-newsroom-wall");

    expect(article).toBeDefined();

    render(<ArticlePage article={article!} />);

    expect(screen.getByRole("heading", { level: 1, name: article!.title })).toBeInTheDocument();
    expect(screen.getByText(article!.author)).toBeInTheDocument();
    expect(screen.getByText("导读")).toBeInTheDocument();
    expect(screen.getByText("摘录")).toBeInTheDocument();
    expect(screen.getByText("延伸阅读索引")).toBeInTheDocument();
    expect(screen.getAllByText(article!.body[0]!)[0]).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /点赞/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /收藏/ })).toBeInTheDocument();
    expect(screen.getByText("评论会在审核通过后公开显示。")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "评论区" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "编辑推荐" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "相关阅读" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });
});
