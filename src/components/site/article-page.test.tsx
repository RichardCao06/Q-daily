import { render, screen } from "@testing-library/react";

import { getArticleBySlug } from "@/lib/qdaily-data";

import { ArticlePage } from "./article-page";

describe("ArticlePage", () => {
  it("renders article details and a related stories section", () => {
    const article = getArticleBySlug("rebuild-a-newsroom-wall");

    expect(article).toBeDefined();

    render(<ArticlePage article={article!} />);

    expect(screen.getByRole("heading", { level: 1, name: article!.title })).toBeInTheDocument();
    expect(screen.getByText(article!.author)).toBeInTheDocument();
    expect(screen.getAllByText(article!.body[0]!)[0]).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "相关阅读" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });
});
