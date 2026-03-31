import { ensureProfile, loadArticleEngagement, requireAuthenticatedSupabase } from "@/lib/reader-service";

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
    // Temporary escape hatch until the Supabase types are regenerated for the new tables.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = auth.supabase as any;

    await ensureProfile(auth.supabase, auth.user);

    if (active) {
      await db.from("article_bookmarks").upsert({
        article_slug: slug,
        user_id: auth.user.id,
      });
    } else {
      await db.from("article_bookmarks").delete().eq("article_slug", slug).eq("user_id", auth.user.id);
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
