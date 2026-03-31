import { render, screen } from "@testing-library/react";

import { featurePanels, feedStories, sideFeatures, spotlightStory } from "@/lib/qdaily-data";

import { HomePage } from "./home-page";

describe("HomePage", () => {
  it("renders a QDaily-like front page with editorial hero modules and dense footer controls", () => {
    render(<HomePage />);

    expect(screen.getByRole("banner")).toHaveTextContent("好奇心研究所");
    expect(screen.getByText("今日策展")).toBeInTheDocument();
    expect(screen.getByText("像一本被翻开的周末杂志，留下呼吸感，也留下值得细看的新闻。")).toBeInTheDocument();
    expect(screen.getByText("编者手记")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: spotlightStory.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("登录 / 注册").length).toBeGreaterThan(0);
    expect(screen.getByText("最新")).toBeInTheDocument();
    expect(screen.getByText("加载更多")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "搜索文章" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "编辑挑选的首页文章流" })).toBeInTheDocument();
    expect(screen.getByText("不再强调压迫式信息墙，而让每一条内容都像被认真摆放过的展签。")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(
      feedStories.length + sideFeatures.length + featurePanels.length + 1,
    );
    expect(screen.getAllByRole("contentinfo").at(-1)).toHaveTextContent("下载 APP");
  });
});
