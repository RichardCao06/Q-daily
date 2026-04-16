import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { previewMarkdownAdminArticle } from "@/lib/article-management-service";

export async function POST(request: Request) {
  try {
    const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
    const payload = await request.json();
    const result = await previewMarkdownAdminArticle(payload, accessToken);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to preview markdown article",
      },
      { status: 400 },
    );
  }
}
