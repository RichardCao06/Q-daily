import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { setAdminArticleStatus } from "@/lib/article-management-service";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
    await setAdminArticleStatus(slug, "published", accessToken);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to publish article",
      },
      { status: 400 },
    );
  }
}
