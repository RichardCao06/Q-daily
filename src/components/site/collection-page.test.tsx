import { render, screen } from "@testing-library/react";

import { getArticlesByCategory, getArticlesByTag, getCategoryBySlug, getTagBySlug } from "@/lib/qdaily-data";

import { CollectionPage } from "./collection-page";

describe("CollectionPage", () => {
  it("renders a category collection with the matching story cards", () => {
    const category = getCategoryBySlug("business");
    const stories = getArticlesByCategory("business");

    expect(category).toBeDefined();

    render(<CollectionPage title={category!.name} description="商业栏目页" stories={stories} />);

    expect(screen.getByRole("heading", { level: 1, name: "商业" })).toBeInTheDocument();
    expect(screen.getByText("商业栏目页")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(stories.length);
  });

  it("renders a tag collection with the matching story cards", () => {
    const tag = getTagBySlug("longform");
    const stories = getArticlesByTag("longform");

    expect(tag).toBeDefined();

    render(<CollectionPage title={tag!.name} description="长文章标签页" stories={stories} />);

    expect(screen.getByRole("heading", { level: 1, name: "长文章" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(stories.length);
  });
});
