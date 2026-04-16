import { ensureProfile, requireAuthenticatedSupabase } from "@/lib/reader-service";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedSupabase(request.headers);
    await ensureProfile(supabase, user);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to ensure profile",
      },
      { status: 401 },
    );
  }
}
