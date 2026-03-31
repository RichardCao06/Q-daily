import { getBearerTokenFromHeaders } from "@/lib/auth/session";
import { loadAccountState } from "@/lib/reader-service";

export async function GET(request: Request) {
  const accessToken = getBearerTokenFromHeaders(request.headers) ?? undefined;
  const state = await loadAccountState(accessToken);

  return Response.json(state);
}
