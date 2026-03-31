export type CommentStatus = "pending" | "approved" | "rejected" | "hidden";

export type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  status: CommentStatus;
  user_id: string;
};

export type PublicComment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export type ReaderEngagementState = {
  articleSlug: string;
  likeCount: number;
  bookmarkCount: number;
  publicComments: PublicComment[];
  viewer: {
    isLoggedIn: boolean;
    hasLiked: boolean;
    hasBookmarked: boolean;
  };
};

export function buildPublicComments(rows: CommentRow[], profileNames: Map<string, string>) {
  return rows
    .filter((row) => row.status === "approved")
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .map((row) => ({
      id: row.id,
      authorName: profileNames.get(row.user_id) ?? "Q-daily 读者",
      content: row.content,
      createdAt: row.created_at,
    }));
}

type BuildReaderEngagementStateInput = {
  articleSlug: string;
  likeCount: number;
  bookmarkCount: number;
  approvedComments: PublicComment[];
  viewer?: {
    isLoggedIn?: boolean;
    hasLiked?: boolean;
    hasBookmarked?: boolean;
  };
};

export function buildReaderEngagementState(input: BuildReaderEngagementStateInput): ReaderEngagementState {
  return {
    articleSlug: input.articleSlug,
    likeCount: input.likeCount,
    bookmarkCount: input.bookmarkCount,
    publicComments: input.approvedComments,
    viewer: {
      isLoggedIn: input.viewer?.isLoggedIn ?? false,
      hasLiked: input.viewer?.hasLiked ?? false,
      hasBookmarked: input.viewer?.hasBookmarked ?? false,
    },
  };
}
