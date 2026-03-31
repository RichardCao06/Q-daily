import { fireEvent, render, screen } from "@testing-library/react";

import { AdminShell } from "./admin-shell";

describe("AdminShell", () => {
  it("renders the admin comment queue and moderation actions", () => {
    const onModerate = vi.fn();

    render(
      <AdminShell
        state={{
          configured: true,
          isAdmin: true,
          summary: {
            pendingCount: 2,
            approvedCount: 8,
          },
          users: [
            {
              id: "user-1",
              displayName: "读者甲",
              email: "reader-a@example.com",
              likeCount: 3,
              bookmarkCount: 1,
              commentCount: 2,
            },
          ],
          articles: [
            {
              articleSlug: "rebuild-a-newsroom-wall",
              title: "把首页当成品牌封面来设计，而不是普通的信息列表。",
              likeCount: 12,
              bookmarkCount: 4,
              approvedCommentCount: 5,
              pendingCommentCount: 2,
            },
          ],
          comments: [
            {
              id: "comment-1",
              articleSlug: "rebuild-a-newsroom-wall",
              articleTitle: "把首页当成品牌封面来设计，而不是普通的信息列表。",
              authorName: "读者甲",
              content: "这条评论应该先进入审核队列。",
              status: "pending",
              createdAt: "2026-03-31T12:00:00.000Z",
            },
          ],
        }}
        onModerate={onModerate}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "评论审核后台" })).toBeInTheDocument();
    expect(screen.getByText("2 条待审核")).toBeInTheDocument();
    expect(screen.getByText("这条评论应该先进入审核队列。")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "用户概览" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "文章互动统计" })).toBeInTheDocument();
    expect(screen.getAllByText("读者甲")).toHaveLength(2);
    expect(screen.getByText("12 赞 / 4 收藏 / 5 已通过 / 2 待审核")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "通过" }));
    expect(onModerate).toHaveBeenCalledWith("comment-1", "approved");
  });

  it("renders a permission message for non-admin viewers", () => {
    render(
      <AdminShell
        state={{
          configured: true,
          isAdmin: false,
          summary: {
            pendingCount: 0,
            approvedCount: 0,
          },
          users: [],
          articles: [],
          comments: [],
        }}
      />,
    );

    expect(screen.getByText("当前账号没有后台访问权限。")).toBeInTheDocument();
  });
});
