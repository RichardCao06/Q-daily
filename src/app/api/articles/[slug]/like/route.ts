import { loadArticleEngagement, requireAuthenticatedSupabase, ensureProfile } from "@/lib/reader-service";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { slug } = await params;

  try {
    const { active } = (await request.json()) as { active?: boolean };
    const auth = await requireAuthenticatedSupabase(request.headers);
    const db = auth.supabase as any;

    await ensureProfile(auth.supabase, auth.user);

    if (active) {
      await db.from("article_likes").upsert({
        article_slug: slug,
        user_id: auth.user.id,
      });
    } else {
      await db.from("article_likes").delete().eq("article_slug", slug).eq("user_id", auth.user.id);
    }

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
