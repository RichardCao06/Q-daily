import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { loadAdminArticleEditor } from "@/lib/article-management-service";

export async function GET(request: Request) {
  const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
  const state = await loadAdminArticleEditor(null, accessToken);

  return Response.json(state);
}
