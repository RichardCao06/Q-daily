import { render, screen } from "@testing-library/react";

import { getArticlesByCategory, getArticlesByTag, getCategoryBySlug, getTagBySlug } from "@/lib/qdaily-data";

import { CollectionPage } from "./collection-page";

describe("CollectionPage", () => {
  it("renders a category collection with the matching story cards", () => {
    const category = getCategoryBySlug("business");
    const stories = getArticlesByCategory("business");

    expect(category).toBeDefined();

    render(<CollectionPage title={category!.name} description="商业栏目页" stories={stories} />);

    expect(screen.getByRole("banner")).toHaveTextContent("好奇心日报");
    expect(screen.getByRole("link", { name: "搜索" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "关于我们" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "商业" })).toBeInTheDocument();
    expect(screen.getByText("商业栏目页")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(stories.length);
  });

  it("renders a tag collection with the matching story cards", () => {
    const tag = getTagBySlug("hao-wenzhang");
    const stories = getArticlesByTag("hao-wenzhang");

    expect(tag).toBeDefined();

    render(<CollectionPage title={tag!.name} description="好文章标签页" stories={stories} />);

    expect(screen.getByRole("heading", { level: 1, name: "好文章" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(stories.length);
  });

  it("renders card cover images when a story provides them", () => {
    const stories = [
      {
        ...getArticlesByTag("hao-wenzhang")[0]!,
        heroImage: {
          src: "/editorial/avo-paper/paper-firstpage-1.png",
          alt: "AVO 论文首页",
        },
      },
    ];

    render(<CollectionPage title="好文章" description="好文章标签页" stories={stories} />);

    expect(screen.getByAltText("AVO 论文首页")).toBeInTheDocument();
  });
  it("keeps Supabase storage urls unchanged for collection cards", () => {
    const stories = [
      {
        ...getArticlesByTag("hao-wenzhang")[0]!,
        heroImage: {
          src: "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/hero/cover-reward-hacking-title-card.png",
          alt: "Reward hacking 标题卡",
        },
      },
    ];

    render(<CollectionPage title="好文章" description="好文章标签页" stories={stories} />);

    expect(screen.getByAltText("Reward hacking 标题卡")).toHaveAttribute("src", "https://trwasyzmcfcsjvcjndrm.supabase.co/storage/v1/object/public/article-media/articles/reward-hacking-gradient-feature-editorial/hero/cover-reward-hacking-title-card.png");
  });
});
