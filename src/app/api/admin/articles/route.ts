import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { createAdminArticle, loadAdminArticleList } from "@/lib/article-management-service";

export async function GET(request: Request) {
  const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
  const state = await loadAdminArticleList(accessToken);

  return Response.json(state);
}

export async function POST(request: Request) {
  try {
    const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
    const payload = await request.json();
    const result = await createAdminArticle(payload, accessToken);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to create article",
      },
      { status: 400 },
    );
  }
}
