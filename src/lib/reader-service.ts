import { buildReaderEngagementState, type PublicComment } from "./reader-data";
import { requireBearerToken } from "./auth/session";
import { getSupabaseServerClient } from "./supabase/server";

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
