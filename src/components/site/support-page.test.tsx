import { render, screen } from "@testing-library/react";

import { SupportPage } from "./support-page";

describe("SupportPage", () => {
  it("renders a simple support page shell with actions", () => {
    render(
      <SupportPage
        eyebrow="About"
        title="关于我们"
        description="用于承接站内辅助页面。"
        sections={[
          {
            title: "当前阶段",
            body: "首页、文章页、分类页和标签页已经完成首版。",
          },
        ]}
        actions={[
          { label: "返回首页", href: "/" },
          { label: "查看长文章", href: "/tags/longform" },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "关于我们" })).toBeInTheDocument();
    expect(screen.getByText("首页、文章页、分类页和标签页已经完成首版。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页" })).toBeInTheDocument();
  });
});
