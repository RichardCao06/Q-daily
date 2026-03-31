import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { loadAdminState } from "@/lib/reader-service";

export async function GET(request: Request) {
  const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
  const state = await loadAdminState(accessToken);

  return Response.json(state);
}
