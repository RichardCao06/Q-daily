import { render, screen } from "@testing-library/react";

import { featurePanels, feedStories, sideFeatures, spotlightStory } from "@/lib/qdaily-data";

import { HomePage } from "./home-page";

describe("HomePage", () => {
  it("renders the editorial shell with hero content and article cards", () => {
    render(<HomePage />);

    expect(screen.getByRole("banner")).toHaveTextContent("好奇心研究所");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: spotlightStory.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "编辑挑选的首页文章流" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(
      feedStories.length + sideFeatures.length + featurePanels.length + 1,
    );
    expect(screen.getAllByRole("contentinfo").at(-1)).toHaveTextContent("下载 APP");
  });
});
