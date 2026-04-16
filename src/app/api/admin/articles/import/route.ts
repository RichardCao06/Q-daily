import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { importMarkdownAdminArticle, syncRepositoryMarkdownArticlesToSupabase } from "@/lib/article-management-service";

export async function POST(request: Request) {
  try {
    const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
    const payload = await request.json();
    const result =
      payload?.markdown
        ? await importMarkdownAdminArticle(payload, accessToken)
        : await syncRepositoryMarkdownArticlesToSupabase(payload, accessToken);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to import markdown article",
      },
      { status: 400 },
    );
  }
}
