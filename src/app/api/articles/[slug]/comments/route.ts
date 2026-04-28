import { COMMENT_MAX_LENGTH } from "@/lib/reader-data";
import { ensureProfile, loadArticleEngagement, requireAuthenticatedSupabase } from "@/lib/reader-service";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { slug } = await params;

  try {
    const { content } = (await request.json()) as { content?: string };
    const trimmedContent = content?.trim();

    if (!trimmedContent) {
      return Response.json(
        {
          error: "评论内容不能为空",
        },
        {
          status: 400,
        },
      );
    }

    if (trimmedContent.length > COMMENT_MAX_LENGTH) {
      return Response.json(
        {
          error: `评论最多 ${COMMENT_MAX_LENGTH} 字`,
        },
        {
          status: 400,
        },
      );
    }

    const auth = await requireAuthenticatedSupabase(request.headers);
    // Temporary escape hatch until the Supabase types are regenerated for the new tables.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = auth.supabase as any;

    await ensureProfile(auth.supabase, auth.user);
    await db.from("comments").insert({
      article_slug: slug,
      user_id: auth.user.id,
      content: trimmedContent,
      status: "pending",
    });

    return Response.json(await loadArticleEngagement(slug, request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")));
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 401,
      },
    );
  }
}
