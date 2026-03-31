import { buildReaderEngagementState, type PublicComment } from "./reader-data";
import { requireBearerToken } from "./auth/session";
import { getSupabaseServerClient } from "./supabase/server";
import type { AccountState } from "@/components/account/account-shell";
import type { AdminState } from "@/components/admin/admin-shell";

type AuthenticatedContext = {
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>;
  user: {
    id: string;
    email?: string | null;
  };
};

export async function requireAuthenticatedSupabase(headers: Headers): Promise<AuthenticatedContext> {
  const accessToken = requireBearerToken(headers);
  const supabase = getSupabaseServerClient({ accessToken });

  if (!supabase) {
    throw new Error("Supabase unavailable");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export async function ensureProfile(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  user: {
    id: string;
    email?: string | null;
  },
) {
  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const displayName = user.email?.split("@")[0] || "Q-daily 读者";

  await db.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? `${user.id}@placeholder.local`,
      display_name: displayName,
    },
    {
      onConflict: "id",
      ignoreDuplicates: false,
    },
  );
}

export async function loadArticleEngagement(
  articleSlug: string,
  accessToken?: string,
) {
  const supabase = getSupabaseServerClient(accessToken ? { accessToken } : {});

  if (!supabase) {
    return {
      configured: false,
      state: buildReaderEngagementState({
        articleSlug,
        likeCount: 0,
        bookmarkCount: 0,
        approvedComments: [],
      }),
    };
  }

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [engagementResult, commentsResult] = await Promise.all([
    db.from("public_article_engagement").select("article_slug,like_count,bookmark_count").eq("article_slug", articleSlug).maybeSingle(),
    db.from("public_article_comments").select("id,author_name,content,created_at").eq("article_slug", articleSlug).order("created_at", { ascending: false }),
  ]);

  let viewer = {
    isLoggedIn: false,
    hasLiked: false,
    hasBookmarked: false,
  };

  if (accessToken) {
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);

    if (user) {
      const [likeResult, bookmarkResult] = await Promise.all([
        db.from("article_likes").select("article_slug").eq("article_slug", articleSlug).eq("user_id", user.id).maybeSingle(),
        db.from("article_bookmarks").select("article_slug").eq("article_slug", articleSlug).eq("user_id", user.id).maybeSingle(),
      ]);

      viewer = {
        isLoggedIn: true,
        hasLiked: Boolean(likeResult.data),
        hasBookmarked: Boolean(bookmarkResult.data),
      };
    }
  }

  const comments: PublicComment[] = ((commentsResult.data ?? []) as Array<{
    id: string;
    author_name: string;
    content: string;
    created_at: string;
  }>).map((comment) => ({
    id: comment.id,
    authorName: comment.author_name,
    content: comment.content,
    createdAt: comment.created_at,
  }));

  return {
    configured: true,
    state: buildReaderEngagementState({
      articleSlug,
      likeCount: engagementResult.data?.like_count ?? 0,
      bookmarkCount: engagementResult.data?.bookmark_count ?? 0,
      approvedComments: comments,
      viewer,
    }),
  };
}

export async function loadAccountState(accessToken?: string): Promise<AccountState> {
  const supabase = getSupabaseServerClient(accessToken ? { accessToken } : {});

  if (!supabase) {
    return {
      configured: false,
      isLoggedIn: false,
      profile: null,
      likes: [],
      bookmarks: [],
      comments: [],
    };
  }

  if (!accessToken) {
    return {
      configured: true,
      isLoggedIn: false,
      profile: null,
      likes: [],
      bookmarks: [],
      comments: [],
    };
  }

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);

  if (!user) {
    return {
      configured: true,
      isLoggedIn: false,
      profile: null,
      likes: [],
      bookmarks: [],
      comments: [],
    };
  }

  await ensureProfile(supabase, { id: user.id, email: user.email });

  const [profileResult, likesResult, bookmarksResult, commentsResult] = await Promise.all([
    db.from("profiles").select("display_name,email").eq("id", user.id).maybeSingle(),
    db.from("article_likes").select("article_slug").eq("user_id", user.id),
    db.from("article_bookmarks").select("article_slug").eq("user_id", user.id),
    db.from("comments").select("id,article_slug,content,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const articleSlugs = Array.from(
    new Set([
      ...((likesResult.data ?? []) as Array<{ article_slug: string }>).map((row) => row.article_slug),
      ...((bookmarksResult.data ?? []) as Array<{ article_slug: string }>).map((row) => row.article_slug),
      ...((commentsResult.data ?? []) as Array<{ article_slug: string }>).map((row) => row.article_slug),
    ]),
  );

  const articlesResult =
    articleSlugs.length > 0 ? await db.from("articles").select("slug,title").in("slug", articleSlugs) : { data: [] as Array<{ slug: string; title: string }> };

  const articlesBySlug = new Map(((articlesResult.data ?? []) as Array<{ slug: string; title: string }>).map((article) => [article.slug, article.title]));

  return {
    configured: true,
    isLoggedIn: true,
    profile: {
      displayName: profileResult.data?.display_name ?? user.email?.split("@")[0] ?? "Q-daily 读者",
      email: profileResult.data?.email ?? user.email ?? "",
    },
    likes: ((likesResult.data ?? []) as Array<{ article_slug: string }>).map((row) => ({
      articleSlug: row.article_slug,
      title: articlesBySlug.get(row.article_slug) ?? row.article_slug,
    })),
    bookmarks: ((bookmarksResult.data ?? []) as Array<{ article_slug: string }>).map((row) => ({
      articleSlug: row.article_slug,
      title: articlesBySlug.get(row.article_slug) ?? row.article_slug,
    })),
    comments: ((commentsResult.data ?? []) as Array<{
      id: string;
      article_slug: string;
      content: string;
      status: "pending" | "approved" | "rejected" | "hidden";
      created_at: string;
    }>).map((row) => ({
      id: row.id,
      articleSlug: row.article_slug,
      articleTitle: articlesBySlug.get(row.article_slug) ?? row.article_slug,
      content: row.content,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
}

export async function loadAdminState(accessToken?: string): Promise<AdminState> {
  const supabase = getSupabaseServerClient(accessToken ? { accessToken } : {});

  if (!supabase) {
    return {
      configured: false,
      isAdmin: false,
      summary: {
        pendingCount: 0,
        approvedCount: 0,
      },
      users: [],
      articles: [],
      comments: [],
    };
  }

  if (!accessToken) {
    return {
      configured: true,
      isAdmin: false,
      summary: {
        pendingCount: 0,
        approvedCount: 0,
      },
      users: [],
      articles: [],
      comments: [],
    };
  }

  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);

  if (!user) {
    return {
      configured: true,
      isAdmin: false,
      summary: {
        pendingCount: 0,
        approvedCount: 0,
      },
      users: [],
      articles: [],
      comments: [],
    };
  }

  const profileResult = await db.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

  if (!profileResult.data?.is_admin) {
    return {
      configured: true,
      isAdmin: false,
      summary: {
        pendingCount: 0,
        approvedCount: 0,
      },
      users: [],
      articles: [],
      comments: [],
    };
  }

  const commentsResult = await db
    .from("comments")
    .select("id,article_slug,user_id,content,status,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingRows = (commentsResult.data ?? []) as Array<{
    id: string;
    article_slug: string;
    user_id: string;
    content: string;
    status: "pending";
    created_at: string;
  }>;
  const articleSlugs = Array.from(new Set(pendingRows.map((row) => row.article_slug)));
  const userIds = Array.from(new Set(pendingRows.map((row) => row.user_id)));

  const [articlesResult, profilesResult, approvedResult, usersResult, articleSummaryResult] = await Promise.all([
    articleSlugs.length > 0 ? db.from("articles").select("slug,title").in("slug", articleSlugs) : { data: [] as Array<{ slug: string; title: string }> },
    userIds.length > 0 ? db.from("profiles").select("id,display_name").in("id", userIds) : { data: [] as Array<{ id: string; display_name: string }> },
    db.from("comments").select("id", { count: "exact", head: true }).eq("status", "approved"),
    db.from("admin_user_overview").select("id,display_name,email,like_count,bookmark_count,comment_count").order("created_at", { ascending: false }).limit(8),
    db
      .from("admin_article_engagement")
      .select("article_slug,title,like_count,bookmark_count,approved_comment_count,pending_comment_count")
      .order("pending_comment_count", { ascending: false })
      .limit(8),
  ]);

  const articleTitles = new Map(((articlesResult.data ?? []) as Array<{ slug: string; title: string }>).map((article) => [article.slug, article.title]));
  const authorNames = new Map(((profilesResult.data ?? []) as Array<{ id: string; display_name: string }>).map((profile) => [profile.id, profile.display_name]));

  return {
    configured: true,
    isAdmin: true,
    summary: {
      pendingCount: pendingRows.length,
      approvedCount: approvedResult.count ?? 0,
    },
    users: ((usersResult.data ?? []) as Array<{
      id: string;
      display_name: string | null;
      email: string | null;
      like_count: number | null;
      bookmark_count: number | null;
      comment_count: number | null;
    }>).map((userRow) => ({
      id: userRow.id,
      displayName: userRow.display_name ?? "Q-daily 读者",
      email: userRow.email ?? "",
      likeCount: userRow.like_count ?? 0,
      bookmarkCount: userRow.bookmark_count ?? 0,
      commentCount: userRow.comment_count ?? 0,
    })),
    articles: ((articleSummaryResult.data ?? []) as Array<{
      article_slug: string | null;
      title: string | null;
      like_count: number | null;
      bookmark_count: number | null;
      approved_comment_count: number | null;
      pending_comment_count: number | null;
    }>).map((articleRow) => ({
      articleSlug: articleRow.article_slug ?? "",
      title: articleRow.title ?? articleRow.article_slug ?? "未命名文章",
      likeCount: articleRow.like_count ?? 0,
      bookmarkCount: articleRow.bookmark_count ?? 0,
      approvedCommentCount: articleRow.approved_comment_count ?? 0,
      pendingCommentCount: articleRow.pending_comment_count ?? 0,
    })),
    comments: pendingRows.map((row) => ({
      id: row.id,
      articleSlug: row.article_slug,
      articleTitle: articleTitles.get(row.article_slug) ?? row.article_slug,
      authorName: authorNames.get(row.user_id) ?? "Q-daily 读者",
      content: row.content,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
}

export async function moderateComment(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  adminUserId: string,
  commentId: string,
  status: "approved" | "rejected" | "hidden",
) {
  // Temporary escape hatch until the Supabase types are regenerated for the new tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const profileResult = await db.from("profiles").select("is_admin").eq("id", adminUserId).maybeSingle();

  if (!profileResult.data?.is_admin) {
    throw new Error("Forbidden");
  }

  await db
    .from("comments")
    .update({
      status,
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", commentId);
}
