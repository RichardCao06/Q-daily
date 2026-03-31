import { buildPublicComments, buildReaderEngagementState } from "./reader-data";

describe("reader data helpers", () => {
  it("keeps only approved comments in the public comment feed and sorts newest first", () => {
    const comments = buildPublicComments(
      [
        {
          id: "comment-1",
          content: "这条评论应该出现",
          created_at: "2026-03-31T09:00:00.000Z",
          status: "approved",
          user_id: "user-1",
        },
        {
          id: "comment-2",
          content: "这条评论仍在审核中",
          created_at: "2026-03-31T10:00:00.000Z",
          status: "pending",
          user_id: "user-2",
        },
        {
          id: "comment-3",
          content: "这条较新的评论应该排在最前面",
          created_at: "2026-03-31T11:00:00.000Z",
          status: "approved",
          user_id: "user-3",
        },
      ],
      new Map([
        ["user-1", "读者甲"],
        ["user-3", "读者乙"],
      ]),
    );

    expect(comments).toEqual([
      expect.objectContaining({
        id: "comment-3",
        authorName: "读者乙",
      }),
      expect.objectContaining({
        id: "comment-1",
        authorName: "读者甲",
      }),
    ]);
  });

  it("builds a reader engagement snapshot with viewer flags and counters", () => {
    const state = buildReaderEngagementState({
      articleSlug: "rebuild-a-newsroom-wall",
      likeCount: 8,
      bookmarkCount: 3,
      approvedComments: [
        {
          id: "comment-1",
          authorName: "读者甲",
          content: "保留一点杂志感会让评论区也更克制。",
          createdAt: "2026-03-31T11:00:00.000Z",
        },
      ],
      viewer: {
        isLoggedIn: true,
        hasLiked: true,
        hasBookmarked: false,
      },
    });

    expect(state.likeCount).toBe(8);
    expect(state.bookmarkCount).toBe(3);
    expect(state.viewer.hasLiked).toBe(true);
    expect(state.viewer.hasBookmarked).toBe(false);
    expect(state.publicComments).toHaveLength(1);
  });
});
