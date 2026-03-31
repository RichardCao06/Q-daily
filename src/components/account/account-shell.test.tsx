import { render, screen } from "@testing-library/react";

import { AccountShell } from "./account-shell";

describe("AccountShell", () => {
  it("renders the guest state with a login call to action", () => {
    render(
      <AccountShell
        state={{
          configured: true,
          isLoggedIn: false,
          profile: null,
          likes: [],
          bookmarks: [],
          comments: [],
        }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "个人中心" })).toBeInTheDocument();
    expect(screen.getByText("登录后即可查看你的点赞、收藏和评论进度。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "去登录" })).toHaveAttribute("href", "/account/login");
  });

  it("renders reader activity summaries and moderation statuses", () => {
    render(
      <AccountShell
        state={{
          configured: true,
          isLoggedIn: true,
          profile: {
            displayName: "Richard",
            email: "reader@example.com",
          },
          likes: [
            {
              articleSlug: "rebuild-a-newsroom-wall",
              title: "把首页当成品牌封面来设计，而不是普通的信息列表。",
            },
          ],
          bookmarks: [
            {
              articleSlug: "editorial-rhythm-and-density",
              title: "头部导航像新闻纸页眉，首屏混排像编辑在版面上排兵布阵。",
            },
          ],
          comments: [
            {
              id: "comment-1",
              articleSlug: "rebuild-a-newsroom-wall",
              articleTitle: "把首页当成品牌封面来设计，而不是普通的信息列表。",
              content: "希望首页后续也能支持专题订阅。",
              status: "pending",
              createdAt: "2026-03-31T12:00:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Richard")).toBeInTheDocument();
    expect(screen.getByText("1 篇点赞")).toBeInTheDocument();
    expect(screen.getByText("1 篇收藏")).toBeInTheDocument();
    expect(screen.getByText("待审核")).toBeInTheDocument();
    expect(screen.getByText("希望首页后续也能支持专题订阅。")).toBeInTheDocument();
  });
});
