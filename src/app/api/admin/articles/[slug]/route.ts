import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { loadAdminArticleEditor, updateAdminArticle } from "@/lib/article-management-service";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
    const state = await loadAdminArticleEditor(slug, accessToken);

    return Response.json(state);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to load article",
      },
      { status: 404 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
    const payload = await request.json();
    const result = await updateAdminArticle(slug, payload, accessToken);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to update article",
      },
      { status: 400 },
    );
  }
}
