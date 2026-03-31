import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { loadArticleEngagement } from "@/lib/reader-service";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
  const payload = await loadArticleEngagement(slug, accessToken);

  return Response.json(payload);
}
